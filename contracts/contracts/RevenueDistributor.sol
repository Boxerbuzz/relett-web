// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PropertyToken.sol";

/**
 * @title RevenueDistributor
 * @dev Handles automated revenue distribution to property token holders
 */
contract RevenueDistributor is Ownable, ReentrancyGuard, Pausable {
    
    struct Distribution {
        address tokenContract;
        uint256 totalAmount;
        uint256 distributionDate;
        uint256 totalSupplyAtDistribution;
        string revenueSource;
        bool isDistributed;
    }

    struct Claim {
        uint256 distributionId;
        address holder;
        uint256 amount;
        bool isClaimed;
    }

    mapping(uint256 => Distribution) public distributions;
    mapping(uint256 => mapping(address => Claim)) public claims;
    mapping(address => uint256[]) public holderDistributions;
    mapping(address => bool) public authorizedDistributors;
    
    uint256 public nextDistributionId = 1;
    uint256 public totalDistributions;
    
    event RevenueDistributionCreated(
        uint256 indexed distributionId,
        address indexed tokenContract,
        uint256 totalAmount,
        string revenueSource
    );
    
    event RevenueClaimed(
        uint256 indexed distributionId,
        address indexed holder,
        uint256 amount
    );
    
    event DistributorAuthorized(address indexed distributor, bool authorized);

    modifier onlyAuthorizedDistributor() {
        require(authorizedDistributors[msg.sender], "Not authorized distributor");
        _;
    }

    function authorizeDistributor(address _distributor, bool _authorized) external onlyOwner {
        authorizedDistributors[_distributor] = _authorized;
        emit DistributorAuthorized(_distributor, _authorized);
    }

    function createDistribution(
        address _tokenContract,
        string memory _revenueSource
    ) external payable onlyAuthorizedDistributor whenNotPaused returns (uint256) {
        require(msg.value > 0, "No revenue to distribute");
        
        PropertyToken token = PropertyToken(_tokenContract);
        uint256 totalSupply = token.totalSupply();
        
        uint256 distributionId = nextDistributionId++;
        
        distributions[distributionId] = Distribution({
            tokenContract: _tokenContract,
            totalAmount: msg.value,
            distributionDate: block.timestamp,
            totalSupplyAtDistribution: totalSupply,
            revenueSource: _revenueSource,
            isDistributed: false
        });
        
        totalDistributions++;
        
        emit RevenueDistributionCreated(distributionId, _tokenContract, msg.value, _revenueSource);
        
        return distributionId;
    }

    function calculateClaimAmount(uint256 _distributionId, address _holder) 
        public 
        view 
        returns (uint256) 
    {
        Distribution storage distribution = distributions[_distributionId];
        PropertyToken token = PropertyToken(distribution.tokenContract);
        
        uint256 holderBalance = token.balanceOf(_holder);
        if (holderBalance == 0) return 0;
        
        return (distribution.totalAmount * holderBalance) / distribution.totalSupplyAtDistribution;
    }

    function claimRevenue(uint256 _distributionId) external nonReentrant whenNotPaused {
        Distribution storage distribution = distributions[_distributionId];
        require(distribution.totalAmount > 0, "Distribution not found");
        
        Claim storage claim = claims[_distributionId][msg.sender];
        require(!claim.isClaimed, "Already claimed");
        
        uint256 claimAmount = calculateClaimAmount(_distributionId, msg.sender);
        require(claimAmount > 0, "No revenue to claim");
        
        claim.distributionId = _distributionId;
        claim.holder = msg.sender;
        claim.amount = claimAmount;
        claim.isClaimed = true;
        
        holderDistributions[msg.sender].push(_distributionId);
        
        payable(msg.sender).transfer(claimAmount);
        
        emit RevenueClaimed(_distributionId, msg.sender, claimAmount);
    }

    function claimMultipleDistributions(uint256[] memory _distributionIds) external {
        for (uint256 i = 0; i < _distributionIds.length; i++) {
            if (!claims[_distributionIds[i]][msg.sender].isClaimed) {
                claimRevenue(_distributionIds[i]);
            }
        }
    }

    function getUnclaimedDistributions(address _holder) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory unclaimed = new uint256[](totalDistributions);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= nextDistributionId; i++) {
            if (distributions[i].totalAmount > 0 && 
                !claims[i][_holder].isClaimed && 
                calculateClaimAmount(i, _holder) > 0) {
                unclaimed[count] = i;
                count++;
            }
        }
        
        // Resize array
        assembly {
            mstore(unclaimed, count)
        }
        
        return unclaimed;
    }

    function getHolderDistributions(address _holder) external view returns (uint256[] memory) {
        return holderDistributions[_holder];
    }

    function getTotalUnclaimedAmount(address _holder) external view returns (uint256) {
        uint256 total = 0;
        
        for (uint256 i = 1; i <= nextDistributionId; i++) {
            if (!claims[i][_holder].isClaimed) {
                total += calculateClaimAmount(i, _holder);
            }
        }
        
        return total;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
