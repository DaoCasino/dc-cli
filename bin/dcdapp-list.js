const list    = require('../lib/list')
const program = require('commander')

program
  .version(require('../package').version)
  .command('list')
  .description('list available official templates [link doc]')
  .action(list())