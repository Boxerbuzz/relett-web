// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyToken.sol";

/**
 * @title PropertyRegistry
 * @dev Central registry for all tokenized properties
 */
contract PropertyRegistry is Ownable, Pausable {
    struct RegisteredProperty {
        address tokenContract;
        string propertyId;
        string landTitleId;
        address owner;
        uint256 totalValue;
        uint256 totalSupply;
        uint256 createdAt;
        bool isActive;
        bool isVerified;
    }

    mapping(string => RegisteredProperty) public properties;
    mapping(address => string[]) public ownerProperties;
    mapping(address => bool) public authorizedVerifiers;
    
    string[] public allPropertyIds;
    uint256 public totalProperties;
    
    event PropertyRegistered(
        string indexed propertyId,
        address indexed tokenContract,
        address indexed owner,
        uint256 totalValue
    );
    
    event PropertyVerified(string indexed propertyId, address verifier);
    event PropertyStatusUpdated(string indexed propertyId, bool isActive);
    event VerifierAuthorized(address indexed verifier, bool authorized);

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        _;
    }

    modifier propertyExists(string memory _propertyId) {
        require(properties[_propertyId].tokenContract != address(0), "Property not registered");
        _;
    }

    function registerProperty(
        string memory _propertyId,
        string memory _landTitleId,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _totalValue,
        PropertyToken.PropertyDetails memory _details
    ) external whenNotPaused returns (address) {
        require(properties[_propertyId].tokenContract == address(0), "Property already registered");
        
        // Deploy new PropertyToken contract
        PropertyToken newToken = new PropertyToken(
            _name,
            _symbol,
            _totalSupply,
            _totalValue,
            _details
        );
        
        // Transfer ownership to the property owner
        newToken.transferOwnership(msg.sender);
        
        // Register property
        properties[_propertyId] = RegisteredProperty({
            tokenContract: address(newToken),
            propertyId: _propertyId,
            landTitleId: _landTitleId,
            owner: msg.sender,
            totalValue: _totalValue,
            totalSupply: _totalSupply,
            createdAt: block.timestamp,
            isActive: true,
            isVerified: false
        });
        
        ownerProperties[msg.sender].push(_propertyId);
        allPropertyIds.push(_propertyId);
        totalProperties++;
        
        emit PropertyRegistered(_propertyId, address(newToken), msg.sender, _totalValue);
        
        return address(newToken);
    }

    
    function verifyProperty(string memory _propertyId) external onlyVerifier propertyExists(_propertyId) {
        properties[_propertyId].isVerified = true;
        emit PropertyVerified(_propertyId, msg.sender);
    }

    function updatePropertyStatus(string memory _propertyId, bool _isActive) 
        external 
        propertyExists(_propertyId) 
    {
        RegisteredProperty storage property = properties[_propertyId];
        require(msg.sender == property.owner || authorizedVerifiers[msg.sender], "Not authorized");
        
        property.isActive = _isActive;
        emit PropertyStatusUpdated(_propertyId, _isActive);
    }

    function authorizeVerifier(address _verifier, bool _authorized) external onlyOwner {
        authorizedVerifiers[_verifier] = _authorized;
        emit VerifierAuthorized(_verifier, _authorized);
    }

    function getProperty(string memory _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (RegisteredProperty memory) 
    {
        return properties[_propertyId];
    }

    function getOwnerProperties(address _owner) external view returns (string[] memory) {
        return ownerProperties[_owner];
    }

    function getAllProperties() external view returns (string[] memory) {
        return allPropertyIds;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
