export interface QuestionInterface {
  name: string
  type: string
  message: string
  pageSize: number
  default?: boolean
  choices?: string[]
}

export interface CommandInterface {
  name: string
  description: string
  env: boolean
}

export interface TemplateInterface {
  name: string
  descript: string
  doc: string
}

export interface CLIConfigInterface {
  commands: CommandInterface[]
  templates: TemplateInterface[]
  networksName: string[]
  bankrollerLocalPrivateKey: string
  isWin: boolean
  ASCIIColor: RegExp
  packageJSON: string
  projectsENV: string
  startOptions: string
  defaultMnemonic: string
}