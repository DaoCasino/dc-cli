const fs = require('fs')
const path = require('path')
const Utils = require('./Utils')
const { PingService } = require('bankroller-core/lib/dapps/PingService')
const { IpfsTransportProvider } = require('dc-messaging')

module.exports = class Deployer {
  constructor (params) {
    this._params = params
    this._gameUploadData = null
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
    this._gameUploadData = {
      platformID: options.platformid,
      gamePath: options.gamepath,
      bankrollerAddress: options.address,
      gameName: options.gamename,
      gameFiles: null
    }

    if (!this._gameUploadData.platformID) {
      this._gameUploadData.platformID = (await this._params.prompt(
        this._params.getQuestion('inputPlatformID')
      )).platformID
    }

    if (!this._gameUploadData.bankrollerAddress) {
      this._gameUploadData.bankrollerAddress = (await this._params.prompt(
        this._params.getQuestion('inputBankrollerAddress')
      )).bankrollerAddress
    }

    if (!this._gameUploadData.gameName) {
      this._gameUploadData.gameName = (await this._params.prompt(
        this._params.getQuestion('inputGameName')
      )).gamename
    }

    if (!this._gameUploadData.gamePath) {
      this._gameUploadData.gamePath = (await this._params.prompt(
        this._params.getQuestion('inputGamePath')
      )).gamePath
    }

    this._provider = await IpfsTransportProvider.create()
    this._pingService = await this._provider.getRemoteInterface(this._gameUploadData.platformID)
    this._pingService.on(PingService.EVENT_JOIN, async (data) => this._uploadGame(data))
  }

  async deployGameToIPFS () {
    console.log('comming soon...')
  }

  async _uploadGame (data) {
    console.log(data.ethAddress, this._gameUploadData.bankrollerAddress)
    if (data.ethAddress === this._gameUploadData.bankrollerAddress) {
      // this._pingService.off(PingService.EVENT_JOIN, async (data) => this._uploadGame(data))
      try {
        let gameFiles = []
        const targetGamePath = path.join(process.cwd(), this._gameUploadData.gamePath)
        if (fs.existsSync(targetGamePath)) {
          gameFiles = fs.readdirSync(targetGamePath)
            .filter(fileName => {
              const fileNameTemplate = /dapp[\.\-_](manifest|logic)\.js/
              if (fileNameTemplate.test(fileName)) {
                return {
                  fileName: fileName,
                  fileData: fs.readFileSync(path.join(targetGamePath, fileName))
                }
              }
            })
        }

        const bankrollerInstance = await this._provider.getRemoteInterface(data.apiRoomAddress)
        console.log({
          name: this._gameUploadData.gameName,
          files: gameFiles,
          reload: true
        })
        const uploadGame = await bankrollerInstance.uploadGame({
          name: this._gameUploadData.gameName,
          files: gameFiles,
          reload: true
        })
        
        if (uploadGame.status === 'ok') {
          console.log('Upload game success')
          this._provider.destroy()
        }
      } catch (error) {
        Utils.exitProgram(process.pid, error, 1)
      }
    }
  }
}
