import { Contract,  } from 'ethers';
import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.create();



describe("Staking Reward Contract", function () {
  let stakingContract, mockUSDT;
  let owner, user1, user2;
  let rewardRate;
  beforeEach(async function () {

    [owner, user1, user2] = await ethers.getSigners();
    mockUSDT = await ethers.deployContract('MockUSDT');
    rewardRate = ethers.parseEther("1.0");

    stakingContract = await ethers.deployContract("StakingRewards", [
      await mockUSDT.getAddress(),
      rewardRate
    ])

    await mockUSDT.transfer(user1.address, ethers.parseEther('1000'))
    await mockUSDT.transfer(user2.address, ethers.parseEther('1000'))


  })

  describe("Stake Functionality", function () {
    it("Should fail if user stakes 0 tokens", async function () {

      await expect(stakingContract.connect(user1).stake(0)).to.be.revertedWith("Cannot stake 0 tokens")
    })
  })
});
