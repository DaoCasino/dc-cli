const fs = require('fs')
const path = require('path')
const DApp = require('./DApp')
const chalk = require('chalk')
const Utils = require('./Utils')
const { spawn } = require('child_process')
const Deployer  = require('./Deployer')
const inquirer = require('inquirer')
const download = require('download')

module.exports = class CLIInstance {
  constructor (params) {
    this._params = params
    this._config = this._params.config
    this._prompt = inquirer.createPromptModule()
    this._nodeStart = `node ${path.join(__dirname, '../bin/CLI')}`

    this.DApp = new DApp({
      prompt: this._prompt,
      config: this._config,
      nodeStart: this._nodeStart
    })
  }

  async viewMenu () {
    /**
     * Generate menu with commands
     * if env not equal dc-gamesample then
     * all command besides create and list not used
     */
    const commandSelected = (await this._prompt({
      name: 'command',
      message: `You did not enter a command or enter a nonexistent, What do you want to do?: `,
      type: 'list',
      pageSize: 10,
      choices: this._config.commands
        .filter(command => !((Utils.checkENV() && (command.name === 'list' || command.name === 'create'))))
        .map(command => {
          if (
            !Utils.checkENV() &&
            (command.name !== 'list' && command.name !== 'create')
          ) {
            command.name = `${chalk.rgb(128, 128, 128)(command.name)}`
          }

          return `${command.name} ${chalk.green(command.description)}`
        })
    })).command.split(' ')[0]

    /** Delete color string and start bin file with command */
    const commandWithoutColor = commandSelected.replace(this._config.ASCIColor, '')
    spawn(`${Utils.sudo()} ${this._nodeStart} ${commandWithoutColor}`, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    })
  }

  async viewTemplateList () {
    try {
      const updateChecked = await Utils.checkLatestVersion()

      if (updateChecked) {
        console.log(chalk.yellow('Templates list:'))

        this._config.templates
          .forEach(template => {
            console.log('')
            console.log(`
              ${chalk.yellow('★ ')} ${chalk.blue(template.name)} - ${template.descript} ${chalk.red(template.doc)}
            `)
          })
      }
    } catch (error) {
      throw error
    }
  }

  async createProject (directory, template, options) {
    await Utils.checkLatestVersion()

    if (typeof template === 'undefined') {
      template = (await this._prompt({
        type: 'list',
        name: 'template',
        message: 'Select the standart template?: ',
        choices: ['DaoCasino/SDK']
      })).template
    }

    if (typeof directory === 'undefined') {
      directory = (await this._prompt({
        type: 'input',
        name: 'directory',
        message: 'Input directory name to project?: '
      })).directory
    }

    let useYarn = false
    if (!options.yarn) {
      useYarn = (await this._prompt({
        type: 'confirm',
        name: 'useYarn',
        message: 'Use yarn package manager',
        default: true
      })).useYarn
    }

    try {
      const targetDirectory = path.join(process.cwd(), `${directory}`)
      const packageManager = (useYarn) ? 'yarn' : 'npm';

      (!fs.existsSync(targetDirectory)) && fs.mkdirSync(targetDirectory)

      await this._downloadProject(template, targetDirectory)
      await this._installProject(packageManager, targetDirectory)
    } catch (error) {
      Utils.exitProgram(process.pid, error)
    }
  }

  async _downloadProject (templateName, targetDirectory) {
    const readTargetDirectory = fs.readdirSync(targetDirectory)
    if (readTargetDirectory.length !== 0) {
      throw new Error('Directory is not empty')
    }

    const downloadData = await download(
      `https://github.com/${templateName}/archive/master.zip`, targetDirectory, {
        extract: true,
        strip: 1,
        mode: '666',
        headers: { accept: 'application/zip' }
      })

    if (downloadData) {
      console.log('Download sample success')
      return true
    }
  }

  async _installProject (packageManager, targetDirectory) {
    const generateCommand = `${packageManager} install`
    const installProject = await Utils.startCLICommand(generateCommand, targetDirectory)

    if (installProject.status === 'success') {
      console.log('Install sample success')
      return true
    }
  }
}
