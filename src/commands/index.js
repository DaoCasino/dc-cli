const chalk = require('chalk')
const program = require('commander')
const _config = require('../config/config')
const CLIInstance = require('../')

const commands = {}
const CLI = new CLIInstance({config: _config})
_config.commands.forEach(comand => { commands[comand.name] = comand })

/**
 * Listen all commands
 * if argument command not exists in cli
 * commands then view main menu cli
 */
program.on('command:*', () => CLI.viewMenu(program.args))

program
  .version(`CLI version: ${chalk.red(_config.packageJSON.version)}`)
  .usage('<command> [options]')
  .description(chalk.green('CLI for light development with DC ENV'))

program
  .command('list')
  .description(`${chalk.green(commands['list'].description.trim())} `)
  .action(() => CLI.viewTemplateList())

program
  .command('create [template] [directory]')
  .description(`${chalk.green(commands['create'].description.trim())} `)
  .usage(`${chalk.red('<template-name> <project-name>')}`)
  .option('-y, --yarn', 'Use yarn package manager for install')
  .action((directory, template, command) => CLI.createProject(directory, template, command))
  .on('--help', () => {
    console.log('')
    console.log(`  Template call:`)
    console.log('')
    console.log(`    dc-cli ${chalk.blue('create')} ${chalk.red('<template-name> <project-name>')}`)
    console.log('')
    console.log('  Ecample:')
    console.log('')
    console.log(`    dc-cli ${chalk.blue('create')} ${chalk.red('webpack my-project')}`)
    console.log('')
    console.log(chalk.yellow(`
      If arguments are not passed then cli will ask,
      your template name and project name
    `))
  })

program
  .command('start')
  .description(`${chalk.green(commands['start'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-d, --docker', 'Start env in docker containers')
  .option('-n, --network <network>', 'Set blockchain network for start env')
  .action(command => CLI.DApp.start(command))

program
  .command('bankup')
  .description(`${chalk.green(commands['bankup'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --background', 'Start bankroller in background (pm2)')
  .option('-p, --privatekey <privatekey>', 'Input private key for start bankroller in needed network')
  .option('-n, --network <network>', 'Start bankroller in target blockchain network')
  .action(command => CLI.DApp.startBankrollerWithNetwork(command))

program
  .command('stop')
  .description(`${chalk.green(commands['stop'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .action(command => CLI.DApp.stop(command))

program
  .command('logs')
  .description(`${chalk.green(commands['logs'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --bankroller', 'View bankroller logs')
  .option('-t, --testrpc', 'View testrpc logs')
  .action(command => CLI.DApp.viewLogs(command))

program
  .command('migrate')
  .description(`${chalk.green(commands['migrate'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-n, --network <network>', 'Blockchain network for migrate')

program
  .command('deploy')
  .description(`${chalk.green(commands['deploy'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-r, --ropsten', 'Deploy to ropsten network')
  .option('-l, --local', 'Deploy to local network')
  .option('-c, --no-contract', 'Skip deploy contract')
  .option('-d, --no-dapp', 'Skip deploy DApp')

program
  .command('publish')
  .description(`${chalk.green(commands['publish'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)

/** Parse command line arguments */
program.parse(process.argv)
program.cli = true
/** If arguments not exist then view main menu cli */
if (program.args.length === 0) {
  CLI.viewMenu(program.args)
}
