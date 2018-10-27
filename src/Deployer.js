const path = require('path')
const Utils = require('./Utils')
const { IpfsTransportProvider } = require('dc-messaging')
module.exports = class Deployer {
  constructor (params) {
    this._params = params
  }

  async migrateContract (blockchainNetwork = 'local') {
    try {
      // process.env.CONTRACTS_PATH = path.join(process.cwd(), './src/contracts')
      if (blockchainNetwork !== 'local') {
        process.env.MNEMONIC = (await this._params.prompt({
          type: 'input',
          name: 'mnemonic',
          message: 'Input mnemonic for deploy contract to the test network'
        })).mnemonic
      }

      const contractMigrate = await Utils.startCLICommand(`npm run migrate:${blockchainNetwork}`)
      if (contractMigrate.status === 'success') {
        console.log(`Contracts deploy to ${blockchainNetwork} successed`)
        return true
      }
    } catch (error) {
      throw error
    }
  }

  async uploadGameToBankroller () {
    const provider = await IpfsTransportProvider.create()
  }

  async deployGameToIPFS () {

  }
}
