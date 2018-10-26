const fs = require('fs')
const pm2 = require('pm2')
const ncp = require('ncp').ncp
const UUID = require('node-machine-id')
const chalk = require('chalk')
const { spawn } = require('child_process')
const _config = require('./config/config')
const npmCheck = require('update-check')

const sudo = () => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
const checkENV = () => !(!fs.existsSync(_config.projectsENV))

function startCLICommand (command, target = process.cwd()) {
  return new Promise((resolve, reject) => {
    const startChildProcess = spawn(command, {shell: true, stdio: 'inherit', cwd: target})

    startChildProcess.on('error', error => reject(error))
    startChildProcess.on('exit', code => {
      (code !== 0)
        ? reject(new Error(`child procces ${command} exit with code ${code}`))
        : resolve({ status: 'success' })
    })
  })
}

async function checkLatestVersion () {
  try {
    const latestVersion = (await npmCheck(require(_config.packageJSON))).latest
    const targetVersion = require(_config.packageJSON).version

    if (targetVersion < latestVersion) {
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
        exitProgram(process.pid)
      }
    })
}

function exitProgram (pid, error, exitCode) {
  if (error) {
    console.error(error)
  }

  process.exitCode = exitCode || 1
  process.kill(pid, 'SIGTERM')
}

function addExitListener (callback = false) {
  ['SIGINT', 'SIGKILL', 'exit']
    .forEach(signal => {
      process.on(signal, () => {
        (callback) && callback()
        console.log('!Procces out')
        exitProgram(process.ppid, false, 0)
      })
    })
}

function startPM2Service (config) {
  return new Promise((resolve, reject) => {
    pm2.connect(err => {
      (err) && reject(err)

      pm2.start(config, (err, apps) => {
        (err) ? reject(err) : resolve(true)
      })
    })
  })
}

function deletePM2Service (name) {
  return new Promise((resolve, reject) => {
    pm2.delete('bankroller', async err => {
      (err) && reject(new Error(err))

      await pm2.disconnect()
      resolve(name)
    })
  })
}

module.exports = {
  sudo,
  checkENV,
  exitProgram,
  startCLICommand,
  addExitListener,
  checkGlobalDepend,
  checkLatestVersion
}
