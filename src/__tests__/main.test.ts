import fs from 'fs'
import pm2 from 'pm2'
import path from 'path'
import config from '../config/config'

import { exec } from 'child_process'
import { expect } from 'chai'
import { Promise } from 'bluebird'

const CLIStart = `node ${path.join(__dirname, '../../bin/CLI')}`

const pm2Promise = Promise.promisifyAll(pm2)

function runCliCommand (command: string, target: string = __dirname): Promise<{ status: string }> {
  return new Promise((resolve, reject) => {
    const errorLog = []
    const stdoutLog = []
    const runCommand = exec(command, { cwd: target } )

    runCommand.stderr.on('data', errorData => errorLog.push(errorData))
    runCommand.stdout.on('data', data => stdoutLog.push(data))
    runCommand.on('error', error => reject(error))
    runCommand.on('exit', code => {
      if (code !== 0) {
        reject(errorLog.join('\n'))
      } else {
        resolve({ status: 'success', stdout: stdoutLog.join('\n') })
      }
    })
  })
}

describe('commands module test', () => {
  const testDappsPath = path.join(__dirname, './testData/testDapps')
  const targetProjectPath = `./testData/testDapps/testDapp_${Math.floor(Math.random() * (1000 - 100)) + 100}`
  
  before(() => {
    if (!fs.existsSync(testDappsPath)) {
      fs.mkdirSync(testDappsPath)
    }
  })
  
  after(async () => { await pm2Promise.disconnectAsync() })

  it('version', async () => {
    // Arrange
    const versionOut = `CLI version: ${require(config.packageJSON).version}\n`
    const versionCommand = `${CLIStart} -V`
    // Act
    const viewTemplates = await runCliCommand(versionCommand)
    if (viewTemplates.status === 'success') {
      // Assert
      expect(viewTemplates.stdout).to.be.eq(versionOut)
    }
  })

  it('list templates', async () => {
    // Arrange
    const checkTextTemplate = config.templates[0].name
    const startCommand = `${CLIStart} list`
    // Act
    const viewTemplates = await runCliCommand(startCommand)
    // Assert
    expect(viewTemplates).to.have.property('status')
    expect(viewTemplates.status).to.be.eq('success')
    expect(viewTemplates.stdout).to.include(checkTextTemplate)
  })
  
  it('create new project', async () => {
    // Arrange
    const targetProjectTemplate = 'daocasino/dc-sdk-example'
    const startCommand = `${CLIStart} create ${targetProjectTemplate} ${targetProjectPath} -y`
    // Act
    const createProject = await runCliCommand(startCommand)
    if (createProject.status === 'success') {
      const checkExistProject = fs.existsSync(path.join(__dirname, targetProjectPath, 'node_modules'))
      // Assert
      expect(checkExistProject).to.be.eq(true)
    }
  })

  it('start enviroment', async () => {
    // Arrange
    const startCommand = `${CLIStart} start`
    // Act
    const startEnviroment = await runCliCommand(startCommand, path.join(__dirname, targetProjectPath))
    if (startEnviroment.status === 'success') {
      const processList = await pm2Promise.listAsync()
      // Assert
      expect(processList.length).to.be.eq(2)
    }
  })

  it('stop enviroment', async () => {
    // Arrange
    const stopCommand = `${CLIStart} stop`
    // Act
    const stopEnviroment = await runCliCommand(stopCommand, path.join(__dirname, targetProjectPath))
    if (stopEnviroment.status === 'success') {
      const processList = await pm2Promise.listAsync()
      // Assert
      expect(processList.length).to.be.eq(0)
    }
  })
})