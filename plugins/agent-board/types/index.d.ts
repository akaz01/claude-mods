export type PetActivity = { tick: number; calls: number[]; inFlight: string[]; waiting: string[]; doneAt: number; errorAt: number }

export type AgentRow = {
  id: string
  name: string
  type: string
  model: string
  task: string
  status: string
  lastAt: number
}

export type UsageRow = { name: string; count: number; lastAt: number }

export type TaskRow = {
  id: string
  label: string
  status: string
  startedAt: number
  lastAt: number
}

export type Activity = Record<string, { at: number; tool: string }>

export type Models = Record<string, string>
export type LogRow = { id: string; owner: string; tool: string; status: string; at: number }

export type MainRow = { status: string; model?: string; tool?: string; lastAt: number }

export type HeaderData = {
  model?: string
  branch?: string
  limits: { kind: string; percentUsed: number; resetsAt?: string }[]
  updatedAt: number
  stale?: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'agent-board': {
      agents: AgentRow[]
      skills: UsageRow[]
      mcp: UsageRow[]
      servers: string[]
      tasks: TaskRow[]
      activity: Activity
      models: Models
      main: MainRow
      isOpen: boolean
      header: HeaderData
      pet: PetActivity
      tab: number
      log: LogRow[]
    }
  }
}
