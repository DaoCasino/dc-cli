const program = require('commander')
const start   = require('../lib/start')

program
  .version(require('../package').version)
  .command('start')
  .description('Up env for development dapp [link doc]')
  .action(start())