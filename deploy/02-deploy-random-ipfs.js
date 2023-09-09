const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
const imagesLocation = './images/randomNft'
const { verify } = require("../utils/verify")
require("dotenv").config()

// store metadata for tokenuri
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: {
    trait_type: "Cuteness",
    value: 100
  }
}


let tokenUris = [
  'ipfs://QmUPppocq3X1eAepEQR3KRgojjpRoS155FsYqwafen5AYo',
  'ipfs://QmVDMaYWYiw1GMbzp3atuqN4Hepu9Wv95wxCAwf24QrL4M',
  'ipfs://QmbMh8o41PqYCzG6vgafUJC7jkE4kpSvU8xu5bNBuUnWdi'
]

const FUND_AMOUNT = "250000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  

  const chainId = network.config.chainId
  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

  if (process.env.UPLOAD_TO_PINATA == "true") {
    await handleTokenuri()
  }

  if (chainId == 31337) {
    // create VRFV2 Sub scription
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress()
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.logs[0].args.subId
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    subscriptionId = networkConfig[chainId].subscriptionId
  }

  log('---------------------------')

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
    networkConfig[chainId]["mintFee"]
  ]
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })  
  
  if (chainId == 31337) {
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
  }

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("verifying..........")
    await verify(randomIpfsNft.address, args)
  } 

  log('----------------------------')
}

const handleTokenuri = async () => {
  let tokenUris = []
  // store image in IPFS
  // store metadata in IPFS
  const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
  for (imageUploadResponseIndex in imageUploadResponses) {
    // create metadata
    // upload metadata
    let tokenUriMetaData = { ...metadataTemplate }
    tokenUriMetaData.name = files[imageUploadResponseIndex].replace(".png", "")
    tokenUriMetaData.description = `An adorable ${tokenUriMetaData.name} nft`
    tokenUriMetaData.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
    console.log(`Uploading ${tokenUriMetaData.name}`)
    // store the json 
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetaData)
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
  }
  console.log("Token uris uploaded...")
  console.log(tokenUris)
  return tokenUris
}
module.exports.tags = ["all", "randomipfs", "main"]