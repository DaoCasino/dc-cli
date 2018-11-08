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
  const programArgs = process.argv.slice(2)
  const targetCommand = _config.commands
    .find(command => (command.name === programArgs[0]) && command)

  if (
    (!programArgs.includes('-f') && !programArgs.includes('--force')) &&
    (!Utils.checkENV() && targetCommand && targetCommand.env)
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
  .version(`CLI version: ${chalk.red(require(_config.packageJSON).version)}`)
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
  .action((template, directory, command) => CLI.createProject(template, directory, command))
  .on('--help', () => {
    console.log(`
      Template run:

        dc-cli create ${chalk.cyan('<template-name> <project-name> [options]')}
      
      Example run:

        dc-cli create ${chalk.green('webpack my-project')}
      ${chalk.yellow(`
        If arguments are not passed then cli will
        ask, leading questions and set needed arguments 
      `)}
    `)
  })

program
  .command('start')
  .description(`${chalk.green(commands['start'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-d, --docker', 'Start env in docker containers')
  .option('-n, --network <network>', 'Set blockchain network for start env')
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.start(command))

program
  .command('bankup')
  .description(`${chalk.green(commands['bankup'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --background', 'Start bankroller in background (pm2)')
  .option('-p, --privatekey <privatekey>', 'Input private key for start bankroller in needed network')
  .option('-n, --network <network>', 'Start bankroller in target blockchain network')
  .action(async command => await CLI.DApp.startBankrollerWithNetwork(command))
  .on('--help', () => {
    console.log(`
      Template run:

        dc-cli bankup ${chalk.cyan('[options]')}

      Example run:

        dc-cli bankup --background -nnetwork ${chalk.green('ropsten')} -privatekey ${chalk.green('0x1882c2a6d0df1210d643f82f69d0bdfa0e2e1eaa963384826a4f24d5b5529e10')}
      ${chalk.yellow(`
        If arguments are not passed then cli will
        ask, leading questions and set needed arguments 
      `)}
    `)
  })

program
  .command('stop')
  .description(`${chalk.green(commands['stop'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.stop(command))

program
  .command('logs')
  .description(`${chalk.green(commands['logs'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --bankroller', 'View bankroller logs')
  .option('-t, --testrpc', 'View testrpc logs')
  .option('-f, --force', 'Force run command not depend enviroment')
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
  .option('-g, --game-path <gamepath>', 'Path to upload dapp.logic.js and dapp.manifest.js')
  .option('-n, --name <gameName>', 'Name for game')
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.uploadGameToBankroller(command))
  .on('--help', () => {
    console.log(`
      Template run:

        dc-cli upload ${chalk.cyan('[options]')}

      Example run:

        dc-cli upload --platformid ${chalk.green('DC_Platform')} --address ${chalk.green('0xf3b7416161E69B4fbF8b7E61a9326F4251ca0a5D')} --game-path ${chalk.green('./dapp')} --name ${chalk.green('example_game_v1')}
      ${chalk.yellow(`
        If arguments are not passed then cli will
        ask, leading questions and set needed arguments 
      `)}
    `)
  })

program
  .command('deploy')
  .description(`${chalk.green(commands['deploy'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.deployGameToIPFS(command))

program
  .command('publish')
  .description(`${chalk.green(commands['publish'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.publishGame(command))

run()
