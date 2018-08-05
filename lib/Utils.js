const childProcess = require('child_process')

const opts      = ['-V', '--version', '-h', '--help', '-c', '--clone']
const templates = [
  {name: 'webpack', descript: 'full frontend template with webpack, truffle, web3'}
]

module.exports.checkOpts = () => {
  for (let argv of opts) {
    if (process.argv.includes(argv)) {
      return true
    }
  }

  return false
}

module.exports.checkTemplate = template => { 
  for (let tmp of templates) {
    if (tmp.name === template) {
      return true
    }
  } 

  return false
}

module.exports.templates = templates