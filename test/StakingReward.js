import { Contract } from "ethers";
import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.create();

describe("Staking Reward Contract", function () {
  let stakingContract, mockUSDT;
  let owner, user1, user2;
  let rewardRate;
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    mockUSDT = await ethers.deployContract("MockUSDT");
    rewardRate = ethers.parseEther("1.0");

    stakingContract = await ethers.deployContract("StakingRewards", [
      await mockUSDT.getAddress(),
      rewardRate,
    ]);

    await mockUSDT.transfer(user1.address, ethers.parseEther("1000"));
    await mockUSDT.transfer(user2.address, ethers.parseEther("1000"));
  });

  describe("Stake Functionality", function () {
    it("Should fail if user stakes 0 tokens", async function () {
      await expect(stakingContract.connect(user1).stake(0)).to.be.revertedWith(
        "Cannot stake 0 tokens"
      );
    });
    it("Should successfully stake tokens after approval", async function () {
      const stakeAmount = ethers.parseEther("100");
      const stakingContractAddress = await stakingContract.getAddress();

      await mockUSDT
        .connect(user1)
        .approve(stakingContractAddress, stakeAmount);
      await expect(stakingContract.connect(user1).stake(stakeAmount))
        .to.emit(stakingContract, "Staked")
        .withArgs(user1.address, stakeAmount);
      expect(await stakingContract.balanceOfStaked(user1.address)).to.equal(
        stakeAmount
      );
      expect(await stakingContract.totalStaked()).to.equal(stakeAmount);
    });
  });

  describe("Withdraw Functionality", function () {
    const stakeAmount = ethers.parseEther("100");

    beforeEach(async function () {
      const stakingContractAddress = await stakingContract.getAddress();
      await mockUSDT
        .connect(user1)
        .approve(stakingContractAddress, stakeAmount);
      await stakingContract.connect(user1).stake(stakeAmount);
    });

    it("Should fail if user tries to withdraw more than staked balance", async function () {
      const excessAmount = ethers.parseEther("150");
      await expect(
        stakingContract.connect(user1).withdraw(excessAmount)
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("Should successfully withdraw staked tokens", async function () {
      const withdrawAmount = ethers.parseEther("40");
      await expect(stakingContract.connect(user1).withdraw(withdrawAmount))
        .to.emit(stakingContract, "Withdrawn")
        .withArgs(user1.address, withdrawAmount);

      expect(await stakingContract.balanceOfStaked(user1.address)).to.equal(
        ethers.parseEther("60")
      );
      expect(await stakingContract.totalStaked()).to.equal(
        ethers.parseEther("60")
      );
    });
  });
  describe("Dynamic Rewards Accumulation (EVM Time Travel)", function () {
    it("Should accumulate exact rewards over time", async function () {
      const stakeAmount = ethers.parseEther("100");
      const stakingContractAddress = await stakingContract.getAddress();

      await mockUSDT
        .connect(user1)
        .approve(stakingContractAddress, stakeAmount);
      await stakingContract.connect(user1).stake(stakeAmount);

      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);

      const expectedReward = rewardRate * 10n;
      const currentEarned = await stakingContract.earned(user1.address);

      expect(currentEarned).to.be.closeTo(expectedReward, ethers.parseEther("0.01"))
    });
  });
});
