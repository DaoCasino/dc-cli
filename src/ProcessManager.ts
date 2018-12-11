import pm2 from 'pm2'
import chalk from 'chalk'
import * as Utils from './Utils'
import { exec } from 'child_process'
import { Logger } from 'dc-logging'
import { Promise } from 'bluebird'
import { ServiceConfig, ProcessLogs, ProcessManagerInstance } from './interfaces/IProcessManager'

const log = new Logger('ProcessManager:')

export default class ProcessManager implements ProcessManagerInstance {
  private _logs: ProcessLogs
  private _PromisePm2Api: Promise.promisifyAll
  constructor() {
    this._PromisePm2Api = Promise.promisifyAll(pm2)
    this._logs = { error: [], info: [] }
  }

  async startChildProcess (
    command: string,
    target: string,
    userEnv: any = {}
  ): Promise<{
    status: string
  }> {
    return new Promise((resolve, reject) => {
      const asignEnv = { ...process.env, ...userEnv }
      const startChildProcess = exec(
        command,
        {
          cwd: target,
          env: asignEnv
        }
      )
  
      const printOut = data => log.info(data)
      startChildProcess.stdout.on('data', printOut)
      startChildProcess.stderr.on('data', printOut)
  
      startChildProcess.on('error', error => reject(error))
      startChildProcess.on('exit', code => {
        startChildProcess.stdout.off('data', printOut)
        startChildProcess.stderr.off('data', printOut);
  
        (code !== 0)
          ? reject(new Error(`child procces ${command} exit with code ${code}`))
          : resolve({ status: 'success' })
      })
    })  
  }

  async listenExitPM2service(): Promise<void> {  
    const pm2EventBus = await this._PromisePm2Api.launchBusAsync()
    pm2EventBus.on('log:err', data => this._logs.error.push(data.data))
    pm2EventBus.on('process:event', this._exitHandler)
  }

  async tornOffExitListenPM2Service(): Promise<void> {
    const pm2EventBus = await this._PromisePm2Api.launchBusAsync()
    pm2EventBus.off('log:err', data => this._logs.error.push(data.data))
    pm2EventBus.off('process:event', this._exitHandler)
  }

  async startPM2Service (
    serviceConfig: ServiceConfig
  ): Promise<{ status: string }> {
    try {
      await this._PromisePm2Api.connectAsync()
      const pm2Process = await this._PromisePm2Api.startAsync(serviceConfig)
      
      if (pm2Process.length > 0) {
        await this._PromisePm2Api.disconnectAsync() 
        return pm2Process[0].pm2_env
      }
    } catch (error) {
      throw error
    }
  }

  async deletePM2Service (
    name: string
  ): Promise<void> {
    try {
      await this._PromisePm2Api.deleteAsync(name)
      await this._PromisePm2Api.disconnectAsync()
    } catch (error) {
      throw error
    }
  }

  async _exitHandler(data) {
    if (data.event === 'exit') {
      const errorMessage = chalk.yellow(`
        \rprocess with name ${chalk.cyan(data.process.name)}
        \rclosed with error error message:
        \r${chalk.red(this._logs.error.join('\n'))}
      `)

      await this.deletePM2Service('all')
      await this.tornOffExitListenPM2Service()
      Utils.exitProgram(process.pid, errorMessage, 1)
    }
  }
} 