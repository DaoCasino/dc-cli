const fs = require('fs')
const path = require('path')
const Utils = require('./Utils')
const { Bankroller } = require('bankroller-core/lib/dapps/Bankroller')
const { PingService } = require('bankroller-core/lib/dapps/PingService')
const { IpfsTransportProvider } = require('dc-messaging')

module.exports = class Deployer {
  constructor (params) {
    this._params = params
  }

  async migrateContract (options) {
    let blockchainNetwork = options.network
    if (!options.stdmigrate) {
      process.env.CONTRACTS_PATH = path.join(
        process.cwd(),
        './dapp/contracts'
      )
    }

    try {
      if (!blockchainNetwork) {
        blockchainNetwork = (await this._params.prompt(
          this._params.getQuestion('selectBlockchainNetwork')
        )).blockchainNetwork
      }

      if (blockchainNetwork !== 'local') {
        process.env.MNEMONIC = (await this._params.prompt(
          this._params.getQuestion('inputMnemonic')
        )).mnemonic
      }

      const contractMigrate = await Utils.startCLICommand(
        `npm run migrate:${blockchainNetwork}`,
        path.join(__dirname, '../')
      )

      if (contractMigrate.status === 'success') {
        console.log(`Contracts deploy to ${blockchainNetwork} successed`)
        return contractMigrate.status
      } else {
        throw new Error('Contracts is not migrate to the network')
      }
    } catch (error) {
      throw error
    }
  }

  async uploadGameToBankroller (options) {
    let bankrollerAddress = options.address
    let platformID = options.platformid
    let gamePath = options.gamepath
    let gameName = options.gamename

    if (!platformID) {
      platformID = (await this._params.prompt(
        this._params.getQuestion('inputPlatformID')
      )).platformID
    }

    if (!bankrollerAddress) {
      bankrollerAddress = (await this._params.prompt(
        this._params.getQuestion('inputBankrollerAddress')
      )).bankrollerAddress
    }

    if (!gameName) {
      gameName = (await this._params.prompt(
        this._params.getQuestion('inputGameName')
      )).gamename
    }

    if (!gamePath) {
      gamePath = (await this._params.prompt(
        this._params.getQuestion('inputGamePath')
      )).gamePath
    }

    const targetGamePath = path.join(process.cwd(), gamePath)

    let gameFilesinBuffer = null
    if (fs.existsSync(targetGamePath)) {
      gameFilesinBuffer = fs.readdirSync(targetGamePath)
        .map(fileName => {
          const fileNameTemplate = /dapp[\.\-_](manifest|logic)\.js/
          if (fileNameTemplate.test(fileName)) {
            return {
              fileName: fileName,
              fileData: fs.readFileSync(path.join(targetGamePath, fileName))
            }
          }
        })
    }

    const provider = await IpfsTransportProvider.create()
    const getPeerInstance = await provider.getRemoteInterface(platformID)
   
    getPeerInstance.on(PingService.EVENT_JOIN, async data => {
      console.log(data.ethAddress, bankrollerAddress, gameFilesinBuffer)
      if (data.ethAddress === bankrollerAddress) {
        try {
          const bankrollerInstance = await provider.getRemoteInterface(data.apiRoomAddress)
          const uploadGame = await bankrollerInstance.uploadGame(gameName, gameFilesinBuffer)
          
          if (uploadGame.status === 'ok') {
            console.log('Upload game success')
            provider.destroy()
          }
        } catch (error) {
          Utils.exitProgram(process.pid, error, 1)
        }
      }
    })
  }

  async deployGameToIPFS () {
    console.log('comming soon...')
  }
}
