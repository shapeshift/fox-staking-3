const StakingRewardsFactory = artifacts.require('StakingRewardsFactory')
require('dotenv').config()
module.exports = async function (deployer) {
      const deployedStakingRewardsFactory = await StakingRewardsFactory.deployed()
      // Tell the factory to fund the deployed staking contract with fox tokens (factory requires token balance)
      const notifyRewardAmountResult = await deployedStakingRewardsFactory.notifyRewardAmount(process.env.STAKE_TOKEN)
      console.log('notifyRewardAmountResult', notifyRewardAmountResult)
}
