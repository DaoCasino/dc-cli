const spawn    = require('child_process').spawn
const Utils    = require('../lib/Utils')
const program  = require('commander')
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

module.exports = function () {
  if (process.argv.length < 3 ||
    (!Utils.checkOpts() &&
    !program.commands.map(el => el._name).includes(process.argv[2]))
  ) {
    prompt({
      name: 'cmd',
      message: `You did not enter a command or enter a nonexistent, What do you want to do?`,
      type: 'list',
      choices: program.commands.map(el => {
        return `${el._name}: ${el._description}`
      })
    }).then(answer => {
      const ans = answer.cmd.split(':')[0]
      spawn('dc-cli', [ans], {stdio: 'inherit'})
        .on('error', err => {
          throw new Error(err)
        })
    })
  } else {
    program.parse(process.argv)
  }
}