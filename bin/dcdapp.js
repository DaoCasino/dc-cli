#!/usr/bin/env node
const program = require('commander')
const dcdapp  = require('../lib/index') 
const create  = require('../lib/create')
const stop    = require('../lib/stop')
const start   = require('../lib/start')
const list    = require('../lib/list')
const deploy  = require('../lib/deploy')

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .description('cli for light development with dc env')

program
  .command('list')
  .description('list available official templates [link doc]')
  .action((val, cmd) => {
    list()
  })

program
  .command('create')
  .description('generate a new project from a template')
  .action((val, cmd) => {
    create()
  })

program
  .command('start')
  .description('Up env for development dapp [link doc]')
  .action((val, cmd) => {
    start()
  })

program
  .command('stop')
  .description('Down env for development dapp [link doc]')
  .action((val, cmd) => {
    stop()
  })

program
  .command('deploy')
  .description('Deploing dapp [link doc]')
  .action((val, cmd) => {
    deploy()
  })

dcdapp()