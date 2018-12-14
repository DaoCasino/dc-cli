import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import * as Utils from '../Utils'
import _config from '../config/config'

import { Logger } from 'dc-logging'
import { expect } from 'chai'

const log = new Logger('Test:')

describe('Utils module test', () => { 
  const testDappsPath = path.join(__dirname, './testData/recursiveCopyDirectory/recursiveTarget')
  
  before(() => {
    if (!fs.existsSync(testDappsPath)) {
      fs.mkdirSync(testDappsPath)
    }
  })
  
  afterEach(() => {
    delete process.env.SUDO_UID
  })
  
  it('changeStartOptionsJSON call', () => {
    // Arrange
    const newStartOptions = { useDocker: true, blockchainNetwork: 'local', stdmigrate: false } 
    // Act
    const changeOptions = Utils.changeStartOptionsJSON(newStartOptions)
    // Assert
    expect(changeOptions.useDocker).to.be.equal(newStartOptions.useDocker)
    expect(changeOptions.blockchainNetwork).to.be.equal(newStartOptions.blockchainNetwork)
    expect(changeOptions.stdmigrate).to.be.equal(newStartOptions.stdmigrate)
  })

  it('start with sudo', () => {
    // Arrange
    process.env.SUDO_UID = '222'
    // Act
    const checkSudo = Utils.sudo()
    // Assert
    expect(typeof checkSudo).to.be.a('string')
    expect(checkSudo).to.be.eq('sudo -E')
  })

  it('start without sudo', () => {
    // Act
    const checkSudo = Utils.sudo()
    // Assert
    expect(typeof checkSudo).to.be.a('string')
    expect(checkSudo).to.be.eq('')
  })

  it('UUIDGenerate call', () => {
    // Act
    const uuid = Utils.UUIDGenerate()
    // Assert
    expect(typeof uuid).to.be.a('string')
    expect(uuid.length).to.be.eq(36)
  })

  it('check dc enviroment', () => {
    // Act
    const checkEnv = Utils.checkENV()
    // Assert
    expect(checkEnv).to.be.eq(false)
  })

  it('recursiveCopyDirectory call', async () => {
    // Arrange
    const targetInputPath = path.join(__dirname, './testData/recursiveCopyDirectory/recursiveCopy')
    const targetOutputPath = path.join(__dirname, './testData/recursiveCopyDirectory/recursiveTarget') 
    // Act
    await Utils.recursiveCopyDirectory(targetInputPath, targetOutputPath)
    const checkExistOutDir = fs.existsSync(targetOutputPath)
    const checkFilesInOutDir = fs.readdirSync(targetOutputPath)
    // Assert
    expect(checkExistOutDir).to.be.eq(true)
    expect(checkFilesInOutDir.length).to.be.least(0)
  })

  it('recursiveCopyDirectory error params', async () => {
    const targetInputPath = path.join(__dirname, './testData/recursiveCopyDirectory/recursiveCopy')
    const targetOutputPath = '/.&&&222'
    try {
      await Utils.recursiveCopyDirectory(targetInputPath, targetOutputPath)
    } catch (error) {
      expect(error).to.instanceOf(Error)
    }
  })
})