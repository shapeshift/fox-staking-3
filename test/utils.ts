import { BigNumber, providers, utils, Contract } from 'ethers'

const PERMIT_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

function getDomainSeparator(name: string, tokenAddress: string, chainId: number) {
  return utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        utils.keccak256(
          utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
        ),
        utils.keccak256(utils.toUtf8Bytes(name)),
        utils.keccak256(utils.toUtf8Bytes('1')),
        chainId,
        tokenAddress,
      ]
    )
  )
}

export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string
    spender: string
    value: BigNumber
  },
  nonce: BigNumber,
  deadline: BigNumber,
  chainId: number
): Promise<string> {
  const name = await token.name()
  const DOMAIN_SEPARATOR = getDomainSeparator(name, token.address, chainId)
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        ),
      ]
    )
  )
}

export const REWARDS_DURATION = 60 * 60 * 24 * 135

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export async function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  return provider.send('evm_mine', [timestamp])
}

export function setupTests() {
  const chai = require('chai')
  if (process.env.HARDHAT) {
    const { ethers, waffle } = require('hardhat')
    const { provider } = waffle
    const stakingRewardsPath = '../artifacts/contracts/StakingRewards.sol/StakingRewards.json'
    const stakingRewardsFactoryPath = '../artifacts/contracts/StakingRewardsFactory.sol/StakingRewardsFactory.json'
    const testERC20Path = '../artifacts/contracts/test/TestERC20.sol/TestERC20.json'
    return {
      expect: chai.expect,
      ethers,
      waffle,
      provider,
      StakingRewards: require(stakingRewardsPath),
      StakingRewardsFactory: require(stakingRewardsFactoryPath),
      TestERC20: require(testERC20Path),
      isHardhat: true,
    }
  } else {
    const ethers = require('ethers')
    const waffle = require('ethereum-waffle')
    const provider = new waffle.MockProvider({
      ganacheOptions: {
        hardfork: 'istanbul',
        mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
        gasLimit: 9999999,
      },
    })
    const stakingRewardsPath = '../build/StakingRewards.json'
    const stakingRewardsFactoryPath = '../build/StakingRewardsFactory.json'
    const testERC20Path = '../build/TestERC20.json'
    chai.use(waffle.solidity)
    return {
      expect: chai.expect,
      ethers,
      waffle,
      provider,
      StakingRewards: require(stakingRewardsPath),
      StakingRewardsFactory: require(stakingRewardsFactoryPath),
      TestERC20: require(testERC20Path),
      isHardhat: false,
    }
  }
}
