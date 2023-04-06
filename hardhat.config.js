// require("@nomicfoundation/hardhat-toolbox");
require("./task/task1");
const { config } = require('dotenv');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
config();
const ACCOUNT_PRIVATE_KEY=process.env.ACCOUNT_PRIVATE_KEY;
const SEPOLIA_RPC_URL= process.env.SEPOLIA_RPC_URL;
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.18",

  networks:{
    sepolia:{
      url:`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts:[`${SEPOLIA_PRIVATE_KEY}`],
      gas: 'auto',
      
    }
  },
  etherscan: {
    apiKey: {
      sepolia: "WSG13CQU7C9GAHQIRH3J51BPRDYDSC835B"
    }
  }
};