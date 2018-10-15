const Utils = require('./Utils')
const spawn = require('child_process').spawn

module.exports = () => spawn(`${Utils.sudo()} npm stop`, {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
})
