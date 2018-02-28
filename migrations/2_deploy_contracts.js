var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Enrollment = artifacts.require("./Enrollment.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Enrollment, 30, 2000, 3000000000000000000);
};
