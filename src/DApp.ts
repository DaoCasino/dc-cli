import {
  DAppInstance,
  StartOptions,
  InstanceParams,
  StartBankrollerParams
} from './interfaces/IDApp'
import path from 'path'
import chalk from 'chalk'
import config from './config/config'
import Deployer from './Deployer'
import program from 'commander'
import * as Utils from './Utils'
import { Logger } from 'dc-logging'
import { CLIConfigInterface } from './interfaces/ICLIConfig'

const log = new Logger('DApp')

export default class DApp extends Deployer implements DAppInstance {
  protected _params: InstanceParams
  private _config: CLIConfigInterface

  constructor (params: InstanceParams) {
    super(params)
    this._params = params
    this._config = config
  }

  async start (options: program.Command): Promise<void> {
    const startOptions = {
      useDocker: options.docker,
      blockchainNetwork: options.network || 'local',
      stdmigrate: options.stdmigrate || false
    }

    if (!startOptions.useDocker) {
      startOptions.useDocker = (await this._params.prompt(
        this._params.getQuestion('useDocker')
      )).useDocker
    }

    Utils.changeStartOptionsJSON(startOptions)

    try {
      (!require(this._config.startOptions).useDocker)
        ? await this._startLocalENV(startOptions)
        : await this._startDockerLocalENV(startOptions)
    } catch (error) {
      Utils.exitProgram(process.pid, error)
    }
  }

  async stop (): Promise<void> {
    (!require(this._config.startOptions).useDocker)
      ? await Utils.deletePM2Service('all')
      : await Utils.startCLICommand('docker-compose down', path.join(__dirname, '../'))

    log.info(chalk.green('\nEnviroment stoped\n'))
  }

  async viewLogs (options): Promise<void> {
    let targetLog = 'bankroller'
    switch (true) {
      case options.testrpc:
        targetLog = 'testrpc'
        break
      case options.bankroller:
        targetLog = 'bankroller'
        break
      default:
        targetLog = (await this._params.prompt(
          this._params.getQuestion('targetLog')
        )).targetLog
    }

    (!require(this._config.startOptions).useDocker)
      ? Utils.startCLICommand(`npm run logs:pm2:${targetLog}`, path.join(__dirname, '../'))
      : Utils.startCLICommand(`npm run logs:docker:${targetLog}`, path.join(__dirname, '../'))
  }

  async startBankrollerWithNetwork (options: program.Command | StartBankrollerParams) {
    const bankrollerStartScript = require.resolve('bankroller-node')
    let startInBackground = options.background
    let blockchainNetwork = options.network
    let bankrollerPrivatekey = options.privatekey

    try {
      if (!blockchainNetwork) {
        blockchainNetwork = (await this._params.prompt(
          this._params.getQuestion('selectBlockchainNetwork')
        )).blockchainNetwork
      }

      if (blockchainNetwork === 'local') {
        bankrollerPrivatekey = this._config.bankrollerLocalPrivateKey
      } else if (!bankrollerPrivatekey) {
        bankrollerPrivatekey = (await this._params.prompt(
          this._params.getQuestion('inputPrivateKey')
        )).privateKeyToBankroller
      }

      if (!startInBackground) {
        startInBackground = (await this._params.prompt(
          this._params.getQuestion('startInBackground')
        )).startInBackground
      }

      const START_ENV = {
        'DC_NETWORK': blockchainNetwork,
        'DAPPS_FULL_PATH': path.join(path.dirname(bankrollerStartScript), '../data/dapps'),
        'ACCOUNT_PRIVATE_KEY': bankrollerPrivatekey
      }

      if (startInBackground) {
        const bankrollerStartinPM2 = await Utils.startPM2Service({
          cwd: path.dirname(bankrollerStartScript),
          name: 'bankroller_core',
          exec_mode: 'fork',
          env: START_ENV,
          autorestart: false,
          script: path.basename(bankrollerStartScript)
        })

        if (bankrollerStartinPM2) {
          Utils.changeStartOptionsJSON({
            useDocker: false,
            blockchainNetwork
          })

          log.info(`\n
          Bankroller start in background with pm2
          for show logs bankroller please run ${chalk.green('dc-cli logs --bankroller')}
          or ${chalk.green(`pm2 logs bankroller_core:${blockchainNetwork}`)}\n
          `)

          Utils.exitProgram(process.pid, false, 0)
        }
      } else {
        await Utils.startCLICommand(
          `node ${bankrollerStartScript}`,
          path.join(__dirname, '../'),
          START_ENV
        )
      }
    } catch (error) {
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async _startLocalENV (
    startOptions: StartOptions = require(this._config.startOptions)
  ): Promise<void> {
    try {
      await Utils.connectToPM2Deamon()
      await Utils.startPM2Service({
        cwd: path.dirname(require.resolve('dc-protocol')),
        name: 'dc_protocol',
        env: { 'no_db': true },
        exec_mode: 'fork',
        script: require.resolve('dc-protocol/src/testrpc.server.js')
      })

      const migrateToLocalNetwork = await this.migrateContract({
        network: startOptions.blockchainNetwork,
        stdmigrate: startOptions.stdmigrate
      })

      if (migrateToLocalNetwork === 'success') {
        await this.startBankrollerWithNetwork({
          background: true,
          exit: false,
          privatekey: this._config.bankrollerLocalPrivateKey,
          network: startOptions.blockchainNetwork
        })
      }
    } catch (error) {
      await this.stop()
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async _startDockerLocalENV (
    startOptions: StartOptions = require(this._config.startOptions)
  ): Promise<void> {
    log.info('comming soon...')
    Utils.exitProgram(process.pid, false, 0)
    // process.env.ACCOUNT_PRIVATE_KEY = _config.bankrollerLocalPrivateKey
    // process.env.CONTRACTS_PATH = path.join(process.cwd(), 'dapp/contracts')

    // try {
    //   await Utils.startCLICommand('docker -v && docker-compose -v', process.cwd())
    //   await Utils.startCLICommand('docker-compose up -d', path.join(__dirname, '../'))
    //   await this.migrateContract({ network: startOptions.blockchainNetwork })
    // } catch (error) {
    //   await this.stop()
    //   Utils.exitProgram(process.pid, error, 1)
    // }
  }
}
