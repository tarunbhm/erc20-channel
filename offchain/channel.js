const { ethers } = require("hardhat");

const abiCoder = ethers.utils.defaultAbiCoder;

/**
 * Generates state channel recipt for updating balances of user
 * @param {*} channelId integer
 * @param {*} userOne ethers account
 * @param {*} userTwo ethers account
 * @param {*} userOneBalance user one final balance
 * @param {*} userTwoBalance user two final balance
 */
async function getStateReciept(channelId, userOne, userTwo, userOneBalance, userTwoBalance) {
    // Generate nonce
    const nonce = Math.floor(Math.random() * 100);

    // Create message to be signed by both users
    const encoded = abiCoder.encode(
        ["uint256", "uint256", "uint256", "uint256"],
        [channelId, nonce, userOneBalance, userTwoBalance]
    );
    const hash = ethers.utils.keccak256(encoded);
    const arrayHash = ethers.utils.arrayify(hash);

    const userOneSig = await userOne.signMessage(arrayHash);
    const userTwoSig = await userTwo.signMessage(arrayHash);

    return {
        nonce: nonce,
        userOneSig: userOneSig,
        userTwoSig: userTwoSig
    };
}

module.exports = { getStateReciept };