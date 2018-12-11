import program from 'commander'
import prompt from 'inquirer'
import { ProcessManagerInstance } from './IProcessManager'
import { CLIConfigInterface, QuestionInterface } from './ICLIConfig'

export interface InstanceParams {
  prompt: prompt,
  config: CLIConfigInterface,
  nodeStart: string,
  getQuestion: (name: string) => QuestionInterface
  processManager: ProcessManagerInstance
}

export interface StartOptions {
  useDocker: boolean
  blockchainNetwork: string
  stdmigrate?: boolean
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

export interface StartTestRPCParams {
  host: string
  port: number
  nodb: boolean
  background: boolean
}

export interface StartBankrollerParams {
  background: boolean,
  exit: boolean,
  privatekey: string,
  network: string
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
  startTestRPC: (options: program.Command | StartTestRPCParams) => Promise<void>
  startBankrollerWithNetwork: (
    options: program.Command | StartBankrollerParams
  ) => Promise<void>
}