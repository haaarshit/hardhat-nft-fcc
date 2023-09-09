const pinataSdk = require("@pinata/sdk")
const fs = require("fs")
const path = require("path")

const pintatApiKey = process.env.PINATA_API_KEY
const pintatSecretKey = process.env.PINATA_API_SECRET
const pinata = pinataSdk(pintatApiKey, pintatSecretKey)

const storeImages = async (imageFilePath) => {

    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    console.log(files)
    let responses = []
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

const storeTokenUriMetadata = async (metadata) => {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
}

module.exports = { storeImages, storeTokenUriMetadata }