const spawn = require('child_process').spawn

module.exports = () => spawn('npm stop', {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
})
