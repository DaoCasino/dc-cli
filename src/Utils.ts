import fs from 'fs'
import path from 'path'
import pm2 from 'pm2'
import ncpApi from 'ncp'
import chalk from 'chalk'
import config from './config/config'
import npmCheck from 'update-check'
import startOptionsConfig from './config/startOptions.json'
import { Logger } from 'dc-logging'
import { spawn } from 'child_process'
import { Promise } from 'bluebird'
import { machineIdSync } from 'node-machine-id'
import { ServiceConfig } from './interfaces/IDApp'

const log = new Logger('Utils')
const PromisePm2Api = Promise.promisifyAll(pm2)
const promiseNcpApi = Promise.promisify(ncpApi)

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
  error: Error | boolean,
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
        if (callback) {
          callback()
        }
        
        log.info('!Procces out')
        exitProgram(process.ppid, false, 0)
      })
    })
}

export async function startPM2Service (
  serviceConfig: ServiceConfig
): Promise<string> {
  try {
    Object.keys(PromisePm2Api).forEach(el => {
      console.log(el)
    })
    await PromisePm2Api.connectAsync()
    await PromisePm2Api.startAsync(serviceConfig)
  } catch (error) {
    throw error
  }
}

export async function checkPM2Service (processName: string) {
  try {
    const serviceList = await PromisePm2Api.describeAsync(processName)
    for (const service of serviceList) {
      const { status } = service.pm2_env
      if (status !== 'online') {
        throw new Error(`Process with name ${processName} not started`)
      }
    }
  } catch (error) {
    throw error
  }
}

export async function deletePM2Service (
  name: string
): Promise<string> {
  try {
    await PromisePm2Api.deleteAsync(name)
    await PromisePm2Api.disconnectAsync()

    return name
  } catch (error) {
    throw error
  }
}

export async function recursiveCopyDirectory (targetPath) {
  try {
    await promiseNcpApi.ncpAsync(
      path.join(__dirname, '../_env/protocol'),
      targetPath
    )
  } catch (error) {
    throw error
  }
}
