const { spawn } = require('child_process')
const program   = require('commander')
const inquirer  = require('inquirer')
const prompt    = inquirer.createPromptModule()
const Utils     = require('../lib/Utils')

module.exports = function () {
  if (process.argv.length < 3 ||
    (!Utils.checkOpts() &&
    !program.commands.map(el => el._name).includes(process.argv[2]))
  ) {
    prompt({
      name: 'cmd',
      message: `You doesn't input command or input unknow command please select command for work`,
      type: 'list',
      choices: program.commands.map(el => {
        return `${el._name}: ${el._description}`
      })
    }).then(answer => {
      const ans = answer.cmd.split(':')[0]
      spawn('dcdapp', [ans], {stdio: 'inherit'})
        .on('error', err => {
          throw new Error(err)
        })
    })
  } else {
    program.parse(process.argv)
  }
}