const { network, ethers, deployments } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name) ?
    describe.skip
    :
    describe('Randomnftipfstest', () => {

        let randomIpfsNft, deployer, vrfCoordinatorV2Mock

        beforeEach(async () => { 
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "randomipfs"])
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            randomIpfsNft = await ethers.getContractAt("RandomIpfsNft", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",deployer)
            console.log("Randomeipfs ",randomIpfsNft)
        }) 

        describe("Constructor", () => {
            it("should intialize everything", async () => {
                const mintFee = networkConfig[network.config.chainId]["mintFee"]
                
                const s_mintFee = await randomIpfsNft.getMintFee()
                const s_tokenCounter = await randomIpfsNft.getTokenCounter()
                assert.equal(mintFee.toString(), s_mintFee.toString())
                assert.equal(s_tokenCounter.toString(), "0")
            })
        })
    })