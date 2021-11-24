/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('hardhat-docgen');

module.exports = {
  docgen: {
    clear: true,
    path: './docs',
    runOnCompile: true,
    only: ["contracts/StakingRewards.sol", "contracts/StakingRewardsFactory.sol"],
  },
  solidity: "0.7.6",
};
