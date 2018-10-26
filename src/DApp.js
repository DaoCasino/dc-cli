const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

module.exports = class DApp {
  constructor (params) {
    this._params = params
  }

  async start (options) {
    let useDocker = options.docker
    let blockchainNetwork = options.network

    if (!options.docker) {
      options.docker = (await this._params.prompt({
        type: 'confirm',
        name: 'useDocker',
        message: 'Use docker containers for up enviroment',
        default: true
      })).useYarn
    }

    if (!options.network) {
      blockchainNetwork = (await this._params.prompt({
        type: 'input',
        name: 'blockchainNetwork',
        message: 'Input blockchain network for up enviroment: '
      }))
    }
  }
}
