require('dotenv').config();

module.exports = {
  mnemonic: process.env.MNEMONIC,
  local: {
    providerUrl: 'http://localhost:8545',
  },
  rinkeby: {
    providerUrl: `https://rinkeby.infura.io/${process.env.INFURA_TOKEN}`,
  },
  main: {
    providerUrl: `https://mainnet.infura.io/${process.env.INFURA_TOKEN}`,
  },
};
