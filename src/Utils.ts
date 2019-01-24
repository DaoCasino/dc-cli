import fs from 'fs'
import chalk from 'chalk'
import config from './config/config'
import npmCheck from 'update-check'

import { ncp } from 'ncp'
import { Logger } from '@daocasino/dc-logging'
import { StartOptions } from './interfaces/IDApp'
import { machineIdSync } from 'node-machine-id'

const log = new Logger('Utils')
export const sudo = (): string => (typeof process.env.SUDO_UID !== 'undefined') ? 'sudo -E' : ''
export const checkENV = (): boolean => !(!fs.existsSync(config.projectsENV))
export const UUIDGenerate = (): string => machineIdSync(true)

export function changeStartOptionsJSON (options: StartOptions): StartOptions {
  if (!fs.existsSync(config.startOptions)) {
    fs.writeFileSync(config.startOptions, JSON.stringify({}))
  }

  const startConfigJSON = require(config.startOptions)
  if (!config.networksName.includes(options.blockchainNetwork)) {
    throw new Error(chalk.red(`Network with name ${chalk.cyan(options.blockchainNetwork)} does not exist`))
  }

  if (
    startConfigJSON.useDocker !== options.useDocker ||
    startConfigJSON.blockchainNetwork !== options.blockchainNetwork
  ) {
    const openFile = fs.openSync(config.startOptions, 'w')
    fs.writeSync(openFile, JSON.stringify(options, null, ' '), 0, 'utf-8')
    fs.closeSync(openFile)

    return options
  }

  return startConfigJSON
}

export async function checkLatestVersion (): Promise<{
  latestVersion: string,
  targetVersion: string
} | null> {
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

      return { latestVersion, targetVersion }
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

export function recursiveCopyDirectory (
  targetInputPath: string,
  targetOutputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ncp(
      targetInputPath,
      targetOutputPath,
      error => {
        if (error) reject(new Error(error[0].message))
        resolve()
      }
    )
  })
}
