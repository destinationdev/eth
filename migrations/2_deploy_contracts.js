var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Enrollment = artifacts.require("./Enrollment.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Enrollment, 100, 2500, 500000000000000);
};
