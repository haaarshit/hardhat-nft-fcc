// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    // mint function to mint nft
    // store SVG info somewhere
    // some logic to Show X image or Y image

    // states
    uint256 private s_tokenCounter;
    string private i_lowImageUri;
    string private i_highImageUri;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) s_tokenIdToHighValue;

    // events
    event nftCreated(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicSvgNft", "DSN") {
        s_tokenCounter = 0;
        i_lowImageUri = svgToImageUri(lowSvg);
        i_highImageUri = svgToImageUri(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))  
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        emit nftCreated(s_tokenCounter, highValue);
    }

    // prefix for Base64 json is  data:application/json;base64,
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Query for non existing token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = i_highImageUri;
        price >= s_tokenIdToHighValue[s_tokenCounter]
            ? imageURI = i_highImageUri
            : imageURI = i_lowImageUri;

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return i_lowImageUri;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
