const fs   = require('fs')
const path = require('path')

module.exports = {
  commands: [
    { name: 'list', description: '   View available official templates' },
    { name: 'create', description: ' Generate a new project from a template' },
    { name: 'start', description: '  Up env for development dapp' },
    { name: 'stop', description: '   Down env for development dapp' },
    { name: 'logs', description: '   Output logs SDK with network' },
    { name: 'bankup', description: ' Start bankroller in target network' },
    { name: 'deploy', description: ' Deploing dapp' },
    { name: 'migrate', description: 'migrate contract to the network' },
    { name: 'publish', description: 'Send game to Dao.Casino marketplace' }
  ],

  options: [
    '-V', '-h', '-s', '-c', '-i', '-r', '-d', '-f', '-b', '-l',
    '--help', '--clone', '--server', '--version', '--ipfs',
    '--ropsten', '--development', '--firebase', '--local', '--rpc',
    '--bankroller', '--no-contract', '--no-dapp'
  ],

  templates: [
    {
      name: 'DaoCasino/SDK',
      descript: 'full frontend template with webpack, truffle, web3',
      doc: 'https://github.com/DaoCasino/sdk'
    }
  ],

  bankrollerLocalPrivateKey: '0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',

  isWin           : /^win/.test(process.platform),
  ASCIColor       : /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
  packageJSON     : path.join(__dirname, '../../package.json'),
  projectsENV     : path.join(process.cwd(), './node_modules/dc-webapi'),
  startOptions    : path.join(__dirname, './startOptions.json'),
  packageEnvJSON  : path.join(fs.realpathSync(process.cwd()), '_env/package.json'),
  defaultMnemonic : 'glass method front super auto hole know grace select prevent custom fancy'
}
