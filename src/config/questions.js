const Utils = require('../Utils')
const chalk = require('chalk')
const _config = require('./config')

module.exports = function (name) {
  const questions = {
    viewMenu: {
      name: 'command',
      message: `You did not enter a command or enter a nonexistent, What do you want to do?: `,
      type: 'list',
      pageSize: 15,
      choices: _config.commands
        .filter(command => !((Utils.checkENV() && (command.name === 'list' || command.name === 'create'))))
        .map(command => {
          if (!Utils.checkENV() && command.env) {
            command.name = `${chalk.rgb(128, 128, 128)(command.name)}`
          }

          return `${command.name} ${chalk.green(command.description)}`
        })
    },

    templateSelect: {
      type: 'list',
      name: 'template',
      message: 'Select the standart template?: ',
      choices: _config.templates.map(template => template.name)
    },

    directoryInput: {
      type: 'input',
      name: 'directory',
      message: 'Input directory name to project?: '
    },

    useYarn: {
      type: 'confirm',
      name: 'useYarn',
      message: 'Use yarn package manager',
      default: true
    },

    useDocker: {
      type: 'confirm',
      name: 'useDocker',
      message: 'Use docker containers for up enviroment',
      default: false
    },

    targetLog: {
      type: 'list',
      name: 'targetLog',
      message: 'Please select target to start logs',
      choices: ['testrpc', 'bankroller']
    },

    selectBlockchainNetwork: {
      type: 'list',
      name: 'blockchainNetwork',
      message: 'Please select network to start',
      choices: ['local', 'ropsten', 'rinkeby']
    },

    inputPrivateKey: {
      type: 'input',
      name: 'privateKeyToBankroller',
      message: 'Please input private key with eth and bet balance for bankroller'
    },

    inputMnemonic: {
      type: 'input',
      name: 'mnemonic',
      message: 'Input mnemonic for deploy contract to the test network'
    },

    startInBackground: {
      type: 'confirm',
      name: 'startInBackground',
      message: 'Start bankroller in background',
      default: false
    }
  }

  return questions[name]
}
