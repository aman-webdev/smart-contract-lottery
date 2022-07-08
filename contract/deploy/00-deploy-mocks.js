const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // premium as it cost 0.25 per req
const GAS_PRICE_LINK = 1e9
const args = [BASE_FEE, GAS_PRICE_LINK]
// calculated value based on the gas price of the chain
// The chainlink nodes are actually the one which pay the gas fee for requesting randomness, executing upkeep etc.
//So the price of req changes based on the gas price of the chain

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        log("Local network")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args,
            log: true,
        })

        log("Mocks Deployed")
        log("-----------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
