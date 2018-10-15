const fs       = require('fs')
const ora      = require('ora')
const path     = require('path')
const spawn    = require('child_process').spawn
const Utils    = require('../lib/Utils')
const inquirer = require('inquirer')

const prompt  = inquirer.createPromptModule()
const spinner = ora('Create project please wait...')

const questions = {
  yarn: {
    type: 'list',
    name: 'useYarn',
    message: 'Use yarn package manager',
    choices: ['Yes', 'No']
  },
  template: {
    type: 'list',
    name: 'template',
    message: 'Select the standart template?: ',
    choices: ['DaoCasino/SDK']
  },
  inpDirectory: {
    type: 'input',
    name: 'dir',
    message: 'Input directory name to project?: '
  }
}

function unbox (template, dir) {
  return new Promise((resolve, reject) => {
    const log   = []
    const unbox = spawn(`truffle unbox ${template}`, { shell: true, cwd: `${dir}` })

    unbox.stdout.on('data', data => { log.push(`${data}`) })
    unbox.stderr.on('data', data => { log.push(`err: ${data}`) })

    unbox.on('error', err => reject(err))
    unbox.on('exit', code => (code !== 0)
      ? reject(new Error(log.join(`\n`)))
      : resolve(true))
  })
}

function install (targetDir, useYarn) {
  return new Promise((resolve, reject) => {
    const log            = []
    const options        = { cwd: `${targetDir}`, stdio: 'inherit', shell: true}
    const packageManager = (useYarn) ? 'yarn' : 'npm'

    const install = spawn(`${packageManager} install`, options)

    install.on('error', err => reject(err))
    install.on('exit', code => (code !== 0)
      ? reject(new Error(log.join(`\n`)))
      : resolve(true))
  })
}

module.exports = async (cmd, template, dir) => {
  await Promise.all([
    Utils.checkGlobalDepend(),
    Utils.checkLatestVersion()
  ])

  if (typeof template === 'undefined') { template = (await prompt(questions.template)).template }

  if (typeof dir === 'undefined') { dir = (await prompt(questions.inpDirectory)).dir }

  if (!cmd.yarn) {
    const useYarn = (await prompt(questions.yarn)).useYarn
    cmd.yarn = (useYarn === 'Yes')
  }

  spinner.start()
  const targetDirectory = path.join(process.cwd(), `${dir}`)

  try {
    (!fs.existsSync(targetDirectory)) && fs.mkdirSync(targetDirectory)
    const unboxing = await unbox(template, targetDirectory)

    if (unboxing) {
      spinner.stop()
      await install(targetDirectory, cmd.yarn)
    }

    spinner.succeed(`Template extracted in directory ${targetDirectory}`)
  } catch (err) {
    console.error(err)
    spinner.fail(`Install DC SDK error...`)

    process.exitCode = 1
    process.kill(process.pid, 'SIGINT')
  }
}
