require("@nomicfoundation/hardhat-toolbox");
//In this part all task 
require("./task/deploy");
require("./task/compile")
require("./task/verify")

//in this part all requier external package
const { config } = require('dotenv');
// require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
config();
const ACCOUNT_PRIVATE_KEY=process.env.ACCOUNT_PRIVATE_KEY;
const SEPOLIA_RPC_URL= process.env.SEPOLIA_RPC_URL;
const ALCHEMY_API_KEY=process.env.ALCHEMY_API_KEY;
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY;
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.18",

  networks:{
    sepolia:{
      url:`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts:[`${ACCOUNT_PRIVATE_KEY}`],
      gas: 'auto',
      
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  }
};