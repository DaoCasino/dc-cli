const spawn    = require('child_process').spawn
const Utils    = require('./Utils')
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

function showLogs (option) {
  const logs = spawn(`${Utils.sudo()} npm run logs:${option}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
  })

  logs
    .on('exit', code => {
      if (code !== 0) {
        process.exitCode = 1
        process.kill(process.pid, 'SIGTERM')
      }
    })
    .on('error', error => {
      console.error(error)
      process.exitCode = 1
      process.kill(process.pid, 'SIGTERM')
    })
}

module.exports = async function (cmd) {
  let option
  switch (true) {
    case cmd.bankroller:
      option = 'bankroller'
      break
    case cmd.rpc:
      option = 'rpc'
      break
    default:
      option = (await prompt({
        type: 'list',
        name: 'target',
        message: 'Select log target?: ',
        choices: ['bankroller', 'rpc']
      })).target
      break
  }

  showLogs(option)
}
