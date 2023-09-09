const { network, ethers } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const fs = require("fs");
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts()

    let ethUsdPriceFeed
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeed = await ethUsdAggregator.getAddress()
    } else {
        ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed
    }

    log("----------------------------------------")
    const lowSVG =  fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" });
    const hihgSVG =  fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" });
    
    args = [ethUsdPriceFeed, lowSVG, hihgSVG]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        verify(dynamicSvgNft.address, args)
    }

}

module.exports.tags = ["all","dynamicsvg","main"]