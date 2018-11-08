import {
  DeployerInstance,
  InstanceParams,
  UploadGameData,
  MigrationParams
} from './interfaces/IDApp'
import fs from 'fs'
import path from 'path'
import program from 'commander'
import * as Utils from './Utils'
import { Logger } from 'dc-logging'
import { PingService } from 'bankroller-core/lib/dapps/PingService'
import { IpfsTransportProvider } from 'dc-messaging'

const log = new Logger('Deployer')

export default class Deployer implements DeployerInstance {
  protected _params: InstanceParams
  private _gameUploadData: UploadGameData
  private _provider: IpfsTransportProvider
  private _pingService

  constructor (params: InstanceParams) {
    this._params = params
    this._gameUploadData = null
  }

  async migrateContract (options: program.Command | MigrationParams) {
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
        log.info(`Contracts deploy to ${blockchainNetwork} successed`)
        return contractMigrate.status
      } else {
        throw new Error('Contracts is not migrate to the network')
      }
    } catch (error) {
      throw error
    }
  }

  async uploadGameToBankroller (options: any): Promise<void> {
    this._gameUploadData = {
      platformID: options.platformid,
      gamePath: options.gamePath,
      bankrollerAddress: options.address,
      gameName: options.name,
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
    log.info('comming soon...')
  }

  async publishGame () {
    log.info('comming soon...')
  }

  async _uploadGame (data) {
    if (data.ethAddress.toLowerCase() === this._gameUploadData.bankrollerAddress.toLowerCase()) {
      try {
        let gameFiles = []
        const targetGamePath = path.join(process.cwd(), this._gameUploadData.gamePath)
        const fileNameTemplate = /dapp[\.\-_](manifest|logic)\.js/

        if (fs.existsSync(targetGamePath)) {
          gameFiles = fs.readdirSync(targetGamePath)
            .filter(fileName => (fileNameTemplate.test(fileName)) && fileName)
            .map(fileName => {
              return {
                fileName,
                fileData: fs.readFileSync(path.join(targetGamePath, fileName), 'utf-8')
              }
            })
        }

        const bankrollerInstance: any = await this._provider.getRemoteInterface(data.apiRoomAddress)
        const uploadGame = await bankrollerInstance.uploadGame({
          name: this._gameUploadData.gameName,
          files: gameFiles,
          reload: true
        })

        if (uploadGame.status === 'ok') {
          log.info('Upload game success')
          Utils.exitProgram(process.pid, false, 0)
        }
      } catch (error) {
        Utils.exitProgram(process.pid, error, 1)
      }
    }
  }
}
