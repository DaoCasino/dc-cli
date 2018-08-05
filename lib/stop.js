const fs      = require('fs')
const path    = require('path')
const spawn   = require('child_process').spawn
const Utils   = require('../lib/Utils')
const program = require('commander')

module.exports = function () {
  if (fs.existsSync(path.join(process.cwd(), './scripts/stop.sh'))) {
    spawn('npm', ['stop'], {stdio: 'inherit'})
  } else {
    console.error('Not stop.sh file in your project please enter dcdapp create')
    process.exit()
  }
}