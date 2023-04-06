const { task } = require("hardhat/config");

task("DeployToken1", "This task is deploying Contract for token 1", async (args) => {
    const tokenContract1 = await ethers.getContractFactory("MyToken1");
    const [owner] = await ethers.getSigners();
    const token1 = await tokenContract1.deploy(args.arg1);
    console.log("MyToken1 contract deployed successfully By : " + [owner.address] + " at address : " + token1.address);
}).addParam("arg1", "Initial supply")

task("DeployToken2", "This task is deploying contract for token 2", async (args) => {
    const tokenContract2 = await ethers.getContractFactory("MyToken2");
    const [owner] = await ethers.getSigners();
    const token2 = await tokenContract2.deploy(args.arg1);
    console.log("MyToken2 contract deployed successfully By : " + [owner.address] + " at address : " + token2.address);
}).addParam("arg1","initial supply");

task("DeployMain", "This task is deploying Vesting contract.", async () => {
    const tokenContractMain = await ethers.getContractFactory("VestingContract");
    const [owner] = await ethers.getSigners();
    const Vesting = await tokenContractMain.deploy();
    console.log("MyToken2 contract deployed successfully By : " + [owner.address] + " at address : " + Vesting.address);
})


module.exports = {}