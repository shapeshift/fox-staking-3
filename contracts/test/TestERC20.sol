// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.6;

import "../../openzeppelin-solidity-3.4.0/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(uint amount) ERC20('Test ERC20', 'TEST') public {
        _mint(msg.sender, amount);
    }
}
