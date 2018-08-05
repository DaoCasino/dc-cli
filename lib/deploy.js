const fs      = require('fs')
const path    = require('path')
const spawn   = require('child_process').spawn
const Utils   = require('../lib/Utils')
const program = require('commander')

module.exports = function () {
  program.parse(process.argv)
  console.log('Deploy dapp')
}