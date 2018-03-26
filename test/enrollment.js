var Enrollment = artifacts.require("./Enrollment.sol");

contract('Enrollment', function(accounts) {
  let enrollment;
  let web3;
  let initialSpotRate;
  let initialUsdTuition;
  let initialMaxSeats;

  beforeEach(async () => {
    initialSpotRate = 1000000000000000;
    initialUsdTuition = 2000;
    initialMaxSeats = 2;
    enrollment = await Enrollment.new(initialMaxSeats, initialUsdTuition, initialSpotRate);
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
      assert.equal(usdTuition, 2000);
    });

    it("sets the spotRate based on third argument", async () => {
      let spotRate = await enrollment.spotRate();
      assert.equal(spotRate, 1000000000000000);
    });

    it("sets the weiTuition based on spot * usd", async () => {
      let spotRate = (await enrollment.spotRate()).toFixed();
      let usdTuition = (await enrollment.usdTuition()).toFixed();
      let weiTuition = (await enrollment.weiTuition()).toFixed();

      assert.equal(weiTuition, (spotRate * usdTuition));
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
      assert.equal(student[2].toFixed(), 2000000000000000000);
      assert.equal(web3.toAscii(student[3]), "doug");
    });

    it("refunds overpayment", async () => {
      let gasPrice = 100000000000;
      let weiTuition = parseInt((await enrollment.weiTuition()).toFixed());
      let originalAccountBalance = parseInt((await web3.eth.getBalance(accounts[9])).toFixed());
      let enrollmentTx = await enrollment.enroll(web3.fromAscii("doug"), {value: 8000000000000000000, from: accounts[9], gasPrice: gasPrice});
      let gasUsed = enrollmentTx["receipt"]["gasUsed"];
      let balanceAfterEnrollment = parseInt((await web3.eth.getBalance(accounts[9])).toFixed());

      assert.equal(balanceAfterEnrollment, (originalAccountBalance - weiTuition - (gasUsed * gasPrice)));
    });

    it("emits a logEnroll event following successfull enrollment", async () => {
     const logEnroll = enrollment.LogEnroll();

     logEnroll.watch((error, event) => {
       logEnroll.stopWatching();

       assert.equal(event.args.student, accounts[6]);
       assert.equal(web3.toAscii(event.args.name), "doug");
     });

     await enrollment.enroll(web3.fromAscii("doug"), {value: 8000000000000000000, from: accounts[6]});
    });
  });

  describe("#updateMaxSeats()", () => {
    it("rejects calls from senders other than the owner", async () => {
      let err;

      try {
        await enrollment.updateMaxSeats(10, {from: accounts[1]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("allows updates from the owner", async () => {
      await enrollment.updateMaxSeats(11);

      let maxSeats = (await enrollment.maxSeats()).toFixed();

      assert.equal(maxSeats, 11);
    });
  });

  describe("#updateTuition()", () => {
    it("rejects calls from senders other than the owner", async () => {
      let err;

      try {
        await enrollment.updateTuition(3000, {from: accounts[1]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("allows updates from the owner", async () => {
      await enrollment.updateTuition(3000);

      let usdTuition = (await enrollment.usdTuition()).toFixed();

      assert.equal(usdTuition, 3000);
    });

    it("updates the wei tuition", async () => {
      await enrollment.updateTuition(3000);

      let weiTuition = (await enrollment.weiTuition()).toFixed();

      assert.equal(weiTuition, 3000 * initialSpotRate);
    });

    it("updates the last updated tuition block number", async () => {
      let blockNumber = (await enrollment.updateTuition(3000)).receipt.blockNumber;

      let lastBlockNumber = await enrollment.lastUpdatedTuitionBlock();

      assert.equal(lastBlockNumber, blockNumber);
    });
  });

  describe("#updateSpotRate()", () => {
    it("rejects calls from senders other than the owner", async () => {
      let err;

      try {
        await enrollment.updateSpotRate(1200000000000000, {from: accounts[4]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("allows updates from the owner", async () => {
      await enrollment.updateSpotRate(1200000000000000);

      let spotRate = (await enrollment.spotRate()).toFixed();

      assert.equal(spotRate, 1200000000000000);
    });

    it("updates the wei tuition", async () => {
      await enrollment.updateSpotRate(1200000000000000);

      let weiTuition = (await enrollment.weiTuition()).toFixed();

      assert.equal(weiTuition, 1200000000000000 * initialUsdTuition);
    });

    it("updates the last updated tuition block number", async () => {
      let blockNumber = (await enrollment.updateSpotRate(1200000000000000)).receipt.blockNumber;

      let lastBlockNumber = await enrollment.lastUpdatedTuitionBlock();

      assert.equal(lastBlockNumber, blockNumber);
    });
  });

  describe("#empty()", () => {
    it("rejects calls from senders other than the owner", async () => {
      let err;
      await enrollment.enroll(web3.fromAscii("doug"), {value: 8000000000000000000, from: accounts[6]});

      try {
        await enrollment.empty({from: accounts[2]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("errors if the balance is too low", async () => {
      let err;

      try {
        await enrollment.empty();
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("transfers the full contract balance to the owner", async () => {
      await enrollment.enroll(web3.fromAscii("doug"), {value: 2000000000000000000, from: accounts[6]});
      assert.equal((await web3.eth.getBalance(enrollment.address)).toFixed(), 2000000000000000000);

      let gasPrice = 100000000000;
      let originalAccountBalance = parseInt((await web3.eth.getBalance(accounts[0])).toFixed());
      let emptyTx = await enrollment.empty({from: accounts[0], gasPrice: gasPrice});
      let gasUsed = emptyTx["receipt"]["gasUsed"];
      let balanceAfterEmpty = parseInt((await web3.eth.getBalance(accounts[0])).toFixed());

      assert.equal(balanceAfterEmpty, (originalAccountBalance + (initialUsdTuition * initialSpotRate) - (gasUsed * gasPrice)));
      assert.equal((await web3.eth.getBalance(enrollment.address)).toFixed(), 0);
    });
  });

  describe("#collect()", () => {
    it("rejects calls from senders other than the owner", async () => {
      let err;
      await enrollment.enroll(web3.fromAscii("doug"), {value: 8000000000000000000, from: accounts[6]});

      try {
        await enrollment.collect(1000000000000000000, {from: accounts[2]});
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("errors if collection amount is greater than the contract balance", async () => {
      let err;
      await enrollment.enroll(web3.fromAscii("doug"), {value: 2000000000000000000, from: accounts[6]});

      try {
        await enrollment.collect(7000000000000000000);
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("errors if the collection amount is less than the spot rate (1 USD)", async () => {
      let err;
      await enrollment.enroll(web3.fromAscii("doug"), {value: 2000000000000000000, from: accounts[6]});

      try {
        await enrollment.collect(initialSpotRate - 1);
      } catch(error) {
        err = error;
      }

      assert.isOk(err);
    });

    it("transfers the amount to the owner", async () => {
      await enrollment.enroll(web3.fromAscii("doug"), {value: 2000000000000000000, from: accounts[6]});
      assert.equal((await web3.eth.getBalance(enrollment.address)).toFixed(), 2000000000000000000);

      let gasPrice = 100000000000;
      let originalAccountBalance = parseInt((await web3.eth.getBalance(accounts[0])).toFixed());
      let collectTx = await enrollment.collect(initialSpotRate, {from: accounts[0], gasPrice: gasPrice});
      let gasUsed = collectTx["receipt"]["gasUsed"];
      let balanceAfterCollect = parseInt((await web3.eth.getBalance(accounts[0])).toFixed());

      assert.equal(balanceAfterCollect, (originalAccountBalance + initialSpotRate - (gasUsed * gasPrice)));
      assert.equal((await web3.eth.getBalance(enrollment.address)).toFixed(), 2000000000000000000 - initialSpotRate);
    });
  });

  // From the frontend, use mailgun API, firbase, etc. to capture email address and send confirmation and invoice
  // Oracle cron job to update spot rate
  // accept deposit vs. full tuition. Can make this time-sensitive also and send deposit to another account
  // after time expires to pay full tuition.
});
