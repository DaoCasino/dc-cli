import path from 'path'
import chalk from 'chalk'
import config from './config/config'
import Deployer from './Deployer'
import program from 'commander'
import startConfigInJson from './config/startOptions.json'
import * as Utils from './Utils'
import {
  DAppInstance,
  StartOptions,
  InstanceParams,
  StartBankrollerParams
} from './interfaces/IDApp'
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

    // TODO: uncomment when implement up enviroment with docker
    // if (!startOptions.useDocker) {
    //   startOptions.useDocker = (await this._params.prompt(
    //     this._params.getQuestion('useDocker')
    //   )).useDocker
    // }

    Utils.changeStartOptionsJSON(startOptions)

    try {
      (!startOptions.useDocker)
        ? this._startLocalENV(startOptions)
        : this._startDockerLocalENV(startOptions)
    } catch (error) {
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async stop (): Promise<void> {
    try {
      (!startConfigInJson.useDocker)
        ? await Utils.deletePM2Service('all')
        : await Utils.startCLICommand('docker-compose down', path.join(__dirname, '../'))
  
      log.info(chalk.green('\nEnviroment stoped\n'))
    } catch (error) {
      Utils.exitProgram(process.pid, chalk.red(`\nEnviroment undefined or already stoped\n`), 1)
    }
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

    (!startConfigInJson.useDocker)
      ? Utils.startCLICommand(`npm run logs:pm2:${targetLog}`, path.join(__dirname, '../'))
      : Utils.startCLICommand(`npm run logs:docker:${targetLog}`, path.join(__dirname, '../'))
  }

  async startBankrollerWithNetwork (options: program.Command | StartBankrollerParams): Promise<void> {
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

      Utils.changeStartOptionsJSON({
        useDocker: !startInBackground,
        blockchainNetwork
      })

      if (startInBackground) {
        const upBankroller = await Utils.startPM2Service({
          cwd: path.dirname(bankrollerStartScript),
          name: 'bankroller-node',
          exec_mode: 'fork',
          env: START_ENV,
          script: path.basename(bankrollerStartScript)
        })

        log.info(`\n
          \rBankroller start in background with pm2 status: ${chalk.green(upBankroller.status)}
          \rfor show logs bankroller please run ${chalk.green('dc-cli logs --bankroller')}
          \ror ${chalk.green(`pm2 logs bankroller_core:${blockchainNetwork}`)}\n
        `)

        Utils.exitProgram(process.pid, false)
      } else {
        Utils.startCLICommand(
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
    startOptions: StartOptions = startConfigInJson
  ): Promise<void> {
    try {
      // await Utils.connectToPM2Deamon()
      await Utils.startPM2Service({
        cwd: path.dirname(require.resolve('dc-protocol')),
        name: 'dc-protocol',
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
    startOptions: StartOptions = startConfigInJson
  ): Promise<void> {
    log.info('comming soon...')
    // TODO: Implement
  }
}
