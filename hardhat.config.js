require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
const PRIVATE_KEY = process.env.PRIVATE_KEY

// optional
// const MNEMONIC = process.env.MNEMONIC || "your mnemonic"
// /root/hardhat-fcc/hardhat-defi-fcc/cache
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // // If you want to do some forking, uncomment this
      // forking: {
      //   url: MAINNET_RPC_URL
      // },
      chainId: 31337,

    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 11155111,
      blockConfirmation: 6,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  contractSizer: {
    runOnCompile: false,
    only: ["OurToken"],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    user1: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.4.19",
      },
    ],
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
}