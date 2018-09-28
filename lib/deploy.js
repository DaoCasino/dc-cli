const fs       = require('fs')
const ora      = require('ora')
const path     = require('path')
const chalk    = require('chalk')
const spawn    = require('child_process').spawn
const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule()

function deployDApp () {
  const log     = []
  const options = { cwd: process.cwd(), shell: true }
  const spinner = ora(`Publishing on ipfs...`)  
  const deploy  = spawn(`npm run deploy:frontend:ipfs`, options)

  deploy.stdout.on('data', data => { log.push(`${data}`) })  
  deploy.stderr.on('data', data => { log.push(`err: ${data}`) })

  deploy
    .on('close', () => spinner.succeed(`Publish on ipfs complete`))
    .on('error', err => spinner.fail(err.message))
    .on('exit', code => {
      if (code !== 0) {
        spinner.fail(`Publish on ipfs error`)
        console.error(log.join(`\n`))
        process.exit(1)
      }
    })
}

function deployContract (network, mnemonic) {
  if (!network) return

  let log = []
  process.env.MNEMONIC = mnemonic  
  const options = { cwd: process.cwd(), stdio: 'inherit', shell: true }
  const migrate = spawn(`npm run deploy:contracts:${network}`, options)

  migrate
    .on('close', () => deployDApp())
    .on('error', err => {
      console.error(err)
      process.exit(1)
    })
    .on('exit', code => {
      if (code !== 0) {
        console.error('Error contract migrate fail with code', code)
        process.exit(1)
      }
    })
}

module.exports = async function (cmd) {
  if (fs.existsSync(path.join(process.cwd(), './truffle.js'))) {
    let network  = false
    let mnemonic = false

    if (cmd.contract) {
      answer = (cmd.ropsten) ? 'Yes' : (await prompt({
        type: 'list',
        name: 'net',
        message: 'Deploy contracts to ropsten?: ',
        choices: ['No', 'Yes']
      })).net;

      network  = (answer === 'Yes') ? 'ropsten' : false
      mnemonic = (network === 'ropsten')
        ? (await prompt({ type: 'input', name: 'mnemonic', message: 'Input mnemonic for deploy:' })).mnemonic
        : undefined
    }

    (cmd.contract && network)
      ? deployContract(network, mnemonic)
      : deployDApp()
  } else {
    console.log('')
    console.error(chalk.bgRed.black(' Error:TypeTRUFFLE '), chalk.red('Deploy contract impossible because not truffle.js, please create truffle.js '))
  }
}
