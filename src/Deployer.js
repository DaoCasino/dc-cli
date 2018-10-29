const path = require('path')
const Utils = require('./Utils')

module.exports = class Deployer {
  constructor (params) {
    this._params = params
  }

  async migrateContract (options) {
    let blockchainNetwork = options.network
    if (!options.stdmigrate) {
      process.env.CONTRACTS_PATH = path.join(
        process.cwd(),
        './dapp/contracts'
      )
    }

    try {
      if (!blockchainNetwork) {
        blockchainNetwork = (await this._params.prompt(
          this._params.getQuestion('selectBlockchainNetwork')
        )).blockchainNetwork
      }

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
      } else {
        throw new Error('Contracts is not migrate to the network')
      }
    } catch (error) {
      throw error
    }
  }

  async uploadGameToBankroller () {
    console.log('comming soon...')
    // const provider = await IpfsTransportProvider.create()
    // const getPeerInterface = await provider.getRemoteInterface(platformId)
  }

  async deployGameToIPFS () {
    console.log('comming soon...')
  }
}
