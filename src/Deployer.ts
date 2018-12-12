import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import program from 'commander'
import * as Utils from './Utils'
import {
  DeployerInstance,
  InstanceParams,
  UploadGameData,
  UnloadGameData,
  MigrationParams,
} from './interfaces/IDApp'
import { Logger } from 'dc-logging'
import { PingService } from 'bankroller-core/lib/dapps/PingService'
import { IPingService, PingServiceParams, IBankroller } from 'bankroller-core/lib/intefaces'
import { TransportProviderFactory, ITransportProviderFactory, IMessagingProvider, TransportType } from 'dc-messaging'

const log = new Logger('Deployer')

export default class Deployer implements DeployerInstance {
  protected _params: InstanceParams
  private _transportProviderFactory: ITransportProviderFactory
  private _provider: IMessagingProvider
  private _pingService: IPingService

  constructor (params: InstanceParams) {
    this._params = params
  }

  async migrateContract (options: program.Command | MigrationParams) {
    let network = options.network
    let mnemonic = null
    let contractsPath = null
    const USE_STD_CONTRACTS = options.stdmigrate
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

      if (USE_STD_CONTRACTS) {
        log.info(chalk.yellow('Use standart dc-protocol contract for migrate')) 
      } else if (!fs.existsSync(DEFAULT_CONTRACTS_PATH)) {
        const GET_PATH = (await this._params.prompt(
          this._params.getQuestion('inputContractsPath')
        )).contractsPath

        contractsPath = path.join(process.cwd(), GET_PATH)
        const PATH_TO_MIGRATE_CONTRACT = path.join(contractsPath, 'devtools/Migrations.sol')
        if (!fs.existsSync(PATH_TO_MIGRATE_CONTRACT)) {
          log.info(chalk.yellow(`
            \rIn ${chalk.cyan(contractsPath)}
            \rnot ${chalk.green('Migrations.sol')} contract so dc-cli
            \rwill use standart contract for migrate
          `)) 
        }
      }

      const contractMigrate = await this._params.processManager.startChildProcess(
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

  async uploadGameToBankroller (options: program.Command): Promise<void> {
    let {
      address: targetBankrollerAddress,
      gamePath,
      platformid
    } = options

    switch (true) {
      case !platformid:
        platformid = (await this._params.prompt(
          this._params.getQuestion('inputPlatformID')
        )).platformID
      case !targetBankrollerAddress:
        targetBankrollerAddress = (await this._params.prompt(
          this._params.getQuestion('inputBankrollerAddress')
        )).bankrollerAddress
      case !gamePath:
        gamePath = (await this._params.prompt(
          this._params.getQuestion('inputGamePath')
        )).gamePath
    }

    const TARGET_GAME_PATH = path.join(process.cwd(), gamePath)
    const FILE_NAME_TEMPLATE = /dapp[\.\-_](manifest|logic)\.js/

    if (!fs.existsSync(TARGET_GAME_PATH)) {
      throw new Error(chalk.red(`TARGET_GAME_PATH: ${chalk.cyan(TARGET_GAME_PATH)} not exists`))
    }

    const GAME_FILES = fs.readdirSync(TARGET_GAME_PATH)
      .filter(fileName => (FILE_NAME_TEMPLATE.test(fileName)) && fileName)
      .map(fileName => {
        return {
          fileName,
          fileData: fs.readFileSync(
            path.join(TARGET_GAME_PATH,
            fileName
          )).toString('base64')
        }
      })
    
    if (GAME_FILES.length < 2) {
      throw new Error(chalk.red(`Not logic game and manifest file in ${chalk.cyan(TARGET_GAME_PATH)}`))
    }

    try {
      const GAME_DIRECTORY_NAME = require(path.join(TARGET_GAME_PATH, 'dapp.manifest.js')).slug
      await this._pingServiceConnect(platformid, async data => {
        if (data.ethAddress.toLowerCase() === targetBankrollerAddress.toLowerCase()) {
          const UPLOAD_DATA: UploadGameData = {
            ...data,
            gameFiles: GAME_FILES,
            targetGamePath: TARGET_GAME_PATH,
            gameDirectoryName: GAME_DIRECTORY_NAME,
          }

          this._uploadGame(UPLOAD_DATA)
        }
      })

      this._pingService.emit(PingService.EVENT_PING, null)     
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(`${error.message} please try upload again`), 1)
    }
  }

  async unloadGameInBankroller(options: program.Command): Promise<void> {
    let {
      address: targetBankrollerAddress,
      gameName,
      platformid
    } = options

    switch (true) {
      case !platformid:
        platformid = (await this._params.prompt(
          this._params.getQuestion('inputPlatformID')
        )).platformID
      case !targetBankrollerAddress:
        targetBankrollerAddress = (await this._params.prompt(
          this._params.getQuestion('inputBankrollerAddress')
        )).bankrollerAddress
      case !gameName:
        gameName = (await this._params.prompt(
          this._params.getQuestion('inputGameName')
        )).gamePath
    }

    try {
      await this._pingServiceConnect(platformid, async data => {
        if (data.ethAddress.toLowerCase() === targetBankrollerAddress.toLowerCase()) {
          const UNLOAD_PARAMS = { ...data, gameName }
          await this._unloadGame(UNLOAD_PARAMS)
        }
      })

      this._pingService.emit(PingService.EVENT_PING, null)     
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(`${error.message} please try upload again`), 1)
    }
  }

  async deployGameToIPFS () {
    log.info('comming soon...')
  }

  async publishGame () {
    log.info('comming soon...')
  }

  private async _pingServiceConnect (
    platformid: string,
    handler: (data: PingServiceParams) => Promise<void>
  ): Promise<void> {
    try {
      this._transportProviderFactory = new TransportProviderFactory(TransportType.IPFS)
      this._provider = await this._transportProviderFactory.create()
      this._pingService = await this._provider.getRemoteInterface<IPingService>(
        platformid
      )

      this._pingService.on(PingService.EVENT_PONG, handler)
      log.info(chalk.green('\nPing service connection estimate!\n'))
    } catch (error) {
      throw error
    }
  }

  private async _uploadGame (data: UploadGameData): Promise<void> {
    const {
      gameFiles,
      apiRoomAddress,
      gameDirectoryName,
    } = data

    try {
      const bankrollerInstance = await this._provider.getRemoteInterface<IBankroller>(
        apiRoomAddress
      )
      
      const uploadGame = await bankrollerInstance.uploadGame({
        name: gameDirectoryName,
        files: gameFiles,
        reload: true
      })

      if (uploadGame.status === 'ok') {
        await this._provider.destroy()
        log.info(chalk.yellow('\nUpload game success, destroy connection please wait...'))
      }
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(`${error.message} please try upload again`), 1)
    }
  }

  private async _unloadGame(data: UnloadGameData) {
    const {
      gameName,
      apiRoomAddress
    } = data

    try {
      const bankrollerInstance = await this._provider.getRemoteInterface<IBankroller>(
        apiRoomAddress
      )

      const unloadGame = await bankrollerInstance.unloadGame(gameName)
      if (unloadGame.status === 'ok') {
        await this._provider.destroy()
        log.info(chalk.yellow('\nUnload game success, destroy connection please wait...'))
      }
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(`${error.message} please try upload again`), 1)
    }
  }
}
