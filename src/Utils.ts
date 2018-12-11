import fs from 'fs'
import ncpApi from 'ncp'
import chalk from 'chalk'
import config from './config/config'
import npmCheck from 'update-check'
import startConfigInJson from './config/startOptions.json'

import { exec } from 'child_process'
import { Logger } from 'dc-logging'
import { Promise } from 'bluebird'
import { machineIdSync } from 'node-machine-id'
import { StartOptions } from './interfaces/IDApp'

const log = new Logger('Utils')
const promiseNcpApi = Promise.promisify(ncpApi)

export const sudo = (): string => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
export const checkENV = (): boolean => !(!fs.existsSync(config.projectsENV))
export const UUIDGenerate = (): string => machineIdSync(true)

export function changeStartOptionsJSON (options: StartOptions): void {
  if (
    startConfigInJson.useDocker !== options.useDocker ||
    startConfigInJson.blockchainNetwork !== options.blockchainNetwork
  ) {
    const openFile = fs.openSync(config.startOptions, 'w')
    fs.writeSync(openFile, JSON.stringify(options, null, ' '), 0, 'utf-8')
    fs.closeSync(openFile)
  }
}

export async function checkLatestVersion (): Promise<boolean | null> {
  try {
    const checkVersion = await npmCheck(require(config.packageJSON))
    if (checkVersion !== null) {
      const latestVersion = checkVersion.latest
      const targetVersion = require(config.packageJSON).version

      if (targetVersion < latestVersion) {
        log.info(`
          \r${chalk.bgRgb(255, 194, 102).gray('  UPDATE AVALABLE  ')}
          
          \rPlease use ${chalk.green('npm i -g dc-cli@latest')},
          \rto update for lasst version dc-cli
  
          \rLast version: ${chalk.green(latestVersion)}
          \rYour version: ${chalk.red(targetVersion)}
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
  error: Error | string | boolean,
  exitCode: number = 0
): void {
  if (error) {
    log.error(error)
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
        if (callback) callback()
        exitProgram(process.ppid, false, 0)
      }) 
    })
}

export async function recursiveCopyDirectory (
  targetInputPath: string,
  targetOutputPath: string
): Promise<void> {
  try {
    await promiseNcpApi.ncpAsync(targetInputPath, targetOutputPath)
  } catch (error) {
    throw error
  }
}
