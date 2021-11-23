const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config()

module.exports = {
  networks: {
   development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   test: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   ropsten: {
    gasPrice: 5000000000,
    gas: 3300000,
    provider: () =>
      new HDWalletProvider({
        mnemonic: {
          phrase: process.env.MNEMONIC
        },
        providerOrUrl: process.env.ROPSTEN_ETH_NODE,
        numberOfAddresses: 10,
        shareNonce: true,
        derivationPath: "m/44'/60'/0'/0/",
        chainId: 3,
      }),
    skipDryRun: true,
    network_id: '3',
    },
    mainnet: {
      gasPrice: 80000000000,
      gas: 3000000,
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.MNEMONIC
          },
          providerOrUrl: process.env.MAINNET_ETH_NODE,
          numberOfAddresses: 10,
          shareNonce: true,
          derivationPath: "m/44'/60'/0'/0/",
          chainId: 1,
        }),
      skipDryRun: true,
      network_id: '1',
    }
  },
  compilers: {
    solc: {
      version: '^0.7.6'
    }
  }
  
};
