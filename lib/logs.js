const spawn    = require('child_process').spawn
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

async function run (option) {
  const logs = await spawn(`npm run logs:${option}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
  })

  logs
    .on('exit', code => (code !== 0) && process.exit())
    .on('error', err => {
      console.error(err.message)
      process.exit()
    })
}

module.exports = async function (cmd) {
  let option = false
  if (cmd === 'bankroller') {
    option = 'bankroller'
  } else if (cmd === 'rpc') {
    option = 'rpc'
  } else {
    option = (await prompt({
      type: 'list',
      name: 'target',
      message: 'Select log target?: ',
      choices: ['bankroller', 'rpc']
    })).target
  }

  run(option)
}
