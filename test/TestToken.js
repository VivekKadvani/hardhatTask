const { expect } = require("chai");

describe("Deployment related test of token", async function(){
  let contractName;
  let contract;
  let owner,address1,address2,addressn;
  let initialSupply

before(async function(){
  contractName = await ethers.getContractFactory("MyToken1");
  [owner, address1, address2, ...addressn] = await ethers.getSigners();
  initialSupply =10
  contract = await contractName.deploy(initialSupply);

})

  it("Check contract's owner address", async function(){
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Transfer all token to owner's address",async function(){
    expect(await contract.balanceOf(owner.address)).to.equal (initialSupply**await contract.decimals());
  })


})