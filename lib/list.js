const chalk = require('chalk')
const Utils = require('../lib/Utils')

module.exports = function () {
  console.log('')
  console.log(chalk.yellow('Templates list'))
  console.log('')
  Utils.templates.forEach(el => {
    console.log(`${chalk.yellow('★ ')} ${chalk.blue(el.name)} - ${el.descript}`)
  })
}