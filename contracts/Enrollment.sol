pragma solidity ^0.4.17;

contract Enrollment {
    address public owner;
    uint public maxSeats;
    uint public usdTuition;
    uint public weiTuition;
    uint public spotRate; //This is wei/usd rate. create oracle for up-to-date pricing
    uint public lastUpdatedTuitionBlock;

    struct Student {
      address uuid;
      uint index;
      uint balance;
      bytes name; //Optional
    }

    mapping (address => Student) public students;
    address[] public studentList;

    function Enrollment(uint _maxSeats, uint _usdTuition, uint _spotRate) public {
      owner = msg.sender;
      maxSeats = _maxSeats;
      usdTuition = _usdTuition;
      spotRate = _spotRate;

      weiTuition = spotRate / usdTuition;

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

      if(msg.value > weiTuition) {
        msg.sender.transfer(msg.value - weiTuition);
        students[msg.sender].balance = weiTuition;
      }
    }

    function changeMaxSeats(uint newMaxSeats) public {
      require(msg.sender == owner);
      require(newMaxSeats > 0);

      maxSeats = newMaxSeats;
    }
}
