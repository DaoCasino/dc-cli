import path from 'path'
import { CLIConfigInterface } from '../interfaces/ICLIConfig'

const config: CLIConfigInterface = {
  commands: [
    { name: 'list', description: '       View available official templates', env: false },
    { name: 'create', description: '     Generate a new project from a template', env: false },
    { name: 'bankrollup', description: ' Start bankroller in target network', env: false },
    { name: 'migrate', description: '    migrate contract to the network', env: false },
    { name: 'start', description: '      Up env for development dapp', env: true },
    { name: 'stop', description: '       Down env for development dapp', env: true },
    { name: 'logs', description: '       Output logs SDK with network', env: true },
    { name: 'deploy', description: '     Deploing dapp', env: true },
    { name: 'upload', description: '     Upload game to the bankroller', env: true },
    { name: 'publish', description: '    Send game to Dao.Casino marketplace', env: true }
  ],

  templates: [
    {
      name: 'DaoCasino/dc-sdk-example',
      descript: 'full frontend template with webpack, truffle, web3',
      doc: 'https://github.com/DaoCasino/sdk'
    }
  ],

  bankrollerLocalPrivateKey: '0x8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5', // '0x1882c2a6d0df1210d643f82f69d0bdfa0e2e1eaa963384826a4f24d5b5529e10',

  isWin           : /^win/.test(process.platform),
  ASCIIColor      : /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
  packageJSON     : path.join(__dirname, '../../package.json'),
  projectsENV     : path.join(process.cwd(), './node_modules/dc-webapi'),
  startOptions    : path.join(__dirname, './startOptions.json'),
  defaultMnemonic : 'glass method front super auto hole know grace select prevent custom fancy'
}

export default config