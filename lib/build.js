const spawn = require('child_process').spawn
const Utils = require('./Utils')

module.exports = () => spawn(`${Utils.sudo()} npm run build`, {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
})
