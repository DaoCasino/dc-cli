const fs       = require('fs')
const chalk    = require('chalk')
const spawn    = require('child_process').spawn
const _config  = require('./config')
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

const sudo = () => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
const checkENV = () => !(!fs.existsSync(_config.projectsENV))

function startCLICommand (command, target = process.cwd()) {
  return new Promise((resolve, reject) => {
    const log = []
    const startChildProcess = spawn(command, {shell: true, cwd: target})

    startChildProcess.stdout.on('data', data => log.push(`${data}`))
    startChildProcess.stderr.on('data', errorData => log.push(`${errorData}`))

    startChildProcess.on('error', error => reject(error))
    startChildProcess.on('exit', code => {
      const parseLog = log.join('\n');

      (code !== 0)
        ? reject(new Error(parseLog))
        : resolve({ status: 'ok', logMessage: parseLog })
    })
  })
}

async function checkLatestVersion () {
  try {
    const latestVersion = (await startCLICommand('npm view dc-cli@latest version')).logMessage
    const targetVersion = require(_config.packageJSON).version

    if (targetVersion < latestVersion.trim()) {
      console.log('')
      console.log(`${chalk.bgRgb(255, 194, 102).gray('  UPDATE AVALABLE  ')}`)
      console.log(`
        Please use ${chalk.green('npm i -g dc-cli@latest')},
        to update for lasst version dc-cli

        Last version: ${chalk.green(latestVersion)}
        Your version: ${chalk.red(targetVersion)}
      `)
      console.log('')
    }

    return true
  } catch (error) {
    throw error
  }
}

function checkGlobalDepend () {
  const log = []
  const checkDepends = spawn('docker -v && docker-compose -v; node -v', {shell: true})
  checkDepends.stdout.on('data', data => log.push(`${data}`))
  checkDepends.stderr.on('data', errData => log.push(`${chalk.bgRed.blac(' Error:TypeERRDATA ')} ${chalk.red(errData)}`))

  checkDepends
    .on('error', err => console.error(err))
    .on('exit', code => {
      if (code !== 0) {
        console.error(`${chalk.bgRed.black(' Error:TypeDependsCHECK ')} ${chalk.red('docker or docker-compose not installed please install of doc [https://docs.docker.com/toolbox/]')}`)
        process.exit()
      }
    })
}

function checkOpts () {
  for (let argv of _config.options) {
    if (process.argv.includes(argv)) {
      return true
    }
  }

  return false
}

function checkTemplate (template) {
  for (let tmp of _config.templates) {
    if (tmp.name.toLowerCase() === template.toLowerCase()) {
      return true
    }
  }

  return false
}

module.exports = {
  sudo,
  checkENV,
  checkOpts,
  checkTemplate,
  startCLICommand,
  checkGlobalDepend,
  checkLatestVersion
}
