//SPDX-License-Identifier: ISC
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";


contract ERC20Channel {
    using SafeMath for uint256;
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    Counters.Counter private channelIdTracker;

    struct Channel {
        uint256 id;
        address tokenAddress;
        address userOneAddress;
        address userTwoAddress;
        uint256 userOneBalance;
        uint256 userTwoBalance;
        bool isOpen;
    }

    mapping(uint256 => Channel) public channels;

    function open(
        address tokenAddress, 
        address userOneAddress,
        address userTwoAddress,
        uint256 userOneBalance,
        uint256 userTwoBalance
    ) public returns (uint256) {
        // Validate addresses as non-zero

        // Capture balances

        // Create Channel struct and store
        uint256 channelId = channelIdTracker.current();
        channelIdTracker.increment();

        Channel memory channel = Channel(
            channelId,
            tokenAddress,
            userOneAddress,
            userTwoAddress,
            userOneBalance,
            userTwoBalance,
            true
        );

        channels[channelId] = channel;

        return channelId;
    }


    // TODO add channel mechanism

    function close(
        uint256 channelId,
        uint256 nonce,
        uint256 userOneBalance,
        uint256 userTwoBalance,
        bytes memory userOneSig,
        bytes memory userTwoSig
    ) public {
        // Verify that channel is still open

        // Verify that only one of the channel user is calling close

        // Create transfer message as was signed by users for off chain transfers

        // Verify both user signatures

        // Update user balances

        // Transfer token according to final balances

        // Update channel id status
        Channel storage channel = channels[channelId];
        channel.isOpen = false;
    }
}
