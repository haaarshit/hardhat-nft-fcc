const { assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");


!developmentChains.includes(network.name)
    ?
    describe.skip
    :
    describe("Basic nft test", () => {

        let basicNFT, deployer

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["basicnft"])
            basicNFT = await ethers.getContract("BasicNft", deployer)
        })

        // 
        describe('Constructor', () => {
            it("Initializing nft successfully", async () => {
                const name = await basicNFT.name()
                const symbol = await basicNFT.symbol()
                const tokenCounter = await basicNFT.getTokenCounter()
                assert.equal(name, "Dogie")
                assert.equal(symbol, "DOG")
                assert.equal(tokenCounter.toString(), "0")
            })
        })
        describe("Mint nft", () => {
            it("Counter updated successfully", async () => {
                 await basicNFT.mintNft()
                const tokenCounter = await basicNFT.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
            })
        })
    })