pragma solidity ^0.4.17;

import './Ownable.sol';

contract Enrollment is Ownable {
    uint public maxSeats;
    uint public usdTuition;
    uint public weiTuition;
    uint public spotRate; //This is wei/usd rate. create oracle for up-to-date pricing
    uint public lastUpdatedTuitionBlock;

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
      maxSeats = _maxSeats;
      usdTuition = _usdTuition;
      spotRate = _spotRate;

      weiTuition = spotRate * usdTuition;

      lastUpdatedTuitionBlock = block.number;
    }

    function enroll(bytes name) public payable {
      require(msg.value >= weiTuition);
      require(studentList.length < maxSeats);
      require(students[msg.sender].uuid == 0);

      students[msg.sender] = Student({
        uuid: msg.sender,
        index: studentList.push(msg.sender) - 1,
        balance: msg.value,
        name: name
      });

      LogEnroll(msg.sender, name);

      if(msg.value > weiTuition) {
        msg.sender.transfer(msg.value - weiTuition);
        students[msg.sender].balance = weiTuition;
      }
    }

    function rosterLength() public view returns (uint) {
      return studentList.length;
    }

    /* withdraw a set amount (argument) of ETH to owner account */
    /* function collect() public onlyOwner {
      owner.transfer(this.balance);
    } */

    /* Just empty all ETH in contract to owner's account */
    /* function empty() public onlyOwner {

    } */

    /* function changeMaxSeats(uint newMaxSeats) public {
      require(msg.sender == owner);
      require(newMaxSeats > 0);

      maxSeats = newMaxSeats;
    } */

    /* function refund(address student) public {

    } */
}
