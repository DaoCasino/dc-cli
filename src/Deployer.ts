import {
  DeployerInstance,
  InstanceParams,
  UploadGameData,
  MigrationParams
} from './interfaces/IDApp'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
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
    let network = options.network
    let mnemonic = null
    let contractsPath = null
    const STD_CONTRACTS = options.stdmigrate
    const DEFAULT_CONTRACTS_PATH = path.join(process.cwd(), './dapp/contracts')
    try {
      if (!network) {
        network = (await this._params.prompt(
          this._params.getQuestion('selectBlockchainNetwork')
        )).blockchainNetwork
      }
      
      if (network !== 'local') {
        mnemonic = (await this._params.prompt(
          this._params.getQuestion('inputMnemonic')
        )).mnemonic
      }

      if (STD_CONTRACTS) {
        log.info(chalk.yellow('Use standart dc-protocol contract')) 
      } else if (!fs.existsSync(DEFAULT_CONTRACTS_PATH)) {
        const GET_PATH = (await this._params.prompt(
          this._params.getQuestion('inputContractsPath')
        )).contractsPath

        contractsPath = path.join(process.cwd(), GET_PATH)
        if (!fs.existsSync(contractsPath)) {
          throw new Error(`directory is not exist path: ${contractsPath}`)
        }
      }

      const contractMigrate = await Utils.startCLICommand(
        `node CLI migrate --network ${network}`,
        path.join(path.dirname(require.resolve('dc-protocol')), '/bin'),
        {
          MNEMONIC: mnemonic,
          CONTRACTS_PATH: contractsPath
        }
      )

      if (contractMigrate.status === 'success') {
        log.info(`>> Contracts deploy to ${network} network successed <<`)
        return contractMigrate.status
      }
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(error.message), 1)
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
