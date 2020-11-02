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
    // Generate nonce TODO use better mechanism to generate unique nonce
    const nonce = new Date().getTime();

    // Create message to be signed by both users
    const hash = ethers.utils.solidityKeccak256(
        ["uint256", "uint256", "address", "address", "uint256", "uint256"],
        [channelId, nonce, userOne.address, userTwo.address, userOneBalance, userTwoBalance]
    );
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