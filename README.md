# Staker (3)

Farming contract based on https://github.com/Uniswap/liquidity-staker.

See this [proposal](https://forum.shapeshift.com/t/scp-55-revised-liquidity-mining-lp-token-purchases/1018) for context on the 3rd round of liquidity incentives for the Shapeshift DAO.

The important bits for the context of this contract set are 


>On February 22nd at 9am MST (48 hours before the second round of FOX/ETH liquidity mining ends), deploy a third round of liquidity mining rewards for the Uniswap v2 FOX/ETH Pool of 13.5M FOX rewarded over 4.5 months (targeting 75% or higher APR).


A previous version of this contract is deployed at [0xc54B9F82C1c54E9D4d274d633c7523f2299c42A0](https://etherscan.io/address/0xc54B9F82C1c54E9D4d274d633c7523f2299c42A0) on Ethereum Mainnet. The contract code is immutable, and there are no special access privileges (i.e. contract ownership) that would permit them to be altered or the rewards shut down.

Each deployment of a contract instance runs for a fixed time period. This helps limit the damage that any attacker can cause, while also ensuring those who stake their tokens that the funds designated for rewards are fully committed to that purpose and cannot be revoked or reclaimed by the deployer. In the event of any emergency, users should unstake their tokens, after which they may choose to re-stake them in a newly-deployed, fixed contract instance.

[Docs](https://raw.githack.com/shapeshift/fox-staking-unified-history/master/docs/index.html) / [Test Coverage](https://raw.githack.com/shapeshift/fox-staking-unified-history/master/coverage/index.html)

1. run `yarn`
2. Copy sample.env to .env and populate .env variables
3. run `yarn compile` and `yarn test` for unit tests.
4. run `yarn deploy`  to deploy the factory contract and a farming contract using values specified in .env
    - Make note of the deployed `StakingRewardsFactory` contract address and the logged `stakingContractInfo` which has the deployed StakingRewards contract address

*** IMPORTANT ***

- Wait for the stakingRewardsGenesis time to pass before sending any fox.
- Verify that the genesis time has passed before sending any funds


6. Send at least the amount of fox specified in .env (REWARD_AMOUNT) to the `StakingRewardsFactory` contract address from step 4
7. run `yarn fund:testnet` OR `yarn fund:mainnet` to instruct the factory contract to send its fox to and initialize the farming contract launched in step 4
