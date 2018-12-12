import chalk from 'chalk'
import config from '../config/config'
import program from 'commander'
import CLIInstance from '../index'
import getQuestion from '../config/questions'
import * as Utils from '../Utils'
import { Logger } from 'dc-logging'
import { CommandInterface } from '../interfaces/ICLIConfig'

const commands = {}
const log = new Logger('CLI')
const CLI = new CLIInstance({ config, getQuestion })
config.commands.forEach(command => { commands[command.name] = command })

function run (): void {
  const programArgs: string[] = process.argv.slice(2)
  let targetCommand: CommandInterface | null = null
  for (const command in commands) {
    if (commands[command].name === programArgs[0]) {
      targetCommand = commands[command]
    }
  }
  
  /**
   * If not enviroment and command needed env
   * then output error log and exit
   */
  if (
    (!programArgs.includes('-f') && !programArgs.includes('--force')) &&
    (!Utils.checkENV() && targetCommand && targetCommand.env)
  ) {
    const error = new Error(
      chalk.red('\nError cannot created project please run dc-cli create and try again\n')
    )

    Utils.exitProgram(process.pid, error, 0)
  }

  /** Parse command line arguments */
  program.parse(process.argv)
  program.cli = true
  /** If arguments not exist then view main menu cli */
  if (program.args.length === 0) {
    CLI.viewMenu()
  }
}

/**
 * Listen all commands
 * if argument command not exists in cli
 * commands then view main menu cli
 */
program.on('command:*', () => CLI.viewMenu())

/* tslint:disable:no-string-literal */
/* tslint:disable:no-var-requires */
program
  .version(`CLI version: ${chalk.red(require(config.packageJSON).version)}`)
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
    log.info(`
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
  // .option('-d, --docker', 'Start env in docker containers')
  .option('-n, --network <network>', 'Set blockchain network for start env')
  .option('-f, --force', 'Force run command not depend enviroment')
  .option('-s, --stdmigrate', 'Start protocol with standart dc-protocol contracts')
  .action(command => CLI.DApp.start(command))

program
  .command('testrpcup')
  .description(`${chalk.green(commands['testrpcup'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-h, --host <host>', 'Use your custom host for ganache testrpc, default 0.0.0.0')
  .option('-p, --port <port>', 'Use your custom port for ganache testrpc, default 8545')
  .option('-n, --nodb', `Don't use data base in ganache testrpc` )
  .option('-b, --background', 'Start process in')
  .action(command => CLI.DApp.startTestRPC(command))

program
  .command('bankrollup')
  .description(`${chalk.green(commands['bankrollup'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --background', 'Start bankroller in background (pm2)')
  .option('-p, --privatekey <privatekey>', 'Input private key for start bankroller in needed network')
  .option('-n, --network <network>', 'Start bankroller in target blockchain network')
  .action(command => CLI.DApp.startBankrollerWithNetwork(command))
  .on('--help', () => {
    log.info(`
      Template run:

        dc-cli bankup ${chalk.cyan('[options]')}

      Example run:

        dc-cli bankup --background --network ${chalk.green('ropsten')} --privatekey ${chalk.green('0x1882c2a6d0df1210d643f82f69d0bdfa0e2e1eaa963384826a4f24d5b5529e10')}
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
  .action(() => CLI.DApp.stop())

program
  .command('logs')
  .description(`${chalk.green(commands['logs'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --bankroller', 'View bankroller logs')
  .option('-t, --testrpc', 'View testrpc logs')
  // .option('-d, --docker', 'Start docker logs')
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
  .command('upload-game')
  .description(`${chalk.green(commands['upload-game'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-p, --platformid <platformId>')
  .option('-a, --address <bankrollerAddress>', 'Bankroller address')
  .option('-g, --game-path <gamePath>', 'Path to upload dapp.logic.js and dapp.manifest.js')
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.uploadGameToBankroller(command))
  .on('--help', () => {
    log.info(`
      Template run:

        dc-cli upload ${chalk.cyan('[options]')}

      Example run:

        dc-cli upload --platformid ${chalk.green('DC_Platform')} --address ${chalk.green('0xf3b7416161E69B4fbF8b7E61a9326F4251ca0a5D')} --game-path ${chalk.green('./dapp')}
      ${chalk.yellow(`
        If arguments are not passed then cli will
        ask, leading questions and set needed arguments 
      `)}
    `)
  })

program
  .command('unload-game')
  .description(`${chalk.green(commands['unload-game'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-p, --platformid <platformId>')
  .option('-a, --address <bankrollerAddress>', 'Bankroller address')
  .option('-n, --game-name <gameName>', 'Path to upload dapp.logic.js and dapp.manifest.js')
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(command => CLI.DApp.unloadGameInBankroller(command))
  .on('--help', () => {
    log.info(`
      Template run:

        dc-cli upload ${chalk.cyan('[options]')}

      Example run:

        dc-cli upload --platformid ${chalk.green('DC_Platform')} --address ${chalk.green('0xf3b7416161E69B4fbF8b7E61a9326F4251ca0a5D')} --game-name ${chalk.green('MyDappGame')}
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
  .action(() => CLI.DApp.deployGameToIPFS())

program
  .command('publish')
  .description(`${chalk.green(commands['publish'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-f, --force', 'Force run command not depend enviroment')
  .action(() => CLI.DApp.publishGame())

run()
