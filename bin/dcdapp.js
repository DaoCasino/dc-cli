#!/usr/bin/env node
const program = require('commander')
const dcdapp  = require('../lib/index') 
const create  = require('../lib/create')

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .description('cli for light development with dc env')
  .command('create', 'generate a new project from a template')
  .command('list', 'list available official templates [link doc]')
  .command('start', 'Up env for development dapp [link doc]')
  .command('stop', 'Down env for development dapp [link doc]')
  .command('deploy', 'Deploing dapp [link doc]')
  .usage(dcdapp())