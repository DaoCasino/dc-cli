import * as Utils from '../Utils'
import _config from '../config/config'
import { expect } from 'chai'

describe('Utils module test', () => {
  afterEach(() => {
    Utils.changeStartOptionsJSON({ useDocker: false, blockchainNetwork: '' })
  })

  it('changeStartOptionsJSON call', () => {
    // Arrange
    const newStartOptions = { useDocker: true, blockchainNetwork: 'kovan' } 
    // Act
    Utils.changeStartOptionsJSON(newStartOptions)
    // Assert
    expect(require('../config/startOptions.json')).to.deep.equal(newStartOptions)
  })

  // it('checkLatestVersion call', async (done) => {
  //   // Arrange
  //   const PackageJSONMock = JSON.stringify({ name: 'dc-cli' })
  //   // Act
  //   // Assert
  // })
})