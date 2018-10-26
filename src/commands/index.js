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
  .action((cmd) => CLI.DApp.start(cmd))

program
  .command('stop')
  .description(`${chalk.green(commands['stop'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)

program
  .command('logs')
  .description(`${chalk.green(commands['logs'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)

program
  .command('build')
  .description(`${chalk.green(commands['build'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)

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
