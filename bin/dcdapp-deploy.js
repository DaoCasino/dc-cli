const program = require('commander')
const deploy  = require('../lib/deploy')

program
  .version(require('../package').version)
  .command('deploy')
  .description('Deploing dapp [link doc]')
  .action(deploy())
