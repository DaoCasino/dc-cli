const fs = require('fs')
const path = require('path')
const _config = require('./config/config')
const { spawn } = require('child_process')
const startOptionsConfig = require(_config.startOptions)

module.exports = class DApp {
  constructor (params) {
    this._params = params
  }

  async start (options) {
    const startOptions = {
      useDocker: options.docker,
      blockchainNetwork: options.network
    }

    if (!startOptions.useDocker) {
      startOptions.useDocker = (await this._params.prompt({
        type: 'confirm',
        name: 'useDocker',
        message: 'Use docker containers for up enviroment',
        default: false
      })).useDocker
    }

    if (!startOptions.blockchainNetwork) {
      startOptions.blockchainNetwork = (await this._params.prompt({
        type: 'list',
        name: 'blockchainNetwork',
        message: 'Select blockchain network for up enviroment',
        choices: ['local', 'ropsten', 'rinkeby']
      })).blockchainNetwork
    }

    if (
      startOptionsConfig.useDocker !== startOptions.useDocker ||
      startOptionsConfig.network !== startOptions.blockchainNetwork
    ) {
      const openFile = fs.openSync(_config.startOptions, 'w')
      fs.writeSync(openFile, JSON.stringify(startOptions, null, ' '), 0, 'utf-8')
      fs.closeSync(openFile)
    }

    (!startOptions.useDocker)
      ? this._startLocalENV(startOptions)
      : this._startDockerENV(startOptions)
  }

  stop () {

  }

  viewLogs (target) {

  }

  projectBuild () {

  }

  _startLocalENV (startOptions = startOptionsConfig) {
    console.log('local')
  }

  _startDockerENV (startOptions = startOptionsConfig) {
    console.log('docker')
  }
}
