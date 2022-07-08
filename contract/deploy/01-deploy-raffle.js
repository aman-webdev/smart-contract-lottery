const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let vrfCoordinatorV2Address, subscriptionId
    const chainId = network.config.chainId
    console.log(chainId, "chainId: ")
    const entranceFee = networkConfig[chainId].entranceFee
    console.log(entranceFee)
    const gasLane = networkConfig[chainId].gasLane
    const vrfSubscriptionFundAmount = ethers.utils.parseEther("30")
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit
    const interval = networkConfig[chainId].interval

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        const txResponse = await vrfCoordinatorV2Mock.createSubscription()
        log(txResponse)
        const txReceipt = await txResponse.wait(1)
        log(txReceipt, "received")
        subscriptionId = txReceipt.events[0].args.subId
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, vrfSubscriptionFundAmount)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying....")
        await verify(raffle.address, args)
    }

    log("-------------------------------------------")
}

module.exports.tags = ["all", "raffle"]
