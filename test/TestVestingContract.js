const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Deployment related test of vesting contract", async function () {
    let vesting_contract_name;
    let vesting_contract;
    let token1_contract_name;
    let token1_contract
    let owner, address1, address2, addressn;
    let initialSupply = 10

    before(async function () {
        [owner, address1, address2, ...addressn] = await ethers.getSigners();
        token1_contract_name = await ethers.getContractFactory("MyToken1");
        token1_contract = await token1_contract_name.deploy(initialSupply);
        vesting_contract_name = await ethers.getContractFactory("VestingContract");
        vesting_contract = await vesting_contract_name.deploy();

    })

    it("Check contract's owner address", async function () {
        expect(await vesting_contract.owner()).to.equal(owner.address);
    });

    it("Adding Token to WHitelist", async function () {
        await vesting_contract.addWhitelist(await token1_contract.address);
        expect(await vesting_contract.whitelist(token1_contract.address)).to.be.true;
    })

    it("only Contract Owner can add to whiteList", async function () {
        await vesting_contract.connect(address1);
        expect(await vesting_contract.addWhitelist(await token1_contract.address)).to.revertedWith("Only the contract owner can call this function");

    })

});

describe("Lock Token related task", async function () {

    before(async function () {


        [owner, address1, address2, ...addressn] = await ethers.getSigners();
        token1_contract_name = await ethers.getContractFactory("MyToken1");
        token1_contract = await token1_contract_name.deploy(10);
        vesting_contract_name = await ethers.getContractFactory("VestingContract");
        vesting_contract = await vesting_contract_name.deploy();
        await token1_contract.approve(vesting_contract.address, 500);
        await vesting_contract.addWhitelist(token1_contract.address);

    })

    it("Locking amount not be 0(zero)", async function () {
        let ammount = 100;
        let duration = 100;
        let slice = 10;
        let start = parseInt(await vesting_contract.getTime()) + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        await expect(vesting_contract.lock(0, duration, slice, start, cliff, baneficiaries, addressOfToken)).to.be.revertedWith("Amount not be Zero");
        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)
    })

    it("start time should be greater than current time", async function () {
        let ammount = 100;
        let duration = 100;
        let slice = 10;
        let start = parseInt(await vesting_contract.getTime()) + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(start).to.be.greaterThan(await vesting_contract.getTime())
        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)

    })

    it("Token must be whitelisted for vesting", async function () {
        let ammount = 100;
        let duration = 100;
        let slice = 10;
        let start = parseInt(await vesting_contract.getTime()) + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(await vesting_contract.whitelist(addressOfToken)).to.be.true;
        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)

    })
})

describe("Withdraw related task", async function () {

    before(async function () {
        [owner, address1, address2, ...addressn] = await ethers.getSigners();
        token1_contract_name = await ethers.getContractFactory("MyToken1");
        token1_contract = await token1_contract_name.deploy(10);
        vesting_contract_name = await ethers.getContractFactory("VestingContract");
        vesting_contract = await vesting_contract_name.deploy();
        await token1_contract.approve(vesting_contract.address, 500);
        await vesting_contract.addWhitelist(token1_contract.address);

    })

    it("Token must be locked for withdraw", async function () {
        try {
            if (await vesting_contract.vestings(owner.address, 0)) {
                let vesting_data = await vesting_contract.vestings(owner.address, 0)
                if (vesting_data.locked) {
                }
                else {
                    throw new Error("Funds have not been locked");
                }
            }
            else {
                throw new Error("Funds have not been locked");
            }
        }
        catch (e) {
            expect(e).to.be.an("error");
            return;
        }
    })

    it("Token under locking(start time + clif) is not started yet", async function () {
        let ammount = 100;
        let duration = 100;
        let slice = 10;
        let start = parseInt(await vesting_contract.getTime()) + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(await vesting_contract.whitelist(addressOfToken)).to.be.true;
        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)
        let vesting_data = await vesting_contract.vestings(baneficiaries, 0);
        expect(await vesting_contract.getTime() > vesting_data.start).to.revertedWith("Token under locking please wait..");
    })

    it("Check for event in withdraw", async function () {
        let ammount = 100;
        let duration = 100;
        let slice = 5;
        let start = parseInt(await vesting_contract.getTime()) + 2;
        let cliff = 0;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;

        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)
        await network.provider.send("evm_increaseTime", [100])
        await network.provider.send("evm_mine")
        expect(vesting_contract.withdraw(1)).to.emit(vesting_contract, "VestingWithdrawn");
    })

    it("User will get all token back at the end of vesting", async function () {
        let UserBalance = await token1_contract.balanceOf(owner.address)
        let ammount = 100;
        let duration = 5;
        let slice = 1;
        let start = (parseInt(await vesting_contract.getTime())) + 2;
        let cliff = 0;
        let baneficiaries = await token1_contract.owner();
        let addressOfToken = await token1_contract.address;

        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)
        //this function is used to increaase block time
        await network.provider.send("evm_increaseTime", [100])
        await network.provider.send("evm_mine")
        await vesting_contract.withdraw(2);
        expect(await token1_contract.balanceOf(owner.address)).to.equal(UserBalance)
    })

    it("calculate withdar token is correct",async function(){
        let UserBalance = await token1_contract.balanceOf(owner.address)
        let ammount = 100;
        let duration = 100;
        let slice = 8;
        let start = (parseInt(await vesting_contract.getTime())) + 2;
        let cliff = 0;
        let baneficiaries = await token1_contract.owner();
        let addressOfToken = await token1_contract.address;

        await vesting_contract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken)
        //this function is used to increaase block time
        await network.provider.send("evm_increaseTime", [10])
        await network.provider.send("evm_mine")
        // await vesting_contract.calculate_available_withdraw_token(3);
        expect(await vesting_contract.callStatic.calculate_available_withdraw_token(3)).to.equal(8)
    })
})  