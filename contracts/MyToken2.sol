// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken2 is ERC20 { 
    constructor(uint256 initialsupply) ERC20("myToken2","t2"){
        _mint(msg.sender,initialsupply ** decimals());
    }
        function decimals() public view virtual override returns (uint8) {
        return 10;
    }
}