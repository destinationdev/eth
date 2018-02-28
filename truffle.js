const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

const rinkebyProvider = new HDWalletProvider(config.mnemonic, config.rinkeby.providerUrl);

module.exports = {
  networks: {
      development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "*" // Match any network id
      },

      rinkeby: {
        provider: rinkebyProvider,
        network_id: 4,
        gas: 4612388,
      }
    }
};
