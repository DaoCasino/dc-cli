import {
  DAppInstance,
  StartOptions,
  InstanceParams,
  StartBankrollerParams
} from './interfaces/IDApp'
import path from 'path'
import chalk from 'chalk'
import * as Utils from './Utils'
import config from './config/config'
import Deployer from './Deployer'
import program from 'commander'
import startOptionsConfig from './config/startOptions.json'
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
      blockchainNetwork: options.network || 'local'
    }

    if (!startOptions.useDocker) {
      startOptions.useDocker = (await this._params.prompt(
        this._params.getQuestion('useDocker')
      )).useDocker
    }

    Utils.changeStartOptionsJSON(startOptions)

    try {
      (!startOptions.useDocker)
        ? await this._startLocalENV(startOptions)
        : await this._startDockerLocalENV(startOptions)
    } catch (error) {
      Utils.exitProgram(process.pid, error)
    }
  }

  async stop (): Promise<void> {
    (!startOptionsConfig.useDocker)
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

    (!startOptionsConfig.useDocker)
      ? Utils.startCLICommand(`npm run logs:pm2:${targetLog}`, path.join(__dirname, '../'))
      : Utils.startCLICommand(`npm run logs:docker:${targetLog}`, path.join(__dirname, '../'))
  }

  async startBankrollerWithNetwork (
    options: program.Command | StartBankrollerParams
  ): Promise<void> {
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
        await Utils.checkPM2Service('dc_protocol')
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

      if (startInBackground) {
        const bankrollerStartinPM2 = await Utils.startPM2Service({
          cwd: path.join(__dirname, '../'),
          name: 'bankroller_core',
          exec_mode: 'fork',
          env: { 'ACCOUNT_PRIVATE_KEY': bankrollerPrivatekey },
          script: 'npm',
          args: `run start:bankroller_core:${blockchainNetwork}`
        })

        if (bankrollerStartinPM2) {
          Utils.changeStartOptionsJSON({
            docker: false,
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
          `npm run start:bankroller_core:${blockchainNetwork}`,
          path.join(__dirname, '../'),
          {
            'ACCOUNT_PRIVATE_KEY': bankrollerPrivatekey
          }
        )
      }
    } catch (error) {
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async _startLocalENV (
    startOptions: StartOptions = startOptionsConfig
  ): Promise<void> {
    try {
      await Utils.startPM2Service({
        cwd: path.join(__dirname, '../'),
        name: 'dc_protocol',
        exec_mode: 'fork',
        script: 'npm',
        args: 'run start:dc_protocol:testrpc'
      })

      const migrateToLocalNetwork = await this.migrateContract({
        network: startOptions.blockchainNetwork,
        stdmigrate: false
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
    startOptions: StartOptions = startOptionsConfig
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
