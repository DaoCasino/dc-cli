import pm2 from 'pm2'

export interface ServiceConfig {
  cwd: string
  env?: any
  args?: string
  name: string
  watch?: boolean
  script: string
  exec_mode: string
  wait_ready?: boolean
  autorestart?: boolean
  kill_timeout?: number
  listen_timeout?: number
}

export interface ProcessLogs {
  error: string[]
  info: string[]
}

export interface ProcessManagerInstance {
  listenExitPM2service: () => Promise<void>
  tornOffExitListenPM2Service: () => Promise<void>
  startPM2Service: (serviceConfig: ServiceConfig) => Promise<{ status: string }> 
  deletePM2Service (name: string): Promise<void>
  startChildProcess (
    command: string,
    target: string,
    userEnv?: any
  ): Promise<{ status: string }>
}