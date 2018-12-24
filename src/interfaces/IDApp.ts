import program from 'commander'
import prompt from 'inquirer'
import { PingServiceParams } from '@daocasino/bankroller-core/lib/intefaces'
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
  fileData: string
}

export interface LoadParams {
  address: string,
  gameName?: string
  gamePath?: string
  platformid: string
}

export interface UploadGameData extends PingServiceParams {
  targetGamePath: string,
  gameDirectoryName: string
  gameFiles: GameFiles[]
}

export interface UnloadGameData extends PingServiceParams {
  gameName: string
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
  unloadGameInBankroller: (options: program.Command) => Promise<void>
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