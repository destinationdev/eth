var Enrollment = artifacts.require("./Enrollment.sol");

contract('Enrollment', function(accounts) {
  let enrollment;
  let web3;

  beforeEach(async () => {
    enrollment = await Enrollment.new(2, 2, 800000000000000000);
    web3 = enrollment.constructor.web3;
  });

  describe("#constructor", () => {
    it("sets the owner to the contract deployer", async () => {
      let owner = await enrollment.owner();
      assert.equal(owner, accounts[0]);
    });

    it("sets the max seats based on first argument", async () => {
      let maxSeats = (await enrollment.maxSeats()).toFixed();
      assert.equal(maxSeats, 2);
    });

    it("sets the usdTuition based on second argument", async () => {
      let usdTuition = await enrollment.usdTuition();
      assert.equal(usdTuition, 2);
    });

    it("sets the spotRate based on third argument", async () => {
      let spotRate = await enrollment.spotRate();
      assert.equal(spotRate, 800000000000000000);
    });

    it("sets the weiTuition based on spot / usd", async () => {
      let spotRate = (await enrollment.spotRate()).toFixed();
      let usdTuition = (await enrollment.usdTuition()).toFixed();
      let weiTuition = (await enrollment.weiTuition()).toFixed();

      assert.equal(weiTuition, (spotRate / usdTuition));
    });

    it("sets the lastUpdatedTuitionBlock to the block number of the contract", async () => {
      let lastUpdatedTuitionBlock = await enrollment.lastUpdatedTuitionBlock();

      const retrievedBlock = await new Promise((resolve, reject) => {
        web3.eth.getBlock(lastUpdatedTuitionBlock, true, (error, value) => {
          return resolve(value);
        });
      });

      assert.include(retrievedBlock.transactions.map((trans) => { return trans.from }), accounts[0]);
    });
  });

  describe("#enroll()", () => {
    it("requires a value greater than the weiTuition", async () => {
      let err;

      try {
        await enrollment.enroll(null, {value: 7, from: accounts[1]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("rejects enrollment if the student list is full", async () => {
      await enrollment.enroll("doug", {value: 8000000000000000000, from: accounts[1]});
      await enrollment.enroll("doug", {value: 8000000000000000000, from: accounts[3]});
      let err;

      try {
        await enrollment.enroll("fail", {value: 8000000000000000000, from: accounts[2]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("rejects enrollment for addresses that are already enrolled", async () => {
      await enrollment.enroll("doug", {value: 8000000000000000000, from: accounts[1]});
      let err;

      try {
        await enrollment.enroll("fail", {value: 8000000000000000000, from: accounts[1]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("populates the studentList array with the sender's address", async () => {
      await enrollment.enroll(null, {value: 8000000000000000000, from: accounts[4]});

      let firstStudent = await enrollment.studentList(0);

      assert.equal(firstStudent, accounts[4]);
    });

    it("inserts a Student value at sender's address key in the students mapping with appropriate fields", async () => {
      await enrollment.enroll(web3.fromAscii("doug"), {value: 8000000000000000000, from: accounts[8]});

      let student = await enrollment.students(accounts[8]);

      assert.equal(student[0], accounts[8]);
      assert.equal(student[1].toFixed(), 0);
      assert.equal(student[2].toFixed(), 8000000000000000000);
      assert.equal(web3.toAscii(student[3]), "doug");
    });

    it("refunds overpayment", async () => {
      await enrollment.enroll(web3.fromAscii("doug"), {value: 800000000000000000, from: accounts[8]});

    });
  });

  describe("#changeMaxSeats()", () => {
    it.only("rejects calls from senders other than the owner", () => {
      await enrollment.changeMaxSeats(10);
      let err;

      try {
        await enrollment.enroll("fail", {value: 8000000000000000000, from: accounts[1]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });
  });

  describe("#changeTuition()");

  describe("#changeSpotRate()");

  describe("#issueRefund()");

  describe("#requestOverpaymentRefund()");

  // From the frontend, use mailgun API, firbase, etc. to capture email address and send confirmation and invoice
  // Oracle cron job to update spot rate
  // accept deposit vs. full tuition. Can make this time-sensitive also and send deposit to another account
  // after time expires to pay full tuition.
});
