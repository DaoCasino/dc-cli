import path from 'path'
import chalk from 'chalk'
import config from './config'
import * as Utils from '../Utils'
import { QuestionInterface  } from '../interfaces/ICLIConfig'

export default function getQuestion (name): QuestionInterface {
  const questions = {
    viewMenu: {
      name: 'command',
      message: `You did not enter a command or enter a nonexistent, What do you want to do?: `,
      type: 'list',
      pageSize: 15,
      choices: config.commands
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
      choices: config.templates.map(template => template.name)
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
      message: 'Start process in background',
      default: false
    },

    inputPlatformID: {
      type: 'input',
      name: 'platformID',
      message: 'Input platform id for create connect with bankroller'
    },

    inputGamePath: {
      type: 'input',
      name: 'gamePath',
      message: 'Input path to the game logic and dapp.manifest files'
    },

    inputBankrollerAddress: {
      type: 'input',
      name: 'bankrollerAddress',
      message: 'Input bankroller address at upload game'
    },

    inputGameName: {
      type: 'input',
      name: 'gamename',
      message: 'Input name for game'
    },

    inputContractsPath: {
      type: 'input',
      name: 'contractsPath',
      message: `not contracts in ${path.join(process.cwd(), './dapp/contracts')} directory, please input correct path to protocol contracts`
    },

    inputTestRPCHost: {
      type: 'input',
      name: 'testrpcHost',
      message: 'How use host for ganache?'
    },

    inputTestRPCPort: {
      type: 'input',
      name: 'testrpcPort',
      message: 'How use port for ganache?'
    },

    useTestRPCDB: {
      type: 'confirm',
      name: 'nodb',
      message: 'Use DB in ganache?',
      default: true
    }
  }

  return questions[name]
}
