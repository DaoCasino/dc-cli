const fs       = require('fs')
const chalk    = require('chalk')
const spawn    = require('child_process').spawn
const request  = require('request-promise')
const _config  = require('./config')
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

function checkENV () {
  const ENV = (!fs.existsSync(_config.projectsENV))
    ? false : true
  
  return ENV
}

async function checkLatestVersion () {
  try {
    const req = await request({
      url: 'https://api.github.com/repos/daocasino/dc-cli/releases/latest',
      headers: {
        'User-Agent': 'Request-Promise'
      }
    })

    const checkV = JSON.parse(req).name

    if (require(_config.packageJSON).version < checkV) {
      const update = await prompt({
        type: 'confirm',
        name: 'ok',
        message: `${chalk.bgRgb(255, 194, 102).gray(' UPDATE AVALABLE ')} this is last version ${checkV} update?:`
      })

      if (update.ok) {
        (await spawn('npm', ['i', 'daocasino/dc-cli', '-g'], {stdio: 'inhert'}))
      }
    }
  } catch (err) {
    console.log('')
  }
}

function checkGlobalDepend () {
  const log = []
  const checkDepends = spawn('docker -v && docker-compose -v; node -v', {shell: true})
  checkDepends.stdout.on('data', data => log.push(`${data}`))
  checkDepends.stderr.on('data', errData => log.push(`${chalk.bgRed.blac(' Error:TypeERRDATA ')} ${chalk.red(errData)}`))

  checkDepends
    .on('error', err => console.error(err))
    .on('exit', code => {
      if (code !== 0) {
        console.error(`${chalk.bgRed.black(' Error:TypeDependsCHECK ')} ${chalk.red('docker or docker-compose not installed please install of doc [https://docs.docker.com/toolbox/]')}`)
        process.exit()
      }
    })
}

function checkOpts () {
  for (let argv of _config.options) {
    if (process.argv.includes(argv)) {
      return true
    }
  }

  return false
}

function checkTemplate (template) {
  for (let tmp of _config.templates) {
    if (tmp.name.toLowerCase() === template.toLowerCase()) {
      return true
    }
  }

  return false
}

module.exports = {
  checkENV,
  checkOpts,
  checkTemplate,
  checkGlobalDepend,
  checkLatestVersion
}
