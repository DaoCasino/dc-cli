const path             = require('path')
const _config          = require('./src/config/config')
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
    local: {
      gas        : 6700000,
      host       : '0.0.0.0',
      port       : process.env.TESTRPC_PORT,
      gasPrice   : 32,
      network_id : '*'
    },

    ropsten: {
      gas           : 5500000,
      gasPrice      : 10000000000,
      provider      : new HDWalletProvider(process.env.MNEMONIC || _config.defaultMnemonic, 'https://ropsten.infura.io'),
      network_id    : 3,
      skipDryRun    : true,
      timeoutBlocks : 200
    },

    rinkeby: {
      gas           : 5500000,
      gasPrice      : 10000000000,
      provider      : new HDWalletProvider(process.env.MNEMONIC || _config.defaultMnemonic, 'https://rinkeby.infura.io'),
      network_id    : 1,
      skipDryRun    : true,
      timeoutBlocks : 200
    }
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  contracts_directory       : process.env.CONTRACTS_PATH || path.resolve(process.cwd(), './src/contracts'),
  migrations_directory      : path.resolve(__dirname, './migrations'),
  contracts_build_directory : path.resolve(__dirname, 'node_modules/dc-configs/src', 'build')
}
