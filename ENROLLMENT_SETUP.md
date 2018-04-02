Rinkeby Test dApp Enrollment Instructions
=========================================

In order to give beginners a feel for what it's like to use a basic dApp to
interact with an Ethereum smart contract, we've deployed our sample
course enrollment contract to the [Rinkeby](https://www.rinkeby.io/#stats) test network.
Smart contract developers rely heavily on distributed test networks to see how their
applications perform in the wild prior to deploying to the main Ethereum network.

Test networks are run by community members free-of-charge (for now) to provide a
simulated environment as close as possible to the main network, but with test
ether and transactions that have no real monetary value. You can think of the
test network as a sort of staging environment where developers will deploy their
contracts when they're nearly done and ready to be tested in a more real-world
environment than a local development blockchain can provide.

There are a few popular Ethereum test networks, and Rinkeby is one of the most widely
used. In contrast to the main network and some other testnets, Rinkeby does not
use proof-of-work to validate transactions and mine ether. Instead, Rinkeby relies
on a few trusted community members to sign blocks and produce new ether (proof-of-authority).
While this environment doesn't fully replicate the behavior of the main network, it is
safe from attacks that test proof-of-work networks are susceptible to. Test proof-of-work networks
 are susceptible to being overtaken by nefarious actors who can easily overpower the
 computing power of community nodes following the rules. Test network miners are not
 rewarded for mining blocks the way they are on the mainnet, so the incentive for
 allocating a lot of compute resources to a test node are not adequate to protect against
 attackers who may intermittently attempt to disrupt normal network activity.

Interacting with our sample contract on the testnet will give you an opportunity to
see how dApps work without spending any real ether. In order to get set up to
faux enroll in our course with Rinkeby ether, follow these instructions:

Instructions
-------------
1. Install the [Metamask](https://metamask.io/) browser extension for Chrome, Firefox, or Opera.
Metamask provides an easy-to-use interface for managing identities, provisioning accounts,
and using dApps on the internet that interact with any Ethereum network, including the main
network, Rinkeby and other testnets, or even local development networks running on your
own computer.
2. Metamask manages a secure vault for you that can hold and access a number of accounts on any of the networks. In order to provision a new vault, you'll need to generate a mnemonic seed phrase, which is essentially an easy-to-remember private key for unlocking your
vault. To generate a new phrase for your vault, head to https://iancoleman.io/bip39/.
    - Select a 12-word phrase.
    - Select "English" for "Mnemonic Language".
    - Select ETH from the "Coin" dropdown.
    - Copy your mnemonic from the "BIP39 Mnemonic" box.
    - *IMPORTANT NOTE: Anyone with access to your mnemonic phrase or the connected password you'll generate in step 3 will have full access to any and all accounts you've used it to provision. This includes real accounts with real ether you may have provisioned on the main network. Be very careful, even paranoid, about your mnemonic seed phrase. The website we're using to generate these phrases should be safe, but if you're dealing with real ether you should download the code running on that site [here](https://github.com/iancoleman/bip39) on a computer you're very confident is secure, and generate a phrase locally with your internet off.*
3. Click on the Metamask extension's icon in your browser and then click "Restore from seed phrase". Paste the mnemonic you generated in step 2 into the box and enter a password. Click "OK" and your Metamask vault will be ready-to-go! You'll see your first generated account. You can
generate new accounts, switch between a variety of networks, and more from the menu at the top of the Metamask UI.
4. Click the three dots next to the name of your account, and select "Copy Address to clipboard". You've just copied your account's public address to your clipboard. Unlike your mnemonic, password, or other private keys, you can freely distribute this address anywhere, and it is the public identifier we'll use to distribute some test Rinkeby ether into your account.
5. Since the Rinkeby network is managed by trusted authorities, we can simply request test ether to use on the network via the [Rinkeby Faucet](https://faucet.rinkeby.io/). Head to the faucet, and follow the instructions to make a public social media post on the internet containing your account's public address you copied in step 4. Paste a url to your post into the input provided and request some test ether.
6. After a few moments, your request should be processed and you should see a new balance in your account in Metamask. You can also head to https://rinkeby.etherscan.io/ and enter your address in the search box to view details on the transaction that distributed the test ether into your account.
7. Head to https://ddev-enrollment.surge.sh/ and "Enroll" in our course!
