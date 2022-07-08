const { developmentChains } = require("../../helper-hardhat-config")
const { network, ethers, getNamedAccounts, deployments } = require("hardhat")
const { expect, assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Test", () => {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer

              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfill random words", () => {
              it("works with live chainlink keepers and chainlink vrf", async () => {
                  const startingTimestamp = await raffle.getLatestTimestamp()
                  console.log("first")
                  const [deployerAccount] = await ethers.getSigners()
                  console.log("second")
                  await new Promise(async (resolve, reject) => {
                      console.log("third", raffle.address)
                      raffle.once("winnerPicked", async () => {
                          console.log("Winner picked event fired")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerBalance = await deployerAccount.getBalance()
                              const endingTimestamp = await raffle.getLatestTimestamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), deployerAccount.toString)
                              assert.equal(raffleState.toString(), "0")
                              assert.equal(
                                  winnerBalance,
                                  winnerStartingBalance.add(raffleEntranceFee.toString())
                              )
                              assert(endingTimestamp > startingTimestamp)
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      console.log("entering raffle")
                      console.log(deployerAccount, "deployerAccount")
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      const winnerStartingBalance = await deployerAccount.getBalance()
                  })
              })
          })
      })
