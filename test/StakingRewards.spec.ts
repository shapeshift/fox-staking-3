import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

import { expect } from "chai";

import { TestERC20 } from "../typechain-types/TestERC20";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StakingRewards } from "../typechain-types/StakingRewards";
import { ethers, deployments } from "hardhat";

import type { Contract, BigNumber } from 'ethers'
import { ecsign } from 'ethereumjs-util'

import { REWARDS_DURATION, expandTo18Decimals, mineBlock, getApprovalDigest } from './utils'


describe('StakingRewards', () => {
  let staker: SignerWithAddress;
  let secondStaker: SignerWithAddress;
  let rewardsToken: TestERC20;
  let stakingToken: TestERC20;
  let stakingRewards: StakingRewards;
  let accounts: SignerWithAddress[];
  
  beforeEach(async () => {
    await deployments.fixture();
    accounts = await ethers.getSigners();
    staker = accounts[1];
    secondStaker = accounts[2];

    const rewardsTokenDeployment = await deployments.get("RewardsToken");
    rewardsToken = new ethers.Contract(
      rewardsTokenDeployment.address,
      rewardsTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;

    const stakingTokenDeployment = await deployments.get("StakingToken");
    stakingToken = new ethers.Contract(
      stakingTokenDeployment.address,
      stakingTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;

    const stakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
    stakingRewards = await stakingRewardsFactory.deploy(accounts[0].address,
      rewardsToken.address,
      stakingToken.address) as StakingRewards;
  })

  it('deploy cost [ @skip-on-coverage ]', async () => {
    const stakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
    const stakingRewardsContract = await stakingRewardsFactory.deploy(accounts[0].address,
      rewardsToken.address,
      stakingToken.address);

    const tx = await stakingRewardsContract.deployed();
    const gasUsed = (await tx.deployTransaction.wait()).gasUsed;
    expect(gasUsed.toString()).to.eq('1478482')
  })

  it('rewardsDuration', async () => {
    const rewardsDuration = await stakingRewards.rewardsDuration()
    expect(rewardsDuration).to.be.eq(REWARDS_DURATION)
  })

  const reward = expandTo18Decimals(1000)
  async function start(reward: BigNumber): Promise<{ startTime: BigNumber; endTime: BigNumber }> {
    // send reward to the contract
    await rewardsToken.transfer(stakingRewards.address, reward)
    // must be called by rewardsDistribution
    await stakingRewards.notifyRewardAmount(reward)

    const startTime: BigNumber = await stakingRewards.lastUpdateTime()
    const endTime: BigNumber = await stakingRewards.periodFinish()
    expect(endTime).to.be.eq(startTime.add(REWARDS_DURATION))
    return { startTime, endTime }
  }

  it('notifyRewardAmount: full', async () => {
    // stake with staker
    const stake = expandTo18Decimals(2)
    await stakingToken.transfer(staker.address, stake)
    await stakingToken.connect(staker).approve(stakingRewards.address, stake)
    await stakingRewards.connect(staker).stake(stake)

    const { endTime } = await start(reward)

    // fast-forward past the reward window
    await mineBlock(ethers.provider, endTime.add(1).toNumber())

    // unstake
    await stakingRewards.connect(staker).exit()
    const stakeEndTime: BigNumber = await stakingRewards.lastUpdateTime()
    expect(stakeEndTime).to.be.eq(endTime)

    const rewardAmount = await rewardsToken.balanceOf(staker.address)
    expect(reward.sub(rewardAmount).lte(reward.div(10000))).to.be.true // ensure result is within .01%
    expect(rewardAmount).to.be.eq(reward.div(REWARDS_DURATION).mul(REWARDS_DURATION))
  })

  it('stakeWithPermit', async () => {
    // creating a temp wallet as the easiest way to have access to a private key for this.
    const temporaryStakerWallet = ethers.Wallet.createRandom().connect(ethers.provider);
    
    // stake with staker
    const stake = expandTo18Decimals(2)
    await stakingToken.transfer(temporaryStakerWallet.address, stake)
    await accounts[1].sendTransaction({to: temporaryStakerWallet.address, value:ethers.utils.parseEther("5000")});

    // get permit
    const nonce = await (stakingToken as Contract).nonces(temporaryStakerWallet.address);
    const deadline = ethers.constants.MaxUint256
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const digest = await getApprovalDigest(
      stakingToken,
      { owner: temporaryStakerWallet.address, spender: stakingRewards.address, value: stake },
      nonce,
      deadline,
      chainId
    )
    
    const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(temporaryStakerWallet.privateKey.slice(2), 'hex'))

    await stakingRewards.connect(temporaryStakerWallet).stakeWithPermit(stake, deadline, v, r, s)

    const { endTime } = await start(reward)

    // fast-forward past the reward window
    await mineBlock(ethers.provider, endTime.add(1).toNumber())

    // unstake
    await stakingRewards.connect(temporaryStakerWallet).exit()
    const stakeEndTime: BigNumber = await stakingRewards.lastUpdateTime()
    expect(stakeEndTime).to.be.eq(endTime)

    const rewardAmount = await rewardsToken.balanceOf(temporaryStakerWallet.address)
    expect(reward.sub(rewardAmount).lte(reward.div(10000))).to.be.true // ensure result is within .01%
    expect(rewardAmount).to.be.eq(reward.div(REWARDS_DURATION).mul(REWARDS_DURATION))
  })

  it('notifyRewardAmount: ~half [ @skip-on-coverage ]', async () => {
    const { startTime, endTime } = await start(reward)

    // fast-forward ~halfway through the reward window
    await mineBlock(ethers.provider, startTime.add(endTime.sub(startTime).div(2)).toNumber())

    // stake with staker
    const stake = expandTo18Decimals(2)
    await stakingToken.transfer(staker.address, stake)
    await stakingToken.connect(staker).approve(stakingRewards.address, stake)
    await stakingRewards.connect(staker).stake(stake)
    const stakeStartTime: BigNumber = await stakingRewards.lastUpdateTime()

    // fast-forward past the reward window
    await mineBlock(ethers.provider, endTime.add(1).toNumber())

    // unstake
    await stakingRewards.connect(staker).exit()
    const stakeEndTime: BigNumber = await stakingRewards.lastUpdateTime()
    expect(stakeEndTime).to.be.eq(endTime)

    const rewardAmount = await rewardsToken.balanceOf(staker.address)
    expect(reward.div(2).sub(rewardAmount).lte(reward.div(2).div(10000))).to.be.true // ensure result is within .01%
    expect(rewardAmount).to.be.eq(reward.div(REWARDS_DURATION).mul(endTime.sub(stakeStartTime)))
  }).retries(2) // TODO investigate flakiness

  it('notifyRewardAmount: two stakers', async () => {
    // stake with first staker
    const stake = expandTo18Decimals(2)
    await stakingToken.transfer(staker.address, stake)
    await stakingToken.connect(staker).approve(stakingRewards.address, stake)
    await stakingRewards.connect(staker).stake(stake)

    const { startTime, endTime } = await start(reward)

    // fast-forward ~halfway through the reward window
    await mineBlock(ethers.provider, startTime.add(endTime.sub(startTime).div(2)).toNumber())

    // stake with second staker
    await stakingToken.transfer(secondStaker.address, stake)
    await stakingToken.connect(secondStaker).approve(stakingRewards.address, stake)
    await stakingRewards.connect(secondStaker).stake(stake)

    // fast-forward past the reward window
    await mineBlock(ethers.provider, endTime.add(1).toNumber())

    // unstake
    await stakingRewards.connect(staker).exit()
    const stakeEndTime: BigNumber = await stakingRewards.lastUpdateTime()
    expect(stakeEndTime).to.be.eq(endTime)
    await stakingRewards.connect(secondStaker).exit()

    const rewardAmount = await rewardsToken.balanceOf(staker.address)
    const secondRewardAmount = await rewardsToken.balanceOf(secondStaker.address)
    const totalReward = rewardAmount.add(secondRewardAmount)

    // ensure results are within .01%
    expect(reward.sub(totalReward).lte(reward.div(10000))).to.be.true
    expect(totalReward.mul(3).div(4).sub(rewardAmount).lte(totalReward.mul(3).div(4).div(10000)))
    expect(totalReward.div(4).sub(secondRewardAmount).lte(totalReward.div(4).div(10000)))
  })
})
