var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {
  let ss;
  let web3;

  before(async () => {
    ss = await SimpleStorage.deployed();
    web3 = ss.constructor.web3;
  });

  describe("#get() and #set()", () => {
    it("does some stuff", async () => {
      await ss.set(17, { from: accounts[2] });
      const val = await ss.get();
      assert.equal(17, val);
    });
  });
});
