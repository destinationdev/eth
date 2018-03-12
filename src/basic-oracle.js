import HDWalletProvider from 'truffle-hdwallet-provider';
import contract from 'truffle-contract';

import Enrollment from '../build/contracts/Enrollment.json';

const providerUrl = "http://127.0.0.1:7545";
const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const provider = new HDWalletProvider(mnemonic, providerUrl);
const enrollmentContract = contract(Enrollment);

enrollmentContract.setProvider(provider);

(async () => {
  const accounts = await new Promise((resolve, reject) => {
    enrollmentContract.web3.eth.getAccounts((error, value) => {
      return resolve(value);
    });
  });

  let Contract = await enrollmentContract.deployed();
  let web3 = newContract.constructor.web3;
  // console.log(newContract);

  console.log("hello");

})()
