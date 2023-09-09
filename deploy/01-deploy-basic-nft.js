const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");


module.exports = async({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()

    log('---------------------------')
    const args= []
    const basisNFT = await deploy("BasicNft",{
        from:deployer,
        args:args,
        log:true,
        waitForConfirmations:network.config.blockConfirmations,
    })

    if(!developmentChains.includes(network.name)){
        log("verifying..........")
        await verify(basisNFT.address,args)
    }

    log('----------------------------')

}
module.exports.tags = ["all","basicnft","main"]