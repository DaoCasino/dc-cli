const chalk = require('chalk')
const Utils = require('../Utils')
const program = require('commander')
const _config = require('../config/config')
const CLIInstance = require('../')
const getQuestion = require('../config/questions')

const commands = {}
const CLI = new CLIInstance({ config: _config, getQuestion: getQuestion })
_config.commands.forEach(command => { commands[command.name] = command })

function run () {
  /**
   * If not enviroment and command needed env
   * then output error log and exit
   */
  if (
    !Utils.checkENV() && process.argv[2] &&
    _config.commands.find(command => (command.name === process.argv[2]) && command).env
  ) {
    Utils.exitProgram(
      process.pid,
      chalk.red('\nError cannot created project please run dc-cli create and try again'),
      0
    )
  }

  /** Parse command line arguments */
  program.parse(process.argv)
  program.cli = true
  /** If arguments not exist then view main menu cli */
  if (program.args.length === 0) CLI.viewMenu(program.args)
}

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
  .option('-s, --stdmigrate', 'Migrate standart contract in dc-protocol')
  .action(command => CLI.DApp.migrateContract(command))

program
  .command('upload')
  .description(`${chalk.green(commands['upload'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-p, --platformid <platformid>')
  .option('-a, --address <bankrollerAddress>', 'Bankroller address')
  .option('-g, --game <gamepath>', 'Path to upload dapp.logic.js and dapp.manifest.js')
  .option('-n, --name <gameName>', 'Name for game')
  .action(command => CLI.DApp.uploadGameToBankroller(command))

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

run()
