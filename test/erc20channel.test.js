const { expect } = require("chai");
const { ethers } = require("hardhat");

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

        expect(await tokenContract.balanceOf(userOne.address)).to.equal(1000);
        expect(await tokenContract.balanceOf(userTwo.address)).to.equal(1000);
    });

    it("Should open a channel", async function () {
        const channelId = await channelContract.open(tokenContract.address, userOne.address, userTwo.address, 1000, 1000);

        const channel = await channelContract.channels(channelId.value);
        expect(channel.isOpen).to.eq(true);
    });

    it("Should close a channel", async function() {
        const userOneSignature = Buffer.from("something", "utf8");
        const userTwoSignature = Buffer.from("something", "utf8");
        const closed = await channelContract.connect(userOne).close(0, 1, 1000, 1000, userOneSignature, userTwoSignature);

        const channel = await channelContract.channels(0);
        expect(channel.isOpen).to.eq(false);
    });
});
