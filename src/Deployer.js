const path = require('path')
const Utils = require('./Utils')
const { IpfsTransportProvider } = require('dc-messaging')
module.exports = class Deployer {
  constructor (params) {
    this._params = params
  }

  async migrateContract (options) {
    let blockchainNetwork = options.network

    if (!options.stdmigrate) {
      process.env.CONTRACTS_PATH = path.join(
        process.cwd(),
        './src/contracts'
      )
    }

    if (!blockchainNetwork) {
      blockchainNetwork = (await this._params.prompt(
        this._params.getQuestion('selectBlockchainNetwork')
      )).blockchainNetwork
    }

    try {
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
        console.log(`Contracts deploy to ${blockchainNetwork} successed`)
        return contractMigrate.status
      }
    } catch (error) {
      throw error
    }
  }

  async uploadGameToBankroller () {
    const provider = await IpfsTransportProvider.create()
  }

  async deployGameToIPFS () {
    console.log('comming soon...')
  }
}
