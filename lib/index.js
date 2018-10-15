const path = require('path')
const spawn = require('child_process').spawn
const chalk = require('chalk')
const Utils = require('../lib/Utils')
const program = require('commander')
const _config = require('./config')
const inquirer = require('inquirer')

/* @ignore */
const prompt = inquirer.createPromptModule()

/**
 * Export function for start CLI work
 */
module.exports = async function () {
  if (
    process.argv.length < 3 ||
    (!Utils.checkOpts() &&
    !program.commands.map(el => el._name).includes(process.argv[2]))
  ) {
    /**
     * Question to select command for CLI
     * and start with command
     */
    const answer = await prompt({
      name: 'cmd',
      message: `You did not enter a command or enter a nonexistent, What do you want to do?: `,
      type: 'list',
      pageSize: 10,
      choices: _config.commands.filter(el => !((Utils.checkENV() && (el.name === 'list' || el.name === 'create'))))
        .map(el => {
          el.name = (!Utils.checkENV() && (el.name !== 'list' && el.name !== 'create'))
            ? `${chalk.rgb(128, 128, 128)(el.name)}`
            : el.name

          return `${el.name} ${chalk.green(el.description)}`
        })
    })

    const command = answer.cmd.split(' ')[0]
    spawn(`${Utils.sudo()} node ${path.join(__dirname, '../bin/cli')} ${command.replace(_config.ASCIColor, '')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true
    })
  }
}
