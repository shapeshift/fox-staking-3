module.exports = {
  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true               // Run the grep's inverse set.
  },
  skipFiles: ['interfaces/IStakingRewards.sol', 'test/TestERC20.sol'],
};
