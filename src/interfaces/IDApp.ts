import program from 'commander'
import prompt from 'inquirer'
import { CLIConfigInterface, QuestionInterface } from './ICLIConfig'
export interface InstanceParams {
  prompt: prompt,
  config: CLIConfigInterface,
  nodeStart: string,
  getQuestion: (name: string) => QuestionInterface
}

export interface StartOptions {
  useDocker: boolean
  blockchainNetwork: string
}

export interface GameFiles {
  fileName: string
  fileData: Buffer
}

export interface UploadGameData {
  platformID: string,
  gamePath: string,
  bankrollerAddress: string,
  gameName: string,
  gameFiles: null | GameFiles
}

export interface MigrationParams {
  network: string,
  stdmigrate: boolean
}

export interface StartBankrollerParams {
  background: boolean,
  exit: boolean,
  privatekey: string,
  network: string
}

export interface ServiceConfig {
  cwd: string
  name: string
  exec_mode: string
  env?: any
  script: string
  args: string
  autorestart?: boolean
  watch?: boolean
}

export interface DeployerInstance {
  migrateContract: (options: program.Command | MigrationParams) => Promise<string>
  uploadGameToBankroller: (options: program.Command) => Promise<void>
  deployGameToIPFS: () => Promise<void>
  publishGame: () => Promise<void>
}

export interface DAppInstance extends DeployerInstance {
  start: (options: program.Command) => Promise<void>
  stop: () => Promise<void>
  viewLogs: (options: program.Command) => Promise<void>
  startBankrollerWithNetwork: (
    options: program.Command | StartBankrollerParams
  ) => Promise<void>
}