const fs = require('fs')
const pm2 = require('pm2')
const ncp = require('ncp').ncp
const path = require('path')
const UUID = require('node-machine-id')
const chalk = require('chalk')
const { spawn } = require('child_process')
const _config = require('./config/config')
const npmCheck = require('update-check')
const startOptionsConfig = require(_config.startOptions)

const sudo = () => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
const checkENV = () => !(!fs.existsSync(_config.projectsENV))
const UUIDGenerate = () => UUID.machineIdSync({ original: true })

function changeStartOptionsJSON (options) {
  if (
    startOptionsConfig.useDocker !== options.useDocker ||
    startOptionsConfig.blockchainNetwork !== options.blockchainNetwork
  ) {
    const openFile = fs.openSync(_config.startOptions, 'w')
    fs.writeSync(openFile, JSON.stringify(options, null, ' '), 0, 'utf-8')
    fs.closeSync(openFile)
  }
}

function startCLICommand (
  command,
  target,
  userEnv = {}
) {
  return new Promise((resolve, reject) => {
    const asignEnv = { ...process.env, ...userEnv }
    const startChildProcess = spawn(
      command,
      {
        shell: true,
        stdio: 'inherit',
        cwd: target,
        env: asignEnv
      }
    )

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
    const checkVersion = await npmCheck(require(_config.packageJSON))
    if (checkVersion !== null) {
      const latestVersion = checkVersion.latest
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
    }

    return true
  } catch (error) {
    throw error
  }
}

function exitProgram (
  pid,
  error,
  exitCode = 0
) {
  if (error) {
    console.error(error)
  }

  process.exitCode = (exitCode !== null) ? exitCode : 1
  process.kill(pid, 'SIGTERM')
}

function addExitListener (callback = false) {
  ['SIGINT', 'SIGKILL']
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
    pm2.connect(error => {
      (error) && reject(error)

      pm2.start(config, (error, apps) => {
        (error) ? reject(error) : resolve(apps)
      })
    })
  })
}

async function checkPM2Service (processName) {
  try {
  } catch (error) {
    throw error
  }
}

function deletePM2Service (name) {
  return new Promise((resolve, reject) => {
    pm2.delete(name, async err => {
      (err) && reject(new Error(err))

      await pm2.disconnect()
      resolve(name)
    })
  })
}

function recursiveCopyDirectory (targetPath) {
  return new Promise((resolve, reject) => {
    ncp(
      path.join(__dirname, '../_env/protocol'),
      targetPath,
      err => (err) ? reject(err) : resolve(targetPath)
    )
  })
}

function callbackToPromise () {

}

module.exports = {
  sudo,
  checkENV,
  exitProgram,
  UUIDGenerate,
  startCLICommand,
  addExitListener,
  startPM2Service,
  checkPM2Service,
  deletePM2Service,
  checkLatestVersion,
  changeStartOptionsJSON,
  recursiveCopyDirectory
}
