const fs = require('fs')
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
      startOptions.useDocker = (await this._params.prompt({
        type: 'confirm',
        name: 'useDocker',
        message: 'Use docker containers for up enviroment',
        default: false
      })).useDocker
    }

    if (
      startOptionsConfig.useDocker !== startOptions.useDocker ||
      startOptionsConfig.blockchainNetwork !== startOptions.blockchainNetwork
    ) {
      const openFile = fs.openSync(_config.startOptions, 'w')
      fs.writeSync(openFile, JSON.stringify(startOptions, null, ' '), 0, 'utf-8')
      fs.closeSync(openFile)
    }

    try {
      (!startOptions.useDocker)
        ? await this._startLocalENV(startOptions)
        : await this._startDockerLocalENV(startOptions)
    } catch (error) {
      throw error
    }
  }

  async stop () {
    (!startOptionsConfig.useDocker)
      ? await Utils.deletePM2Service('all')
      : await Utils.startCLICommand('docker-compose down')

    console.log('Enviroment stoped')
  }

  viewMonitor (target) {
  }

  uploadGameDataToBankrooler () {
  }

  async startBankrollerWithNetwork (options) {
    let startInBackground = options.background
    let blockchainNetwork = options.network
    let privateKeyToBankroller = options.privatekey || _config.bankrollerLocalPrivateKey

    try {
      if (!blockchainNetwork) {
        blockchainNetwork = (await this._params.prompt({
          type: 'list',
          name: 'blockchainNetwork',
          message: 'Please select network to start',
          choices: ['local', 'ropsten', 'rinkeby']
        })).blockchainNetwork
      }

      if (blockchainNetwork !== 'local') {
        privateKeyToBankroller = (await this._params.prompt({
          type: 'input',
          name: 'privateKeyToBankroller',
          message: 'Please input private key with eth and bet balance for bankroller'
        })).privateKeyToBankroller
      }

      if (!startInBackground) {
        startInBackground = (await this._params.prompt({
          type: 'confirm',
          name: 'startInBackground',
          message: 'Start bankroller in background',
          default: false
        })).startInBackground
      }

      process.env.ACCOUNT_PRIVATE_KEY = privateKeyToBankroller

      if (startInBackground) {
        await Utils.startPM2Service({
          cwd: path.join(__dirname, '../'),
          name: `bankroller_core:${blockchainNetwork}`,
          exec_mode: 'fork',
          script: 'npm',
          args: `run start:bankroller_core:${blockchainNetwork}`
        })

        console.log(`

        Bankroller start in background with pm2
        for show logs bankroller please run ${chalk.green('dc-cli logs')}
        or ${chalk.green(`pm2 logs bankroller_core:${blockchainNetwork}`)}
  
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
    process.env.TESTRPC_PORT = 8545

    try {
      await Utils.startPM2Service({
        cwd: path.join(__dirname, '../'),
        name: 'dc-protocol',
        exec_mode: 'fork',
        script: 'npm',
        args: 'run start:dc_protocol:testrpc'
      })

      const migrateToLocalNetwork = await this.migrateContract(
        startOptions.blockchainNetwork
      )

      if (migrateToLocalNetwork) {
        await this.startBankrollerWithNetwork({
          background: true,
          network: startOptions.blockchainNetwork
        })

        Utils.exitProgram(process.pid, false, 0)
      }
    } catch (error) {
      Utils.exitProgram(process.pid, error, 1)
    }
  }

  _startDockerLocalENV (startOptions = startOptionsConfig) {
    process.env.TESTRPC_PORT = 8546
    process.env.ACCOUNT_PRIVATE_KEY = _config.bankrollerLocalPrivateKey
    console.log('docker')
  }
}
