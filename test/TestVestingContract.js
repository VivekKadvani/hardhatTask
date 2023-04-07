const { expect } = require("chai");

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
        let duraction = 100;
        let slice = 10;
        let start = await vesting_contract.getTime() + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        await expect(vesting_contract.lock(0, duraction, slice, start, cliff, baneficiaries, addressOfToken)).to.be.revertedWith("Amount not be Zero");
        await vesting_contract.lock(ammount, duraction, slice, start, cliff, baneficiaries, addressOfToken)
    })

    it("start time should be greater than current time", async function () {
        let ammount = 100;
        let duraction = 100;
        let slice = 10;
        let start = await vesting_contract.getTime() + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(start).to.be.greaterThan(await vesting_contract.getTime())
        await vesting_contract.lock(ammount, duraction, slice, start, cliff, baneficiaries, addressOfToken)

    })

    it("Token must be whitelisted for vesting", async function () {
        let ammount = 100;
        let duraction = 100;
        let slice = 10;
        let start = await vesting_contract.getTime() + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(await vesting_contract.whitelist(addressOfToken)).to.be.true;
        await vesting_contract.lock(ammount, duraction, slice, start, cliff, baneficiaries, addressOfToken)

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
        expect(await vesting_contract.vestings(owner.address, 0).locked).to.undefined.revertedWith("Funds have not been locked");
    })

    it("Token under locking(start time + clif) is not started yet",async function(){
        let ammount = 100;
        let duraction = 100;
        let slice = 10;
        let start = await vesting_contract.getTime() + 50;
        let cliff = 10;
        let baneficiaries = token1_contract.owner();
        let addressOfToken = token1_contract.address;
        expect(await vesting_contract.whitelist(addressOfToken)).to.be.true;
        await vesting_contract.lock(ammount, duraction, slice, start, cliff, baneficiaries, addressOfToken)

        expect(await vesting_contract.getTime()> await vesting_contract.vestings(owner.address).start).to.revertedWith("Token under locking please wait..");
    })
})