// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingRewards is ERC20 {
    address public owner;

    IERC20 public immutable stakingToken;

    uint public rewardRate;
    uint public rewardPerTokenStored;
    uint public lastUpdateTime;
    uint public totalStaked;

    mapping(address => uint) public balanceOfStaked;
    mapping(address => uint) public rewards;
    mapping(address => uint) public userRewardPerTokenPaid;

    event Staked(address indexed user, uint amount);
    event Withdrawn(address indexed user, uint amount);
    event RewardClaim(address indexed user, uint amount);

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    constructor(
        address _stakingToken,
        uint _rewardRate
    ) ERC20("My Token", "MTK") {
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0 amount");
        uint walletBalance = stakingToken.balanceOf(msg.sender);
        require(walletBalance >= _amount, "Insuficient Balance");
        uint allowedBalance = stakingToken.allowance(msg.sender, address(this));
        require(
            allowedBalance >= _amount,
            "Please approve the contract to spend your tokens first."
        );

        bool success = stakingToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(success, "Transfer failed");
        totalStaked += _amount;
        balanceOfStaked[msg.sender] += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Cannot withdraw 0 amount");
        require(balanceOfStaked[msg.sender] >= _amount, "Insuficient balance");

        totalStaked -= _amount;
        balanceOfStaked[msg.sender] -= _amount;

        bool success = stakingToken.transfer(msg.sender, _amount);
        require(success, "Transfer faield");
        emit Withdrawn(msg.sender, _amount);
    }

    function claimReward() external updateReward(msg.sender) {
        uint rewardAmount = rewards[msg.sender];

        if (rewardAmount > 0) {
            rewards[msg.sender] = 0;
            _mint(msg.sender, rewardAmount);
            emit RewardClaim(msg.sender, rewardAmount);
        }
    }

    function rewardPerToken() public view returns (uint) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        uint timePassed = block.timestamp - lastUpdateTime;

        return
            rewardPerTokenStored +
            (timePassed * rewardRate * 1e18) /
            totalStaked;
    }

    function earned(address _account) public view returns (uint) {
        uint rewardDifference = rewardPerToken() -
            userRewardPerTokenPaid[_account];
        uint currentEarnings = (balanceOfStaked[_account] * rewardDifference) /
            1e18;

        return currentEarnings + rewards[_account];
    }
}
