const program   = require('commander')
const chalk     = require('chalk')
const Utils     = require('../lib/Utils')

module.exports = function () {
  program.parse(process.argv)

  console.log('Template list')
  console.log()
  Utils.templates.forEach(el => {
    console.log(`${chalk.yellow('★ ')} ${chalk.blue(el.name)} - ${el.descript}`)
  })
}