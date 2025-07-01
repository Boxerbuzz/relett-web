// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a property
 */
contract PropertyToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    struct PropertyDetails {
        string propertyId;
        string landTitleId;
        string propertyAddress;
        uint256 totalValue;
        uint256 minimumInvestment;
        uint256 expectedROI;
        uint256 lockupPeriod;
        bool isActive;
    }

    PropertyDetails public propertyDetails;
    uint256 public constant DECIMALS = 8;
    uint256 public totalPropertyValue;
    uint256 public pricePerToken;
    
    mapping(address => uint256) public investmentAmounts;
    mapping(address => uint256) public lockupEndTime;
    mapping(address => bool) public kycVerified;
    
    address[] public investors;
    uint256 public totalInvestors;
    
    event TokensPurchased(address indexed investor, uint256 amount, uint256 tokens);
    event RevenueDistributed(uint256 totalAmount, uint256 timestamp);
    event InvestorKYCUpdated(address indexed investor, bool verified);
    event PropertyUpdated(string propertyId, uint256 newValue);

    modifier onlyKYCVerified() {
        require(kycVerified[msg.sender], "KYC verification required");
        _;
    }

    modifier lockupPeriodEnded() {
        require(block.timestamp >= lockupEndTime[msg.sender], "Lockup period not ended");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _totalValue,
        PropertyDetails memory _propertyDetails
    ) ERC20(_name, _symbol) {
        _mint(address(this), _totalSupply * 10**DECIMALS);
        totalPropertyValue = _totalValue;
        pricePerToken = _totalValue / _totalSupply;
        propertyDetails = _propertyDetails;
    }

    function purchaseTokens(uint256 _tokenAmount) external payable onlyKYCVerified whenNotPaused nonReentrant {
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(msg.value >= _tokenAmount * pricePerToken, "Insufficient payment");
        require(balanceOf(address(this)) >= _tokenAmount * 10**DECIMALS, "Not enough tokens available");
        
        // Check minimum investment
        require(msg.value >= propertyDetails.minimumInvestment, "Below minimum investment");

        // Transfer tokens from contract to investor
        _transfer(address(this), msg.sender, _tokenAmount * 10**DECIMALS);
        
        // Record investment
        if (investmentAmounts[msg.sender] == 0) {
            investors.push(msg.sender);
            totalInvestors++;
        }
        
        investmentAmounts[msg.sender] += msg.value;
        lockupEndTime[msg.sender] = block.timestamp + propertyDetails.lockupPeriod;
        
        emit TokensPurchased(msg.sender, msg.value, _tokenAmount);
    }

    function transferTokens(address _to, uint256 _amount) external lockupPeriodEnded whenNotPaused {
        require(kycVerified[_to], "Recipient not KYC verified");
        _transfer(msg.sender, _to, _amount);
    }

    function distributeRevenue() external payable onlyOwner {
        require(msg.value > 0, "No revenue to distribute");
        
        uint256 totalSupplyCirculating = totalSupply() - balanceOf(address(this));
        
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorBalance = balanceOf(investor);
            
            if (investorBalance > 0) {
                uint256 share = (msg.value * investorBalance) / totalSupplyCirculating;
                payable(investor).transfer(share);
            }
        }
        
        emit RevenueDistributed(msg.value, block.timestamp);
    }

    function updateKYCStatus(address _investor, bool _verified) external onlyOwner {
        kycVerified[_investor] = _verified;
        emit InvestorKYCUpdated(_investor, _verified);
    }

    function updatePropertyValue(uint256 _newValue) external onlyOwner {
        totalPropertyValue = _newValue;
        pricePerToken = _newValue / (totalSupply() / 10**DECIMALS);
        emit PropertyUpdated(propertyDetails.propertyId, _newValue);
    }

    function getInvestorInfo(address _investor) external view returns (
        uint256 tokenBalance,
        uint256 investmentAmount,
        uint256 lockupEnd,
        bool isKYCVerified
    ) {
        return (
            balanceOf(_investor),
            investmentAmounts[_investor],
            lockupEndTime[_investor],
            kycVerified[_investor]
        );
    }

    function getPropertyInfo() external view returns (PropertyDetails memory) {
        return propertyDetails;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
