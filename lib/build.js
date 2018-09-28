const spawn = require('child_process').spawn

module.exports = () => spawn('npm run build', {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
})
