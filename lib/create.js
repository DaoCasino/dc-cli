const spawn     = require('child_process').spawn
const program   = require('commander')
const inquirer  = require('inquirer')
const prompt    = inquirer.createPromptModule()

const questions = {
  template: {
    type: 'list',
    name: 'template',
    message: 'Select the standart template',
    choices: ['webpack']
  },
  currDirectory: {
    type: 'confirm',
    name: 'ok',
    message: 'Generate project in current directory?'
  },
  inpDirectory: {
    type: 'input',
    name: 'dir',
    message: 'Input directory name to project'
  }
}

function run (options) {
  let template = false

  if (options.template === 'webpack') {
    template = 'DaoCasino/SDK'
  }
  
  if (typeof options.dir === 'undefined') {
    options.dir = `${options.template}-dapp`
  }
  
  spawn('mkdir', [options.dir]).on('close', () => {
    spawn(
      'truffle',
      ['unbox', template],
      {cwd: `./${options.dir}`, stdio: 'inherit'}
    ).on('error', err => {
      throw new Error(err)
      process.exit()
    }).on('close', () => {
      spawn('npm', ['install'], {cwd: `./${options.dir}`, stdio: 'inherit'})
    })
  })
}

module.exports = function() {
  if (process.argv.length === 3) {
    program.parse(process.argv)
  
    prompt(questions.inpDirectory).then(async answer => {
      run({
        dir: answer.dir || undefined,
        template: program.args[0]
      })
    })
  } else if (process.argv.length < 3) {
    prompt([
      questions.template,
      questions.inpDirectory
    ]).then(answer => {
      run({
        dir      : answer.dir || undefined,
        template : answer.template
      })
    })
  } else {
    program.parse(process.argv)
  
    run({
      dir      : program.args[1],
      template : program.args[0]
    })
  }
}