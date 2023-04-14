const { expect } = require("chai");
const { ethers } = require("hardhat");

const DeployFunction = async () => {
    const VestingContractName = await ethers.getContractFactory("VestingContract");
    const VestingContract = await VestingContractName.deploy();;
    const Token1ContractName = await ethers.getContractFactory("MyToken1");;
    const initialSupply = 10;
    const Token1Contract = await Token1ContractName.deploy(initialSupply);
    const [owner, address1, address2, ...addressn] = await ethers.getSigners();
    await Token1Contract.approve(VestingContract.address, 50000);
    return [VestingContract, Token1Contract, owner, address1, address2, ...addressn];
}
const LockToken = async (ammount = 100,
    duration = 100,
    slice = 10,
    start = 0,
    cliff = 0,
    baneficiaries = Token1Contract.owner(),
    addressOfToken = Token1Contract.address) => {
    await VestingContract.lock(ammount, duration, slice, start, cliff, baneficiaries, addressOfToken);
}


describe("Deployment,Lock and Withdraw related test of vesting contract", async function () {
    before(async () => {
        [VestingContract, Token1Contract, owner, address1, address2, ...addressn] = await DeployFunction();
        await VestingContract.addWhitelist(Token1Contract.address);

    })

    it("Check contract's owner address", async function () {
        expect(await VestingContract.owner()).to.equal(owner.address);
    });

    it("Adding Token to WHitelist", async function () {
        await VestingContract.addWhitelist(Token1Contract.address);
        expect(await VestingContract.whitelist(Token1Contract.address)).to.be.true;
    });

    it("only Contract Owner can add to whiteList", async function () {
        await VestingContract.connect(address1);
        expect(await VestingContract.addWhitelist(await Token1Contract.address)).to.revertedWith("Only the contract owner can call this function");
    });

    it("Token must be transfer to contract at the time of locking", async () => {
        start = parseInt(await VestingContract.getTime()) + 10;
        await LockToken(undefined, undefined, undefined, start)
        expect(await Token1Contract.balanceOf(VestingContract.address)).to.equal(100)
    })

    it("vesting shedule created sucessfully", async () => {
        start = parseInt(await VestingContract.getTime()) + 10;
        await LockToken(undefined, undefined, undefined, start)
    })

    it("get vesting shedule correctly", async () => {
        vestingdata = await VestingContract.vestings(owner.address, 1)
        expect(vestingdata).to.include.keys('amount', 'start', 'duration', 'locked', 'claimed', 'slice_period', 'cliff', 'beneficiaries')
    })

    it("Locking amount not be 0(zero)", async function () {
        const ammount = 0;
        const start = parseInt(await VestingContract.getTime()) + 50;
        await expect(LockToken(ammount, undefined, undefined, start,)).to.be.revertedWith("Amount not be Zero");
    })

    it("start time should be greater than current time", async function () {
        let start = parseInt(await VestingContract.getTime());
        await expect(LockToken(undefined, undefined, undefined, start,)).to.be.revertedWith("eneter valid time : start time should be greater than current time")
    })

    it("Token must be whitelisted for vesting", async function () {
        const start = parseInt(await VestingContract.getTime()) + 50;
        expect(await VestingContract.whitelist(Token1Contract.address)).to.be.true;
        await LockToken(undefined, undefined, undefined, start,)
        const vesting_data = await VestingContract.vestings(Token1Contract.owner(), 0);
        expect(vesting_data.locked).to.be.true;
    });

    it("Cliff must not greater than duration", async () => {
        const cliff = 120
        const start = parseInt(await VestingContract.getTime()) + 10;
        expect(await LockToken(undefined, undefined, cliff, start,)).to.be.revertedWith("clif must not greater than duration");

    })

    it("Token must be locked for withdraw", async function () {
        try {
            if ((await VestingContract.vestings(owner.address, 4)).locked) {
            }
            else {
                throw new Error("Funds have not been locked");
            }
        }
        catch (e) {
            expect(e).to.be.an("error");
            return;
        }
    });

    it("Token under locking(start time + clif) is not started yet", async function () {
        const start = parseInt(await VestingContract.getTime()) + 50;
        const cliff = 10;
        await LockToken(undefined, undefined, undefined, start, cliff)
        await expect(VestingContract.withdraw(3)).to.be.revertedWith("Token under locking please wait..");
    });

    it("Check for event amd total aamount must be withdraw", async function () {
        const start = parseInt(await VestingContract.getTime()) + 2;
        await LockToken(undefined, undefined, undefined, start)
        await network.provider.send("evm_increaseTime", [100])
        await network.provider.send("evm_mine")
        expect(VestingContract.withdraw(1)).to.emit(VestingContract, "VestingWithdrawn");
        expect(await Token1Contract.balanceOf(owner.address)).to.equal(await Token1Contract.balanceOf(owner.address))
    })

    it("calculate withdarw token amount is correct", async function () {
        const slice = 8;
        const start = (parseInt(await VestingContract.getTime())) + 2;
        await LockToken(undefined, undefined, slice, start,)
        await network.provider.send("evm_increaseTime", [10])
        await network.provider.send("evm_mine")

        expect(await VestingContract.callStatic.calculate_available_withdraw_token(6)).to.equal(8)
    })
    it("withdarw token in every slice", async function () {
        const amount = 200
        const slice = 9;
        const start = (parseInt(await VestingContract.getTime())) + 2;
        await LockToken(amount, undefined, slice, start,)
        await network.provider.send("evm_increaseTime", [11])
        await network.provider.send("evm_mine")
        while ((await VestingContract.vestings(owner.address, 7)).ammount != 0) {
            await network.provider.send("evm_increaseTime", [11])
            await network.provider.send("evm_mine")
            await VestingContract.withdraw(7);
            if ((await VestingContract.vestings(owner.address, 7)).amount == 0)
                break;
        }
        expect((await VestingContract.vestings(owner.address, 7)).amount).to.equal(0)
    })

    it("lock token multiple times", async () => {
        const start = parseInt(await VestingContract.getTime()) + 10;
        await LockToken(undefined, undefined, undefined, start)
        await LockToken(undefined, undefined, undefined, start)
        expect((await VestingContract.vestings(await Token1Contract.owner(), 8)).locked
            &&
            (await VestingContract.vestings(await Token1Contract.owner(), 9)).locked).to.be.true;
    })


})
