const { task } = require("hardhat/config");
task("VerifyContract", "Verify deployed contract on Etherscan")
    .addParam("contract", "Contract address deployed")
    .addParam("address", "Enter token address")
    .addParam("amount","Initital supply")
    .setAction(async (args) => {
        try {
            await hre.run("verify:verify", {
                address: args.address,
                contract: args.contract,
                constructorArguments: [args.amount],
            });
        }
        catch ({ message }) {
            console.error(message);
        }
    });