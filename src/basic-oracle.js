import HDWalletProvider from 'truffle-hdwallet-provider';
import contract from 'truffle-contract';

import SimpleStorage from '../build/contracts/SimpleStorage.json';

const providerUrl = "http://127.0.0.1:7545";
const mneuomonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const provider = new HDWalletProvider(mneuomonic, providerUrl);
const ssContract = contract(SimpleStorage);

ssContract.setProvider(provider);

(async () => {
  const accounts = await new Promise((resolve, reject) => {
    ssContract.web3.eth.getAccounts((error, value) => {
      return resolve(value);
    });
  });
  let newContract = await ssContract.new({from: accounts[0]});
  let web3 = newContract.constructor.web3;
  // console.log(newContract);

  await newContract.set(13, {from: accounts[0]});
  console.log(":::::::::::::::::::::::::::::::::");
  console.log((await newContract.get()).toString());
})()
