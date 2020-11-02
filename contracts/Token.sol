//SPDX-License-Identifier: ISC
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";


contract Token is ERC20PresetMinterPauser {

    constructor() public ERC20PresetMinterPauser("Tarun", "TRN") {
        _mint(msg.sender, 1000);
    }
}