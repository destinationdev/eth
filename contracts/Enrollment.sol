pragma solidity ^0.4.17;

import './Ownable.sol';

contract Enrollment is Ownable {
    uint public maxSeats;
    uint public usdTuition;
    uint public weiTuition;
    uint public spotRate; //This is wei/usd rate. create oracle for up-to-date pricing
    uint public lastUpdatedTuitionBlock;
    uint public classSize;

    event LogEnroll(address student, bytes name);

    struct Student {
      address uuid;
      uint index;
      uint balance;
      bytes name; //Optional
    }

    mapping (address => Student) public students;
    address[] public studentList;

    function Enrollment(uint _maxSeats, uint _usdTuition, uint _spotRate) public {
      classSize = 0;
      maxSeats = _maxSeats;
      usdTuition = _usdTuition;
      spotRate = _spotRate;

      weiTuition = spotRate * usdTuition;

      lastUpdatedTuitionBlock = block.number;
    }

    function enroll(bytes name) public payable {
      require(msg.value >= weiTuition);
      require(classSize < maxSeats);
      require(students[msg.sender].uuid == 0);

      students[msg.sender] = Student({
        uuid: msg.sender,
        index: studentList.push(msg.sender) - 1,
        balance: msg.value,
        name: name
      });

      classSize += 1;
      LogEnroll(msg.sender, name);

      if(msg.value > weiTuition) {
        students[msg.sender].balance = weiTuition;
        msg.sender.transfer(msg.value - weiTuition);
      }
    }

    /* withdraw a set amount (argument) of ETH to owner account */
    function collect(uint amount) public onlyOwner {
      require(msg.sender == owner);
      require(amount <= this.balance);

      owner.transfer(amount);
    }

    /* Just empty all ETH in contract to owner's account */
    function empty() public onlyOwner {
      require(msg.sender == owner);

      owner.transfer(this.balance);
    }

    function updateMaxSeats(uint newMaxSeats) public {
      require(msg.sender == owner);
      require(newMaxSeats >= classSize);

      maxSeats = newMaxSeats;
    }

    function updateTuition(uint newTuition) public {
      require(msg.sender == owner);

      usdTuition = newTuition;
      weiTuition = usdTuition * spotRate;
      lastUpdatedTuitionBlock = block.number;
    }

    function updateSpotRate(uint newSpotRate) public {
      require(msg.sender == owner);

      spotRate = newSpotRate;
      weiTuition = usdTuition * spotRate;
      lastUpdatedTuitionBlock = block.number;
    }

    function refund(address studentAddress) public {
      require(msg.sender == owner);
      require(students[studentAddress].balance != 0);

      uint balance = students[studentAddress].balance;
      uint index = students[studentAddress].index;

      delete students[studentAddress];
      delete studentList[index];
      classSize -=1;

      studentAddress.transfer(balance);
    }
}
