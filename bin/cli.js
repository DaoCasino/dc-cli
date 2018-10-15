#!/usr/bin/env node
const stop = require('../lib/stop')
const list = require('../lib/list')
const logs = require('../lib/logs')
const start = require('../lib/start')
const build = require('../lib/build')
const Utils = require('../lib/Utils')
const chalk = require('chalk')
const create = require('../lib/create')
const deploy = require('../lib/deploy')
const _config = require('../lib/config')
const publish = require('../lib/publish')
const program = require('commander')
const startCLI = require('../lib/index')

const commands = {}
_config.commands.forEach(c => {
  commands[c.name] = c
})

/**
 * Central command for CLI
 *
 * Usage:
 * <command> [options]
 *
 * Example:
 * dc-cli -V : CLI Versions
 * dc-clli -h or --help : Help for CLI
 */
program
  .version(`CLI version: ${chalk.red(require('../package').version)}`)
  .usage('<command> [options]')
  .description(chalk.green('CLI for light development with DC ENV'))

/**
 * List command
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli list
 */
program
  .command('list')
  .description(`${chalk.green(commands['list'].description.trim())} `)
  .action(() => list())

/**
 * Command for create project with template
 *
 * Usage:
 * <template-name> <project-name>
 *
 * Example:
 * dc-cli create daocasino/sdk my-project
 */
program
  .command('create [dir] [template]')
  .description(`${chalk.green(commands['create'].description.trim())} `)
  .usage(`${chalk.red('<template-name> <project-name>')}`)
  .option('-y, --yarn', 'Use yarn package manager for install')
  .action((dir, template, cmd) => create(cmd, dir, template))
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

/**
 * Command for start ENV
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli start
 */
program
  .command('start')
  .description(`${chalk.green(commands['start'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .action((val, cmd) => {
    if (Utils.checkENV()) {
      start()
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('start impossible because not env, please use dc-cli create'))
    }
  })

/**
 * Command for stop ENV
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli stop
 */
program
  .command('stop')
  .description(`${chalk.green(commands['stop'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .action((val, cmd) => {
    if (Utils.checkENV()) {
      stop()
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('stop impossible because not env, please use dc-cli create'))
    }
  })

/**
 * Command for output logs
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli logs -b / --bankroller : logs Bankroller
 * dc-cli logs -r / --rpc        : logs testrpc
 */
program
  .command('logs')
  .description(`${chalk.green(commands['logs'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-b, --bankroller', 'Start log with bankroller')
  .option('-r, --rpc', 'Start log with testrpc')
  .action(val => {
    if (Utils.checkENV()) {
      logs(val)
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('logs impossible because not env, please use dc-cli create'))
    }
  })

/**
 * Command for build DApp
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli build
 */
program
  .command('build')
  .description(`${chalk.green(commands['build'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .action((val, cmd) => {
    if (Utils.checkENV()) {
      build()
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('Build impossible because not env, please use dc-cli create'))
    }
  })

/**
 * Command for publish DApp
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli -s / --server   : Deploy to server with ssh
 * dc-cli -i / --ipfs     : Deploy to ipfs
 * dc-cli -f / --firebase : Deploy to firebase
 */
program
  .command('publish')
  .description(`${chalk.green(commands['publish'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .action(val => {
    if (Utils.checkENV()) {
      publish(val)
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('publish impossible because not env, please use dc-cli create'))
    }
  })

/**
 * Deploy contract to network
 *
 * Usage:
 * [options]
 *
 * Example:
 * dc-cli deploy -r / --ropsten     : Deploy contract to ropsten network
 * dc-cli deploy -l / --local       : Deploy contract to local network
 * dc-cli deploy -i / --ipfs        : Deploy DApp to ipfs
 * dc-cli deploy -c / --no-contract : Skip deploy contract
 * dc-cli deploy -d / --no-dapp     : Skip deploy dapp
 */
program
  .command('deploy')
  .description(`${chalk.green(commands['deploy'].description.trim())} `)
  .usage(`${chalk.red('[options]')}`)
  .option('-r, --ropsten', 'Deploy to ropsten network')
  .option('-l, --local', 'Deploy to local network')
  .option('-c, --no-contract', 'Skip deploy contract')
  .option('-d, --no-dapp', 'Skip deploy DApp')
  .action(val => {
    if (Utils.checkENV()) {
      deploy(val)
    } else {
      console.log('')
      console.error(chalk.bgRed.bold.black(' Error:TypeENV '), chalk.red('deploy impossible because not env, please use dc-cli create'))
    }
  })

program.parse(process.argv)
if (program.args.length === 0) startCLI()
