import * as fs from 'fs'
import * as pm2 from 'pm2'
import * as path from 'path'
import { ncp } from 'ncp'
import { machineIdSync } from 'node-machine-id'
import chalk from 'chalk'
import debug from 'debug'
import { spawn } from 'child_process'
import config from './config/config'
import npmCheck from 'update-check'
import startOptionsConfig from './config/startOptions.json'

const log = debug('dc-cli')
const errorLog = debug('dc-cli:err')

export const sudo = (): string => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
export const checkENV = (): boolean => !(!fs.existsSync(config.projectsENV))
export const UUIDGenerate = () => machineIdSync(true)

export function changeStartOptionsJSON (options): void {
  if (
    startOptionsConfig.useDocker !== options.useDocker ||
    startOptionsConfig.blockchainNetwork !== options.blockchainNetwork
  ) {
    const openFile = fs.openSync(config.startOptions, 'w')
    fs.writeSync(openFile, JSON.stringify(options, null, ' '), 0, 'utf-8')
    fs.closeSync(openFile)
  }
}

export function startCLICommand (
  command: string,
  target: string,
  userEnv: any = {}
): Promise<{
  status: string
}> {
  return new Promise((resolve, reject) => {
    const asignEnv = { ...process.env, ...userEnv }
    const startChildProcess = spawn(
      command, [],
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

export async function checkLatestVersion (): Promise<boolean | null> {
  try {
    const checkVersion = await npmCheck(require(config.packageJSON))
    if (checkVersion !== null) {
      const latestVersion = checkVersion.latest
      const targetVersion = require(config.packageJSON).version

      if (targetVersion < latestVersion) {
        log(`
          ${chalk.bgRgb(255, 194, 102).gray('  UPDATE AVALABLE  ')}
          
          Please use ${chalk.green('npm i -g dc-cli@latest')},
          to update for lasst version dc-cli
  
          Last version: ${chalk.green(latestVersion)}
          Your version: ${chalk.red(targetVersion)}
        `)
      }

      return true
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

export function exitProgram (
  pid: number,
  error: Error | boolean,
  exitCode: number = 0
): void {
  if (error) {
    errorLog(error)
  }

  process.exitCode = (exitCode !== null) ? exitCode : 1
  process.kill(pid, 'SIGTERM')
}

export function addExitListener (
  callback: () => void
): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGKILL']
  signals.forEach(signal => {
      process.on(signal, () => {
        if (callback) {
          callback()
        }
        
        log('!Procces out')
        exitProgram(process.ppid, false, 0)
      })
    })
}

export function startPM2Service (serviceConfig) {
  return new Promise((resolve, reject) => {
    pm2.connect(connectError => {
      if (connectError) reject(connectError)

      pm2.start(serviceConfig, (startError, apps) => {
        if (startError) reject(startError)
        resolve(apps)
      })
    })
  })
}

export async function checkPM2Service (processName) {
  try {
  } catch (error) {
    throw error
  }
}

export function deletePM2Service (name) {
  return new Promise((resolve, reject) => {
    pm2.delete(name, async deleteError => {
      if (deleteError) reject(deleteError)
      await pm2.disconnect()
      resolve(name)
    })
  })
}

export function recursiveCopyDirectory (targetPath) {
  return new Promise((resolve, reject) => {
    ncp(
      path.join(__dirname, '../_env/protocol'),
      targetPath,
      err => (err) ? reject(err) : resolve(targetPath)
    )
  })
}

export function callbackToPromise () {

}
