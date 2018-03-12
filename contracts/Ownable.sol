pragma solidity ^0.4.17;

contract Ownable {
    address public owner;

    modifier onlyOwner() {
      require(msg.sender == owner);

      _;
    }

    function Ownable() public {
      owner = msg.sender;
    }

    function transferOwnership(address newOwner) public onlyOwner {
      owner = newOwner;
    }
}
