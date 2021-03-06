import fs from 'fs'
import path from 'path'
import DApp from './DApp'
import chalk from 'chalk'
import program from 'commander'
import inquirer from 'inquirer'
import download from 'download'
import ProcessManager from './ProcessManager'
import * as Utils from './Utils'

import { spawn } from 'child_process'
import { Logger } from '@daocasino/dc-logging'
import { DAppInstance } from './interfaces/IDApp'
import { ProcessManagerInstance } from './interfaces/IProcessManager'
import { CLIParams, CLIInstanceInterface } from './interfaces/ICLIInstance'
import { CLIConfigInterface, QuestionInterface } from './interfaces/ICLIConfig'

const log = new Logger('CLIInstance:')

export default class CLIInstance implements CLIInstanceInterface {
  private _params: CLIParams
  private _config: CLIConfigInterface
  private _prompt: inquirer
  private _processManager: ProcessManagerInstance
  private _nodeStart: string
  private _getQuestion: (name: string) => QuestionInterface

  DApp: DAppInstance

  constructor (params: CLIParams) {
    this._params = params
    this._config = this._params.config
    this._prompt = inquirer.createPromptModule()
    this._nodeStart = `node ${path.join(__dirname, '../bin/CLI')}`
    this._getQuestion = this._params.getQuestion
    this._processManager = new ProcessManager

    if (!fs.existsSync(this._config.startOptions)) {
      fs.writeFileSync(this._config.startOptions, JSON.stringify({}))
    }

    this.DApp = new DApp({
      prompt: this._prompt,
      config: this._config,
      nodeStart: this._nodeStart,
      getQuestion: this._getQuestion,
      processManager: this._processManager
    })
  }

  async viewMenu (): Promise<void> {
    /**
     * Generate menu with commands
     * if env not equal dc-gamesample then
     * all command besides create and list not used
     */
    const commandSelected: string = (await this._prompt(
      this._getQuestion('viewMenu')
    )).command.split(' ')[0]

    /** Delete color string and start bin file with command */
    const commandWithoutColor: string = commandSelected.replace(this._config.ASCIIColor, '')
    spawn(`${Utils.sudo()} ${this._nodeStart} ${commandWithoutColor}`, [],{
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    })
  }

  async viewTemplateList (): Promise<void> {
    try {
      await Utils.checkLatestVersion()
      
      log.info(chalk.yellow('Templates list:'))
      this._config.templates.forEach(template => {
        log.info(`
          \r${chalk.yellow('★')} ${chalk.blue(template.name)} - ${template.descript} ${chalk.red(template.doc)}
        `)
      })
    } catch (error) {
      throw error
    }
  }

  async createProject (
    template: string,
    directory: string,
    options: program.Command
  ): Promise<void> {
    await Utils.checkLatestVersion()
    
    let useYarn = options.yarn
    switch (true) {
      case typeof template === 'undefined':
        template = (await this._prompt(
          this._getQuestion('templateSelect')
        )).template
      case typeof directory === 'undefined':
        directory = (await this._prompt(
          this._getQuestion('directoryInput')
        )).directory
      case !useYarn:
        useYarn = (await this._prompt(
          this._getQuestion('useYarn')
        )).useYarn
    }

    try {
      const targetDirectory = path.join(process.cwd(), `${directory}`)
      const packageManager = (useYarn) ? 'yarn' : 'npm'

      if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory)
      }

      await this.downloadProject(template, targetDirectory)
      await this.installProject(packageManager, targetDirectory)
    } catch (error) {
      Utils.exitProgram(process.pid, error)
    }
  }

  private async downloadProject (
    templateName: string,
    targetDirectory: string
  ): Promise<boolean> {
    const readTargetDirectory = fs.readdirSync(targetDirectory)
    if (readTargetDirectory.length !== 0) {
      throw new Error('Directory is not empty')
    }

    const downloadData = await download(
      `https://github.com/${templateName}/archive/development.zip`, targetDirectory, {
        extract: true,
        strip: 1,
        mode: '666',
        headers: { accept: 'application/zip' }
      })

    if (downloadData) {
      log.info('Download sample success')
      return true
    }
  }

  private async installProject (
    packageManager: string,
    targetDirectory: string
  ): Promise<boolean> {
    const generateCommand = `${packageManager} install`
    const installProject = await this._processManager.startChildProcess(
      generateCommand,
      targetDirectory
    )

    if (installProject.status === 'success') {
      log.info('Install sample success')
      return true
    }
  }
}
