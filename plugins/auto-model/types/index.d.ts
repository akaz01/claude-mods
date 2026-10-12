export type Tier = 'haiku' | 'sonnet' | 'opus'

export type Rule = { tier: Tier; label: string; pattern: RegExp }

export type Choice = { tier: Tier; reason: string }

export type Decision = {
  turnId: string
  at: number
  prompt: string
  tier?: Tier
  model?: string
  reason: string
  answeredBy?: string
  error?: string
}

declare module 'claude-code' {
  interface PluginState {
    'auto-model': {
      isEnabled: boolean
      pinnedModel: string | null
      log: Decision[]
    }
  }
}
