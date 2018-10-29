const path = require('path')
const chalk = require('chalk')
const Utils = require('./Utils')
const _config = require('./config/config')
const Deployer = require('./Deployer')
const startOptionsConfig = require(_config.startOptions)

module.exports = class DApp extends Deployer {
  constructor (params) {
    super()
    this._params = params
  }

  async start (options) {
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

      await Utils.startCLICommand(
        'npm run start',
        path.resolve(process.cwd())
      )
    } catch (error) {
      Utils.exitProgram(process.pid, error)
    }
  }

  async stop () {
    (!startOptionsConfig.useDocker)
      ? await Utils.deletePM2Service('all')
      : await Utils.startCLICommand('docker-compose down', path.join(__dirname, '../'))

    console.log(chalk.green('\nEnviroment stoped\n'))
  }

  async viewLogs (options) {
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

  async startBankrollerWithNetwork (options) {
    let startInBackground = options.background
    let blockchainNetwork = options.network
    process.env.ACCOUNT_PRIVATE_KEY = options.privatekey || _config.bankrollerLocalPrivateKey

    try {
      if (!blockchainNetwork) {
        blockchainNetwork = (await this._params.prompt(
          this._params.getQuestion('selectBlockchainNetwork')
        )).blockchainNetwork
      }

      if (blockchainNetwork !== 'local') {
        process.env.ACCOUNT_PRIVATE_KEY = (await this._params.prompt(
          this._params.getQuestion('inputPrivateKey')
        )).privateKeyToBankroller
      }

      if (!startInBackground) {
        startInBackground = (await this._params.prompt(
          this._params.getQuestion('startInBackground')
        )).startInBackground
      }

      if (startInBackground) {
        await Utils.startPM2Service({
          cwd: path.join(__dirname, '../'),
          name: 'bankroller_core',
          exec_mode: 'fork',
          script: 'npm',
          args: `run start:bankroller_core:${blockchainNetwork}`
        })

        console.log(`\n
        Bankroller start in background with pm2
        for show logs bankroller please run ${chalk.green('dc-cli logs --bankroller')}
        or ${chalk.green(`pm2 logs bankroller_core:${blockchainNetwork}`)}\n
        `)
      } else {
        await Utils.startCLICommand(
          `npm run start:bankroller_core:${blockchainNetwork}`
        )
      }
    } catch (error) {
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async _startLocalENV (startOptions = startOptionsConfig) {
    try {
      await Utils.startPM2Service({
        cwd: path.join(__dirname, '../'),
        name: 'dc_protocol',
        exec_mode: 'fork',
        script: 'npm',
        args: 'run start:dc_protocol:testrpc'
      })

      const migrateToLocalNetwork = await this.migrateContract({
        network: startOptions.blockchainNetwork
      })

      if (migrateToLocalNetwork === 'success') {
        await this.startBankrollerWithNetwork({
          background: true,
          network: startOptions.blockchainNetwork
        })
      }
    } catch (error) {
      await this.stop()
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  async _startDockerLocalENV (startOptions = startOptionsConfig) {
    console.log('comming soon...')
    return
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
