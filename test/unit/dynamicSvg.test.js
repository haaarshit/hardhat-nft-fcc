const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name) ?
    describe.skip
    :
    describe('Dynamic SVG test', () => {
        let dynamicSvg, mockV3Aggregator
        beforeEach(async () => {
            accounts = await ethers.getSigners()
            const deployer = accounts[0]
            await deployments.fixture(["mocks", "dynamicsvg"])
            dynamicSvg = await ethers.getContract("DynamicSvgNft")
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        })
        describe("Constructor", () => {
            it("Set values correctlly", async () => {
                const priceFeedAddress = await dynamicSvg.getPriceFeed()
                const tokenCounter = await dynamicSvg.getTokenCounter()
                assert.equal(tokenCounter.toString(), "0")
                assert.equal(priceFeedAddress, await mockV3Aggregator.getAddress())
            })
        })

        describe("mintNft", () => {
            it("emits an event and creates the NFT", async () => {
                const highValue = ethers.parseEther("1") // 1 dollar per ether
                expect(await dynamicSvg.mintNft(highValue)).to.emit(
                    dynamicSvg,
                    "nftCreated"
                )
                const tokenCounter = await dynamicSvg.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
            })
        })
    })
