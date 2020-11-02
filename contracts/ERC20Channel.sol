//SPDX-License-Identifier: ISC
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


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
        require(userOneAddress != address(0), "User one can not be zero address");
        require(userTwoAddress != address(0), "User two can not be zero address");

        // Capture balances
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(userOneAddress, address(this), userOneBalance), "Could not transfer amount from user one");
        require(token.transferFrom(userTwoAddress, address(this), userTwoBalance), "Could not transfer amount from user two");

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


    // TODO add challenge mechanism

    function close(
        uint256 channelId,
        uint256 nonce,
        uint256 userOneBalance,
        uint256 userTwoBalance,
        bytes memory userOneSig,
        bytes memory userTwoSig
    ) public {
        Channel storage channel = channels[channelId];

        // Verify that channel is still open
        require(channel.isOpen == true, "Channel already closed");

        // Verify that only one of the channel user is calling close
        require(msg.sender == channel.userOneAddress || msg.sender == channel.userTwoAddress, "Only channel user can call close");

        // TODO track and verify nonce

        // Create transfer message as was signed by users for off chain transfers
        bytes32 hash = keccak256(
            abi.encodePacked(
                channelId, 
                nonce, 
                userOneBalance, 
                userTwoBalance
            )
        );

        // Verify both user signatures
        require(verifySignature(hash, userOneSig, channel.userOneAddress), "Invalid user one signature");
        require(verifySignature(hash, userTwoSig, channel.userTwoAddress), "Invalid user two signature");

        // Update user balances
        channel.userOneBalance = userOneBalance;
        channel.userTwoBalance = userTwoBalance;

        // Update channel status to close
        channel.isOpen = false;
    }

    function verifySignature(bytes32 data, bytes memory signature, address signer) private pure returns (bool) {
        bytes32 ethHash = data.toEthSignedMessageHash();
        return ethHash.recover(signature) == signer;
    }
}
