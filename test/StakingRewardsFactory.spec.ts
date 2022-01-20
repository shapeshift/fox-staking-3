import { ethers, deployments, getNamedAccounts } from "hardhat";
import { expect } from "chai";
import { StakingRewardsFactory} from "../typechain-types/StakingRewardsFactory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestERC20 } from "../typechain-types/TestERC20";

import { BigNumber, Signer } from "ethers";

import { mineBlock, setupTests } from './utils'
import { solidity } from "ethereum-waffle"; 

//const { expect, ethers, waffle, provider, StakingRewards } = setupTests()

describe('StakingRewardsFactory', () => {
  // const [wallet, wallet1] = provider.getWallets()
  // const loadFixture = waffle.createFixtureLoader([wallet], provider)

  let rewardsToken: TestERC20;
  let stakingToken: TestERC20;
  let accounts: SignerWithAddress[];
  let stakingRewardsFactory: StakingRewardsFactory;
  // let genesis: number
  // let rewardAmounts: BigNumber[]  
  
  beforeEach(async () => {

    await deployments.fixture();
    accounts = await ethers.getSigners();
    const stakingFactoryDeployment = await deployments.get("StakingRewardsFactory");
    stakingRewardsFactory = new ethers.Contract(
      stakingFactoryDeployment.address,
      stakingFactoryDeployment.abi,
      accounts[0]
    ) as StakingRewardsFactory;

    const rewardsTokenDeployment = await deployments.get("RewardsToken");
    rewardsToken = new ethers.Contract(
      rewardsTokenDeployment.address,
      rewardsTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;

    const stakingTokenDeployment = await deployments.get("StakingToken");
    stakingToken = new ethers.Contract(
      rewardsTokenDeployment.address,
      rewardsTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;

    // const fixture = await loadFixture(stakingRewardsFactoryFixture)
    // rewardsToken = fixture.rewardsToken
    // genesis = fixture.genesis
    // rewardAmounts = fixture.rewardAmounts
    // stakingRewardsFactory = fixture.stakingRewardsFactory
    // stakingTokens = fixture.stakingTokens
  })

  it('deployment gas [ @skip-on-coverage ]', async () => {
    
    const rewardsToken = await deployments.get("RewardsToken"); // mock fox token
    const contractFactory = await ethers.getContractFactory("StakingRewardsFactory");

    const stakingGenesis = Math.round(Date.now() / 1000 + 6000);
    const rewardsFactory = await contractFactory.deploy(rewardsToken.address, stakingGenesis);
    const tx = await rewardsFactory.deployed()
    const gasUsed = (await tx.deployTransaction.wait()).gasUsed;
    expect(gasUsed.toString()).to.eq('2155313')
  })

  describe('#deploy', () => {
    it('pushes the token into the list', async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000)
      expect(await stakingRewardsFactory.stakingTokens(0)).to.eq(stakingToken.address)
    })

    it('fails if called twice for same token', async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000)
      await expect(stakingRewardsFactory.deploy(stakingToken.address, 10000)).to.be.revertedWith(
        'StakingRewardsFactory::deploy: already deployed'
      )
    })

    // it('can only be called by the owner', async () => {
    //   await expect(stakingRewardsFactory.connect(wallet1).deploy(stakingTokens[1].address, 10000)).to.be.revertedWith(
    //     'Ownable: caller is not the owner'
    //   )
    // })

    // it('stores the address of stakingRewards and reward amount', async () => {
    //   await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000)
    //   const [stakingRewards, rewardAmount] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
    //     stakingTokens[1].address
    //   )
    //   expect(await provider.getCode(stakingRewards)).to.not.eq('0x')
    //   expect(rewardAmount).to.eq(10000)
    // })

  //   it('deployed staking rewards has correct parameters', async () => {
  //     await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000)
  //     const [stakingRewardsAddress] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
  //       stakingTokens[1].address
  //     )
  //     const stakingRewards = new ethers.Contract(stakingRewardsAddress, StakingRewards.abi, provider)
  //     expect(await stakingRewards.rewardsDistribution()).to.eq(stakingRewardsFactory.address)
  //     expect(await stakingRewards.stakingToken()).to.eq(stakingTokens[1].address)
  //     expect(await stakingRewards.rewardsToken()).to.eq(rewardsToken.address)
  //   })
  })

  // describe('#notifyRewardsAmounts', () => {
  //   let totalRewardAmount: BigNumber

  //   beforeEach(() => {
  //     totalRewardAmount = rewardAmounts.reduce((accumulator, current) => accumulator.add(current), ethers.BigNumber.from(0))
  //   })

  //   it('called before any deploys', async () => {
  //     await expect(stakingRewardsFactory.notifyRewardAmounts()).to.be.revertedWith(
  //       'StakingRewardsFactory::notifyRewardAmounts: called before any deploys'
  //     )
  //   })

  //   describe('after deploying all staking reward contracts', async () => {
  //     let stakingRewards: Contract[]
  //     beforeEach('deploy staking reward contracts', async () => {
  //       stakingRewards = []
  //       for (let i = 0; i < stakingTokens.length; i++) {
  //         await stakingRewardsFactory.deploy(stakingTokens[i].address, rewardAmounts[i])
  //         const [stakingRewardsAddress] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
  //           stakingTokens[i].address
  //         )
  //         stakingRewards.push(new ethers.Contract(stakingRewardsAddress, StakingRewards.abi, provider))
  //       }
  //     })

  //     it('gas [ @skip-on-coverage ]', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       const tx = await stakingRewardsFactory.notifyRewardAmounts()
  //       const receipt = await tx.wait()
  //       expect(receipt.gasUsed).to.eq('416735')
  //     })

  //     it('no op if called twice', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       await expect(stakingRewardsFactory.notifyRewardAmounts()).to.emit(rewardsToken, 'Transfer')
  //       await expect(stakingRewardsFactory.notifyRewardAmounts()).to.not.emit(rewardsToken, 'Transfer')
  //     })

  //     it('fails if called without sufficient balance', async () => {
  //       await mineBlock(provider, genesis)
  //       await expect(stakingRewardsFactory.notifyRewardAmounts()).to.be.revertedWith(
  //         'ERC20: transfer amount exceeds balance' // emitted from rewards token
  //       )
  //     })

  //     it('calls notifyRewards on each contract', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       await expect(stakingRewardsFactory.notifyRewardAmounts())
  //         .to.emit(stakingRewards[0], 'RewardAdded')
  //         .withArgs(rewardAmounts[0])
  //         .to.emit(stakingRewards[1], 'RewardAdded')
  //         .withArgs(rewardAmounts[1])
  //         .to.emit(stakingRewards[2], 'RewardAdded')
  //         .withArgs(rewardAmounts[2])
  //         .to.emit(stakingRewards[3], 'RewardAdded')
  //         .withArgs(rewardAmounts[3])
  //     })

  //     it('transfers the reward tokens to the individual contracts', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       await stakingRewardsFactory.notifyRewardAmounts()
  //       for (let i = 0; i < rewardAmounts.length; i++) {
  //         expect(await rewardsToken.balanceOf(stakingRewards[i].address)).to.eq(rewardAmounts[i])
  //       }
  //     })

  //     it('sets rewardAmount to 0', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       for (let i = 0; i < stakingTokens.length; i++) {
  //         const [, amount] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(stakingTokens[i].address)
  //         expect(amount).to.eq(rewardAmounts[i])
  //       }
  //       await stakingRewardsFactory.notifyRewardAmounts()
  //       for (let i = 0; i < stakingTokens.length; i++) {
  //         const [, amount] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(stakingTokens[i].address)
  //         expect(amount).to.eq(0)
  //       }
  //     })

  //     it('succeeds when has sufficient balance and after genesis time', async () => {
  //       await rewardsToken.transfer(stakingRewardsFactory.address, totalRewardAmount)
  //       await mineBlock(provider, genesis)
  //       await stakingRewardsFactory.notifyRewardAmounts()
  //     })
  //   })
  // })
})
