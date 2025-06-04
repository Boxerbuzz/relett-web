
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyToken.sol";
import "./PropertyRegistry.sol";

/**
 * @title PropertyMarketplace
 * @dev Marketplace for trading property tokens
 */
contract PropertyMarketplace is Ownable, ReentrancyGuard, Pausable {
    struct Listing {
        address seller;
        address tokenContract;
        uint256 tokenAmount;
        uint256 pricePerToken;
        uint256 totalPrice;
        uint256 listedAt;
        bool isActive;
    }

    struct Offer {
        address buyer;
        uint256 listingId;
        uint256 offerAmount;
        uint256 pricePerToken;
        uint256 expiresAt;
        bool isActive;
    }

    PropertyRegistry public immutable propertyRegistry;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public listingOffers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    
    uint256 public nextListingId = 1;
    uint256 public nextOfferId = 1;
    uint256 public marketplaceFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event TokensListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenAmount,
        uint256 pricePerToken
    );
    
    event TokensSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 tokenAmount,
        uint256 totalPrice
    );
    
    event OfferMade(
        uint256 indexed listingId,
        uint256 indexed offerId,
        address indexed buyer,
        uint256 offerAmount,
        uint256 pricePerToken
    );
    
    event OfferAccepted(
        uint256 indexed listingId,
        uint256 indexed offerId,
        address indexed seller,
        address buyer
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event OfferCancelled(uint256 indexed offerId);

    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
    }

    function listTokens(
        address _tokenContract,
        uint256 _tokenAmount,
        uint256 _pricePerToken
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(_pricePerToken > 0, "Price must be greater than 0");
        
        PropertyToken token = PropertyToken(_tokenContract);
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        
        // Transfer tokens to marketplace
        token.transferFrom(msg.sender, address(this), _tokenAmount);
        
        uint256 listingId = nextListingId++;
        uint256 totalPrice = _tokenAmount * _pricePerToken / (10**8); // Adjust for decimals
        
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenContract: _tokenContract,
            tokenAmount: _tokenAmount,
            pricePerToken: _pricePerToken,
            totalPrice: totalPrice,
            listedAt: block.timestamp,
            isActive: true
        });
        
        userListings[msg.sender].push(listingId);
        
        emit TokensListed(listingId, msg.sender, _tokenContract, _tokenAmount, _pricePerToken);
        
        return listingId;
    }

    function buyTokens(uint256 _listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy own listing");
        require(msg.value >= listing.totalPrice, "Insufficient payment");
        
        // Calculate fees
        uint256 fee = (listing.totalPrice * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = listing.totalPrice - fee;
        
        // Transfer tokens to buyer
        PropertyToken token = PropertyToken(listing.tokenContract);
        token.transfer(msg.sender, listing.tokenAmount);
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Deactivate listing
        listing.isActive = false;
        
        // Refund excess payment
        if (msg.value > listing.totalPrice) {
            payable(msg.sender).transfer(msg.value - listing.totalPrice);
        }
        
        emit TokensSold(_listingId, listing.seller, msg.sender, listing.tokenAmount, listing.totalPrice);
    }

    function makeOffer(
        uint256 _listingId,
        uint256 _pricePerToken,
        uint256 _expiresIn
    ) external payable whenNotPaused returns (uint256) {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot offer on own listing");
        
        uint256 offerAmount = (listing.tokenAmount * _pricePerToken) / (10**8);
        require(msg.value >= offerAmount, "Insufficient payment for offer");
        
        uint256 offerId = nextOfferId++;
        
        listingOffers[_listingId].push(Offer({
            buyer: msg.sender,
            listingId: _listingId,
            offerAmount: offerAmount,
            pricePerToken: _pricePerToken,
            expiresAt: block.timestamp + _expiresIn,
            isActive: true
        }));
        
        userOffers[msg.sender].push(offerId);
        
        emit OfferMade(_listingId, offerId, msg.sender, offerAmount, _pricePerToken);
        
        return offerId;
    }

    function acceptOffer(uint256 _listingId, uint256 _offerIndex) external whenNotPaused nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        
        Offer storage offer = listingOffers[_listingId][_offerIndex];
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        
        // Calculate fees
        uint256 fee = (offer.offerAmount * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = offer.offerAmount - fee;
        
        // Transfer tokens to buyer
        PropertyToken token = PropertyToken(listing.tokenContract);
        token.transfer(offer.buyer, listing.tokenAmount);
        
        // Transfer payment to seller
        payable(msg.sender).transfer(sellerAmount);
        
        // Deactivate listing and offer
        listing.isActive = false;
        offer.isActive = false;
        
        emit OfferAccepted(_listingId, _offerIndex, msg.sender, offer.buyer);
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        
        // Return tokens to seller
        PropertyToken token = PropertyToken(listing.tokenContract);
        token.transfer(msg.sender, listing.tokenAmount);
        
        listing.isActive = false;
        
        emit ListingCancelled(_listingId);
    }

    function updateMarketplaceFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = _newFee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getListingOffers(uint256 _listingId) external view returns (Offer[] memory) {
        return listingOffers[_listingId];
    }

    function getUserListings(address _user) external view returns (uint256[] memory) {
        return userListings[_user];
    }

    function getUserOffers(address _user) external view returns (uint256[] memory) {
        return userOffers[_user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
