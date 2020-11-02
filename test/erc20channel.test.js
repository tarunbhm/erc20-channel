const { expect } = require("chai");
const { ethers } = require("hardhat");

const { getStateReciept } = require("../offchain/channel");

describe("ERC20Channel", function () {
    let tokenContract, channelContract, admin, userOne, userTwo;

    before('Deploy contracts', async function () {
        const accounts = await ethers.getSigners();
        admin = accounts[0];
        userOne = accounts[1];
        userTwo = accounts[2];

        const tokenFactory = await ethers.getContractFactory("Token");
        tokenContract = await tokenFactory.deploy();
        await tokenContract.deployed();

        await tokenContract.mint(userOne.address, 1000);
        await tokenContract.mint(userTwo.address, 1000);

        const channelFactory = await ethers.getContractFactory("ERC20Channel");
        channelContract = await channelFactory.deploy();
        await channelContract.deployed();

        await tokenContract.connect(userOne).approve(channelContract.address, 1000);
        await tokenContract.connect(userTwo).approve(channelContract.address, 1000);
    });

    it("Should open a channel", async function () {
        const channelId = await channelContract.open(tokenContract.address, userOne.address, userTwo.address, 1000, 1000);

        const channel = await channelContract.channels(channelId.value);
        expect(channel.isOpen).to.equal(true);
    });

    it("Should close a channel", async function () {
        // Assuming lot of off chain transaction happening and then coming up with following final balances
        const channelId = 0;
        const userOneBalance = 500;
        const userTwoBalance = 1500;
        const signatures = await getStateReciept(channelId, userOne, userTwo, userOneBalance, userTwoBalance);

        await channelContract.connect(userOne).close(
            channelId, 
            signatures.nonce, 
            userOneBalance, 
            userTwoBalance, 
            signatures.userOneSig, 
            signatures.userTwoSig
        );

        const channel = await channelContract.channels(0);
        expect(channel.isOpen).to.equal(false);
        expect(channel.userOneBalance).to.equal(userOneBalance);
        expect(channel.userTwoBalance).to.equal(userTwoBalance);
    });

    // TODO add a lot of other negative tests
});
