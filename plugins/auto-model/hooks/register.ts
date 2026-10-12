import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { classify, isAnsweredBy, MAX_LOG, MODEL_BY_TIER, preview, statusLine, statusReport } from './rules'
import type { Decision } from '../types'

const COMMAND = 'auto-model'
const MANUAL_SOURCES = new Set(['command', 'picker', 'sdk'])
const USAGE = '사용법: /auto-model on | off | status'

// Session-only: every session starts off and only `/auto-model on` turns it on.
const isEnabled = atom({ plugin: 'auto-model', key: 'isEnabled' } as const, false)
const pinnedModel = atom({ plugin: 'auto-model', key: 'pinnedModel' } as const, null as string | null)
const log = atom({ plugin: 'auto-model', key: 'log' } as const, [] as Decision[])

const decisionFor = async ($: EngineInterface, turnId: string): Promise<Decision | undefined> =>
  (await read($, log)).find(d => d.turnId === turnId)

const patch = async ($: EngineInterface, turnId: string, change: Partial<Decision>): Promise<Decision | undefined> => {
  await update($, log, list => list.map(d => (d.turnId === turnId ? { ...d, ...change } : d)))
  const next = await decisionFor($, turnId)
  if (next) $.ui.status(statusLine(next))
  return next
}

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const runCommand = async ($: EngineInterface, args: string): Promise<string> => {
  const word = args.trim().toLowerCase()
  if (word === 'on') {
    await update($, isEnabled, () => true)
    const pinned = await read($, pinnedModel)
    $.ui.status(pinned ? `자동 모델 · 켜짐 · 수동 선택(${pinned}) 우선이라 대기` : '자동 모델 · 켜짐')
    return pinned
      ? `자동 선택을 켰습니다. 다만 이 세션은 /model로 ${pinned}를 골라서 수동 선택이 우선합니다.`
      : '자동 선택을 켰습니다. 이 세션에서만 적용되고, 다음 세션은 꺼진 상태로 시작합니다.'
  }
  if (word === 'off') {
    await update($, isEnabled, () => false)
    $.ui.status(undefined)
    return '자동 선택을 껐습니다. 이제 세션 모델(/model)만 씁니다.'
  }
  if (word === '' || word === 'status') {
    return statusReport(await read($, isEnabled), await read($, pinnedModel), await read($, log))
  }
  return `알 수 없는 인자: "${args.trim()}"\n${USAGE}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: '작업 종류별 모델 자동 선택 (on | off | status)' })
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => ({ text: await runCommand($, e.args) }))

  // A model the person picks themselves wins for the rest of the session.
  on('classic.PostModelSwitch', async ($, e, next) => {
    if (MANUAL_SOURCES.has(e.source)) {
      await update($, pinnedModel, () => e.to_model)
      if (await read($, isEnabled)) $.ui.toast(`자동 모델: /model로 ${e.to_model}를 골라 이 세션은 자동 선택을 멈춥니다.`)
    }
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    const isOn = (await read($, isEnabled)) && (await read($, pinnedModel)) === null
    if (isOn && e.text.trim() !== '') {
      const choice = classify(e.text)
      const decision: Decision = {
        turnId: e.turnId,
        at: Date.now(),
        prompt: preview(e.text),
        tier: choice?.tier,
        model: choice ? MODEL_BY_TIER[choice.tier] : undefined,
        reason: choice?.reason ?? '맞는 규칙 없음 → 세션 모델 그대로',
      }
      await update($, log, list => [...list, decision].slice(-MAX_LOG))
      $.ui.status(statusLine(decision))
    }
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const decision = e.agentId ? undefined : await decisionFor($, e.turnId)
    if (!decision?.model || !decision.tier || decision.error || decision.model === e.model) {
      return yield* next(e)
    }

    // While nothing has reached the screen, a failed step can go out again on the session's model.
    let sent = 0
    try {
      const stream = next({ ...e, model: decision.model })
      for await (const chunk of stream) {
        sent += 1
        yield chunk
      }
      const result = await stream.result
      const answered = result.usage?.model
      if (!answered) {
        const why = `응답 없음 (stopReason: ${result.stopReason ?? 'null'})`
        await patch($, e.turnId, { error: why })
        $.ui.toast(`자동 모델 오류: ${decision.model} 요청에 ${why}. 세션 모델 ${e.model}로 진행합니다.`)
        return sent === 0 ? yield* next(e) : result
      }
      await patch($, e.turnId, { answeredBy: answered })
      if (!isAnsweredBy(decision.tier, answered)) {
        $.ui.toast(`자동 모델 경고: ${decision.tier}를 요청했지만 ${answered}가 답했습니다.`)
      }
      return result
    } catch (error: unknown) {
      const why = errorText(error)
      await patch($, e.turnId, { error: why })
      $.ui.toast(`자동 모델 오류: ${decision.model} 요청 실패 (${why}). 세션 모델 ${e.model}로 진행합니다.`)
      if (sent === 0) return yield* next(e)
      throw error
    }
  })
}
