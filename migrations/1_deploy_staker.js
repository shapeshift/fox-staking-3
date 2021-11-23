const StakingRewardsFactory = artifacts.require('StakingRewardsFactory')
require('dotenv').config()
const { BigNumber } = require('ethers')
const Web3 = require('web3')
module.exports = async function (deployer) {
      const oneEth = 1e18.toString()

      var web3 = new Web3(deployer.provider)
      const currentBlockTime = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp
      const stakingGenesis = currentBlockTime + 60 * 5 // No more than 5 minutes in the future

      // deploy factory contract
      await deployer.deploy(StakingRewardsFactory, process.env.REWARD_TOKEN, stakingGenesis)
      const deployedStakingRewardsFactory = await StakingRewardsFactory.deployed()
      // deploy a StakingRewards contract
      await deployedStakingRewardsFactory.deploy(process.env.STAKE_TOKEN, BigNumber.from(process.env.REWARD_AMOUNT).mul(oneEth).toString())

      const stakingContractInfo = await deployedStakingRewardsFactory.stakingRewardsInfoByStakingToken(process.env.STAKE_TOKEN)

      console.log('stakingContractInfo', await stakingContractInfo)
      console.log('stakingGenesis', stakingGenesis)
}
