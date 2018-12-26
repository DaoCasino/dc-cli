import program from 'commander'
import { CLIConfigInterface, QuestionInterface } from './ICLIConfig'

export interface CLIParams {
  config: CLIConfigInterface
  getQuestion: (
    name: string
  ) => QuestionInterface
}

export interface CLIInstanceInterface {
  viewMenu: () => Promise<void>
  viewTemplateList: () => Promise<void>
  createProject: (
    template: string,
    directory: string,
    options: program.Command
  ) => Promise<void>
}
