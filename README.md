# Reminder:
Add new farming contracts to snapshot strategies prior to go live!

# Updates for round 7 of liquidity mining rewards.

[StakingRewardsFactory](https://etherscan.io/address/0x1b16A8c2F14b3b15206D7E9BC39FCbee3976729e)
[StakingRewards](https://etherscan.io/address/0x5939783dbf3e9f453a69bc9ddc1e492efac1fbcb)

FOX to reward: 6,750,000
Start date: April 13 2023 at 9am Mountain Time
Duration: 4.5 months

On Aug 13 2023 at ~9AM Denver Time the Shapeshift DAO multisig will need to transfer 6,750,000 FOX to the [StakingRewardsFactory](https://etherscan.io/address/0x1b16A8c2F14b3b15206D7E9BC39FCbee3976729e) and then call the function `notifyRewardAmount` with the staking token address [0x470e8de2ebaef52014a47cb5e6af86884947f08c](https://etherscan.io/address/0x470e8de2ebaef52014a47cb5e6af86884947f08c) to activate the rewards program. 


# Updates for round 6 of liquidity mining rewards.

[StakingRewardsFactory](https://etherscan.io/address/0xc065ad7E7d4555F9cfC0243563975a2F0B634cE6)
[StakingRewards](https://etherscan.io/address/0xebb1761ad43034fd7faa64d84e5bbd8cb5c40b68)

FOX to reward: 6,750,000
Start date: April 2 2023 at 9am Mountain Time
Duration: 4.5 months

On April 2 2023 at ~9AM Denver Time the Shapeshift DAO multisig will need to transfer 6,750,000 FOX to the [StakingRewardsFactory](https://etherscan.io/address/0xc065ad7E7d4555F9cfC0243563975a2F0B634cE6) and then call the function `notifyRewardAmount` with the staking token address [0x470e8de2ebaef52014a47cb5e6af86884947f08c](https://etherscan.io/address/0x470e8de2ebaef52014a47cb5e6af86884947f08c) to activate the rewards program. 

# Updates for round 5 of liquidity mining rewards.

No proposal, this has been done in the purview of the TMDC's token allocations 

[StakingRewardsFactory](https://etherscan.io/address/0x736d4b4b046852b4c5c644fd101d60f2532936d2)
[StakingRewards](https://etherscan.io/address/0xc14eaa8284feff79edc118e06cadbf3813a7e555)

FOX to reward: 6,750,000
Start date: November 18th at 9am
End date: April 2 2023

On November 18th at ~9AM Denver Time the Shapeshift DAO multisig will need to transfer 6,750,000 FOX to the [StakingRewardsFactory](https://etherscan.io/address/0x736d4b4b046852b4c5c644fd101d60f2532936d2) and then call the function `notifyRewardAmount` with the staking token address [0x470e8de2ebaef52014a47cb5e6af86884947f08c](https://etherscan.io/address/0x470e8de2ebaef52014a47cb5e6af86884947f08c) to activate the rewards program. 


# Updates for round 4 of liquidity mining rewards.

[Proposal](https://snapshot.org/#/shapeshiftdao.eth/proposal/QmXMaKRR8fEtVsMskLtM2b1iZr9HUtQnXzUpMNLWDCM7se)

[StakingRewardsFactory](https://etherscan.io/address/0x7FF786dd10dFCB007FB94A02cAA2aAD5F2b9161c)
[StakingRewards](https://etherscan.io/address/0x24fd7fb95dc742e23dc3829d3e656feeb5f67fa0)

FOX to reward: 6,750,000
Start date: July 5th at 9am
End date: November 18th at 9am

On July 5th at ~ 9AM Denver Time the Shapeshift DAO multisig will need to transfer 6,750,000 FOX to the [StakingRewardsFactory](https://etherscan.io/address/0x7FF786dd10dFCB007FB94A02cAA2aAD5F2b9161c) and then call the function `notifyRewardAmount` with the staking token address 0x470e8de2ebaef52014a47cb5e6af86884947f08c to activate the rewards program. 

# Staker (3)

[StakingRewardsFactory](https://etherscan.io/address/0x2633a99d77c83bbb72af6971547bec9bb59756ee)
[StakingRewards](https://etherscan.io/address/0x212ebf9fd3c10f371557b08e993eaab385c3932b)

Farming contract based on https://github.com/Uniswap/liquidity-staker.

See this [proposal](https://forum.shapeshift.com/t/scp-55-revised-liquidity-mining-lp-token-purchases/1018) for context on the 3rd round of liquidity incentives for the Shapeshift DAO.

The important bits for the context of this contract set are

> On February 22nd at 9am MST (48 hours before the second round of FOX/ETH liquidity mining ends), deploy a third round of liquidity mining rewards for the Uniswap v2 FOX/ETH Pool of 13.5M FOX rewarded over 4.5 months (targeting 75% or higher APR).

A previous version of this contract is deployed at [0xc54B9F82C1c54E9D4d274d633c7523f2299c42A0](https://etherscan.io/address/0xc54B9F82C1c54E9D4d274d633c7523f2299c42A0) on Ethereum Mainnet. The contract code is immutable, and there are no special access privileges (i.e. contract ownership) that would permit them to be altered or the rewards shut down.

Each deployment of a contract instance runs for a fixed time period. This helps limit the damage that any attacker can cause, while also ensuring those who stake their tokens that the funds designated for rewards are fully committed to that purpose and cannot be revoked or reclaimed by the deployer. In the event of any emergency, users should unstake their tokens, after which they may choose to re-stake them in a newly-deployed, fixed contract instance.

[Docs](https://raw.githack.com/shapeshift/fox-staking-unified-history/master/docs/index.html) / [Test Coverage](https://raw.githack.com/shapeshift/fox-staking-unified-history/master/coverage/index.html)

1. run `yarn`
2. Copy sample.env to .env and populate .env variables
3. run `yarn compile` and `yarn test` for unit tests.
4. run `yarn deploy` to deploy the factory contract and a farming contract using values specified in .env
   - Make note of the deployed `StakingRewardsFactory` contract address and the logged `stakingContractInfo` which has the deployed StakingRewards contract address

**_ IMPORTANT _**

- Wait for the stakingRewardsGenesis time to pass before sending any fox.
- Verify that the genesis time has passed before sending any funds

6. Send at least the amount of fox specified in .env (REWARD_AMOUNT) to the `StakingRewardsFactory` contract address from step 4
7. run `yarn fund:testnet` OR `yarn fund:mainnet` to instruct the factory contract to send its fox to and initialize the farming contract launched in step 4
