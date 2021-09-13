# Staker
Farming contract based on https://github.com/Uniswap/liquidity-staker

1. install truffle globally `npm install -g truffle`
2. Populate .env variables
3. run `yarn`
4. run `yarn deploy:testnet` OR `yarn deploy:mainnet` to deploy the factory contract and a farming contract using values specified in .env
    - Make note of the deployed `StakingRewardsFactory` contract address and the logged `stakingContractInfo` which has the deployed StakingRewards contract address

*** IMPORTANT ***

- Wait for the stakingRewardsGenesis time to pass before sending any fox.
- Verify that the genesis time has passed before sending any funds


6. Send at least the amount of fox specified in .env (REWARD_AMOUNT) to the `StakingRewardsFactory` contract address from step 4
7. run `yarn fund:testnet` OR `yarn fund:mainnet` to instruct the factory contract to send its fox to and initialize the farming contract launched in step 4
