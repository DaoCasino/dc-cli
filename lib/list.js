const chalk   = require('chalk')
const Utils   = require('../lib/Utils')
const _config = require('./config')

module.exports = async function () {
  try {
    const updateChecked = await Utils.checkLatestVersion()

    if (updateChecked) {
      console.log(chalk.yellow('Templates list:'))

      console.log('')
      _config.templates.forEach(el =>
        console.log(`${chalk.yellow('★ ')} ${chalk.blue(el.name)} - ${el.descript} ${chalk.red(el.doc)}`))
      console.log('')
    }
  } catch (error) {
    throw error
  }
}
