import type { Contract, Wallet, BigNumber, providers } from 'ethers'

import { expandTo18Decimals, setupTests } from './utils'

import UniswapV2ERC20 from '@uniswap/v2-core/build/ERC20.json'

const { waffle: { deployContract }, StakingRewards, StakingRewardsFactory, TestERC20 } = setupTests()

const NUMBER_OF_STAKING_TOKENS = 4

interface StakingRewardsFixture {
  stakingRewards: Contract
  rewardsToken: Contract
  stakingToken: Contract
}

export async function stakingRewardsFixture([wallet]: Wallet[]): Promise<StakingRewardsFixture> {
  const rewardsDistribution = wallet.address
  const rewardsToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1000000)])
  const stakingToken = await deployContract(wallet, UniswapV2ERC20, [expandTo18Decimals(1000000)])

  const stakingRewards = await deployContract(wallet, StakingRewards, [
    rewardsDistribution,
    rewardsToken.address,
    stakingToken.address,
  ])

  return { stakingRewards, rewardsToken, stakingToken }
}

interface StakingRewardsFactoryFixture {
  rewardsToken: Contract
  stakingTokens: Contract[]
  genesis: number
  rewardAmounts: BigNumber[]
  stakingRewardsFactory: Contract
}

export async function stakingRewardsFactoryFixture(
  [wallet]: Wallet[],
  provider: providers.Web3Provider
): Promise<StakingRewardsFactoryFixture> {
  const rewardsToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1_000_000_000)])

  // deploy staking tokens
  const stakingTokens = []
  for (let i = 0; i < NUMBER_OF_STAKING_TOKENS; i++) {
    const stakingToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1_000_000_000)])
    stakingTokens.push(stakingToken)
  }

  // deploy the staking rewards factory
  const { timestamp: now } = await provider.getBlock('latest')
  const genesis = now + 60 * 60
  const rewardAmounts: BigNumber[] = new Array(stakingTokens.length).fill(expandTo18Decimals(10))
  const stakingRewardsFactory = await deployContract(wallet, StakingRewardsFactory, [rewardsToken.address, genesis])

  return { rewardsToken, stakingTokens, genesis, rewardAmounts, stakingRewardsFactory }
}
