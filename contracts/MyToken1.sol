// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract MyToken1 is ERC20 { 
address public owner;
    constructor(uint256 initialsupply) ERC20("myToken1","t1"){
        _mint(msg.sender,initialsupply ** decimals());
        owner=msg.sender;
    }
        function decimals() public view virtual override returns (uint8) {
        return 10;
    }
}