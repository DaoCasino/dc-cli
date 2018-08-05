#!/usr/bin/env node
const program = require('commander')
const create  = require('../lib/create')

program
  .version(require('../package').version)
  .usage('<template-name> [project-name]')
  .command('create')
  .description('generate a new project from a template')

program.on('--help', () => {
  console.log()
  console.log('Create structure for DApp development')
  console.log()
  console.log('Options:') 
  console.log()
  console.log(' <template-name> - DApp template (webpack, react, vue)') 
  console.log(' <project-name> - folder and name your app')
  console.log()
  console.log('Example:')
  console.log()
  console.log('dcdapp create webpack my-project')
})

create()