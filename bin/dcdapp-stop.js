const program = require('commander')
const stop    = require('../lib/stop')

program
  .version(require('../package').version)
  .command('stop')
  .description('Down env for development dapp [link doc]')
  .action(stop())