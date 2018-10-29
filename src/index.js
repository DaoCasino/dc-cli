const fs = require('fs')
const path = require('path')
const DApp = require('./DApp')
const chalk = require('chalk')
const Utils = require('./Utils')
const { spawn } = require('child_process')
const inquirer = require('inquirer')
const download = require('download')

module.exports = class CLIInstance {
  constructor (params) {
    this._params = params
    this._config = this._params.config
    this._prompt = inquirer.createPromptModule()
    this._nodeStart = `node ${path.join(__dirname, '../bin/CLI')}`
    this._getQuestion = this._params.getQuestion

    this.DApp = new DApp({
      prompt: this._prompt,
      config: this._config,
      nodeStart: this._nodeStart,
      getQuestion: this._getQuestion
    })
  }

  async viewMenu () {
    /**
     * Generate menu with commands
     * if env not equal dc-gamesample then
     * all command besides create and list not used
     */
    const commandSelected = (await this._prompt(
      this._getQuestion('viewMenu')
    )).command.split(' ')[0]

    /** Delete color string and start bin file with command */
    const commandWithoutColor = commandSelected.replace(this._config.ASCIIColor, '')
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
      template = (await this._prompt(
        this._getQuestion('templateSelect')
      )).template
    }

    if (typeof directory === 'undefined') {
      directory = (await this._prompt(
        this._getQuestion('directoryInput')
      )).directory
    }

    let useYarn = false
    if (!options.yarn) {
      useYarn = (await this._prompt(
        this._getQuestion('useYarn')
      )).useYarn
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
      `https://github.com/${templateName}/archive/development.zip`, targetDirectory, {
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
