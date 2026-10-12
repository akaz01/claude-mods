import { atom, read, update } from 'claude-code'
import type { AgentInfo, EngineInterface, Register } from 'claude-code'

import { renderBoard } from './view'
import { emptyPet, petState } from './pet'
import type { Activity, AgentRow, HeaderData, LogRow, MainRow, Models, TaskRow, UsageRow } from '../types'

const pet = atom({ plugin: 'agent-board', key: 'pet' } as const, emptyPet())

const PANE = 'agent-board'
const TITLE = 'Agent Board'
const POLL_MS = 2000
const MAX_ROWS = 50
const UNKNOWN_MODEL = '모델 미확인'

const agents = atom({ plugin: 'agent-board', key: 'agents' } as const, [] as AgentRow[])
const skills = atom({ plugin: 'agent-board', key: 'skills' } as const, [] as UsageRow[])
const mcp = atom({ plugin: 'agent-board', key: 'mcp' } as const, [] as UsageRow[])
const servers = atom({ plugin: 'agent-board', key: 'servers' } as const, [] as string[])
const tasks = atom({ plugin: 'agent-board', key: 'tasks' } as const, [] as TaskRow[])
const activity = atom({ plugin: 'agent-board', key: 'activity' } as const, {} as Activity)
const models = atom({ plugin: 'agent-board', key: 'models' } as const, {} as Models)
const main = atom({ plugin: 'agent-board', key: 'main' } as const, { status: '대기', lastAt: 0 } as MainRow)
const isOpen = atom({ plugin: 'agent-board', key: 'isOpen' } as const, false)
const header = atom({ plugin: 'agent-board', key: 'header' } as const, { limits: [], updatedAt: 0 } as HeaderData)
const tab = atom({ plugin: 'agent-board', key: 'tab' } as const, 0)
let engineMods: string[] = []
let lastViewportColumns = 0
const log = atom({ plugin: 'agent-board', key: 'log' } as const, [] as LogRow[])

const STATUS_KO: Record<string, string> = {
  pending: '대기',
  waiting: '대기',
  idle: '대기',
  running: '작업 중',
  in_progress: '작업 중',
  completed: '완료',
  failed: '오류',
  killed: '오류',
}

export const statusKo = (status: string): string => STATUS_KO[status] ?? status

export const shortModel = (model: string | undefined): string =>
  model ? model.replace(/^claude-/, '') : UNKNOWN_MODEL

export const bump = (rows: UsageRow[], name: string, at: number): UsageRow[] => {
  const found = rows.some(row => row.name === name)
  const next = found
    ? rows.map(row => (row.name === name ? { ...row, count: row.count + 1, lastAt: at } : row))
    : [...rows, { name, count: 1, lastAt: at }]
  return next.slice(-MAX_ROWS)
}

export const mergeAgents = (
  previous: AgentRow[],
  listed: AgentInfo[],
  seen: Activity,
  spawned: Models,
  now: number,
): AgentRow[] =>
  listed.map(info => {
    const old = previous.find(row => row.id === info.id)
    const status = statusKo(info.status)
    const changed = old === undefined || old.status !== status
    const act = seen[info.id]
    const lastAt = Math.max(act?.at ?? 0, changed ? now : old.lastAt)
    return {
      id: info.id,
      name: info.name ?? info.id.slice(0, 8),
      type: info.type,
      model: shortModel(spawned[info.id]),
      task: act ? `${info.description} · ${act.tool}` : info.description,
      status,
      lastAt,
    }
  })

export const mcpServer = (tool: string): string | undefined =>
  tool.startsWith('mcp__') ? tool.slice(5).split('__')[0] : undefined

const TASK_ID = /<task-id>([^<]+)<\/task-id>/
const TASK_STATUS = /<status>([^<]+)<\/status>/

export const parseNotification = (text: string): { id: string; status: string } | undefined => {
  const id = TASK_ID.exec(text)?.[1]?.trim()
  const status = TASK_STATUS.exec(text)?.[1]?.trim()
  return id && status ? { id, status } : undefined
}

// Bookkeeping must never block the call it observes.
const quietly = async ($: EngineInterface, work: () => Promise<unknown>): Promise<void> => {
  try {
    await work()
  } catch (error) {
    $.ui.log(`agent-board: 기록 실패 (${String(error)})`)
  }
}

const openBoard = async ($: EngineInterface) => {
  const opened = await $.ui.open({ id: PANE, title: TITLE })
  await update($, isOpen, () => true)
  return opened
}

// Plain usage() reads the host's cached figures; never ask for a token breakdown.
const refreshHeader = async ($: EngineInterface) => {
  try {
    const [model, cwd, usage] = await Promise.all([$.session.model(), $.session.cwd(), $.session.usage()])
    let branch = '—'
    try {
      const git = await $.process.run(['git', 'symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd, timeoutMs: 1000 })
      if (git.stdout.trim()) branch = git.stdout.trim()
      else {
        const head = await $.process.run(['git', 'rev-parse', '--short', 'HEAD'], { cwd, timeoutMs: 1000 })
        if (head.stdout.trim()) branch = head.stdout.trim() + ' (detached)'
      }
    } catch { /* Not a repository, or git is unavailable. */ }
    await update($, header, () => ({ model, branch, limits: usage.rateLimits ?? [], updatedAt: Date.now(), stale: false }))
  } catch {
    await update($, header, row => ({ ...row, stale: true }))
  }
}

export const register: Register = on => {
  on('engine.create', async ($, e, next) => {
    const built = await next(e)
    engineMods = [...new Set(e.plugins)].sort()
    return built
  })
  // Observe permission decisions without changing their result. The call's
  // finally block clears its wait flag when it resolves or is cancelled.
  on('tool.check', async ($, e, next) => {
    const verdict = await next(e)
    if (e.tool_use_id && verdict.decision === 'ask') {
      await quietly($, () => update($, pet, row => ({ ...row, waiting: [...new Set([...row.waiting, e.tool_use_id!])] })))
    }
    return verdict
  })

  on('session.end', async ($, e, next) => {
    await quietly($, () => update($, pet, () => emptyPet()))
    return next(e)
  })
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'agent-board',
      description: '에이전트·스킬·MCP·백그라운드 작업 현황 패널을 열고 닫습니다',
    })
    const refresh = async () => {
      try {
        const listed = await $.agent.list()
        const seen = await read($, activity)
        const spawned = await read($, models)
        const previous = await read($, agents)
        const merged = mergeAgents(previous, listed, seen, spawned, Date.now())
        await update($, agents, () => merged)
        if (previous.some(row => row.status === '작업 중') && !merged.some(row => row.status === '작업 중')) {
          if (merged.some(row => row.status === '오류')) {
            await update($, pet, row => ({ ...row, errorAt: Date.now() }))
          } else if (merged.some(row => row.status === '완료')) {
            await update($, pet, row => ({ ...row, doneAt: Date.now() }))
          }
        }
        const tools = await $.tool.list()
        const names = [...new Set(tools.filter(t => t.mcp).map(t => mcpServer(t.name) ?? t.name))]
        await update($, servers, () => names.sort())
      } catch (error) {
        $.ui.log(`agent-board: 현황을 읽지 못했습니다 (${String(error)})`)
      }
    }
    await refresh()
    $.clock.every(POLL_MS, () => void refresh())
    $.clock.every(250, async () => {
      if (await read($, isOpen)) {
        await update($, pet, row => ({ ...row, tick: row.tick + 1 }))
        $.ui.invalidate('ui.render')
      }
    })
    const started = await next(e)
    await refreshHeader($)
    $.clock.every(15000, () => void refreshHeader($))
    // Open the board with every interactive session; /agent-board still closes it.
    if (e.isInteractive) await quietly($, () => openBoard($))
    return started
  })

  on('session.measure', async ($, e, next) => {
    const result = await next(e)
    await refreshHeader($)
    return result
  })

  // Keep the engine's shortcut hint and any other mod's rendering alongside the mark.
  on('ui.render', { component: 'PromptHint', surface: 'terminal' }, async ($, e, next) => {
    const original = await next(e)
    const { Box, Text } = $.ui.resolve(e)
    return <Box flexDirection="row" gap={2}>
      <Box flexShrink={0}><Text wrap="truncate-end" color="claude">✳ Anthropic · Claude Code</Text></Box>
      <Box flexShrink={1}>{original}</Box>
    </Box>
  })

  on('command.run', { command: 'agent-board' }, async $ => {
    if (await read($, isOpen)) {
      await $.ui.close({ id: PANE })
      await update($, isOpen, () => false)
      return { text: 'Agent Board를 닫았습니다.' }
    }
    const opened = await openBoard($)
    return { text: opened.isPlaced ? 'Agent Board를 열었습니다.' : 'Agent Board를 열었습니다. 터미널 폭이 좁으면 넓혀 주세요.' }
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) await quietly($, () => update($, isOpen, () => false))
    return next(e)
  })

  // agent.list carries no model, so remember the one each spawn resolved to.
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    const id = started.agentId
    if (id) await quietly($, () => update($, models, seen => ({ ...seen, [id]: started.model })))
    return started
  })

  // agent.list holds subagents and teammates only; the main loop is tracked here.
  on('turn.step', async function* ($, e, next) {
    if (!e.agentId) {
      await quietly($, () => update($, main, row => ({ ...row, status: '작업 중', model: e.model, lastAt: Date.now() })))
      await quietly($, () => update($, pet, row => ({ ...row, doneAt: 0, errorAt: 0 })))
    }
    return yield* next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!e.agentId) {
      await quietly($, () => update($, main, row => ({ ...row, status: '대기', lastAt: Date.now() })))
      await quietly($, () => update($, pet, row => ({ ...row, waiting: [], inFlight: [],
        doneAt: e.reason === 'answer' ? Date.now() : 0,
        errorAt: e.reason === 'error' || e.reason === 'refusal' ? Date.now() : row.errorAt })))
    }
    return next(e)
  })

  on('skill.prompt', async ($, e, next) => {
    await quietly($, () => update($, skills, rows => bump(rows, e.skill, Date.now())))
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const now = Date.now()
    const id = e.agentId
    if (id) await quietly($, () => update($, activity, seen => ({ ...seen, [id]: { at: now, tool: e.tool } })))
    else await quietly($, () => update($, main, row => ({ ...row, tool: e.tool, lastAt: now })))
    const server = mcpServer(e.tool)
    if (server) await quietly($, () => update($, mcp, rows => bump(rows, server, now)))
    const key = e.tool_use_id || `${e.agentId ?? 'main'}:${e.tool}`
    await quietly($, () => update($, log, rows => [{ id: key, owner: id ?? 'main', tool: e.tool, status: '작업 중', at: now }, ...rows].slice(0, 24)))
    await quietly($, () => update($, pet, row => ({ ...row,
      calls: [...row.calls.filter(at => now - at < 10000), now].slice(-50),
      inFlight: [...new Set([...row.inFlight, key])],
      waiting: e.tool === 'AskUserQuestion' ? [...new Set([...row.waiting, key])] : row.waiting,
    })))
    const ran = await next(e).catch(async error => {
      await quietly($, () => update($, pet, row => ({ ...row, errorAt: Date.now() })))
      await quietly($, () => update($, log, rows => rows.map(row => row.id === key ? { ...row, status: '오류' } : row)))
      throw error
    }).finally(() => quietly($, () => update($, pet, row => ({ ...row,
      inFlight: row.inFlight.filter(id => id !== key), waiting: row.waiting.filter(id => id !== key),
    }))))
    if (ran.isError || ran.deny) await quietly($, () => update($, pet, row => ({ ...row, errorAt: Date.now() })))
    await quietly($, () => update($, log, rows => rows.map(row => row.id === key ? { ...row, status: ran.isError || ran.deny ? '오류' : '완료' } : row)))
    const taskId = e.tool === 'Bash' ? (ran.result as { backgroundTaskId?: string } | undefined)?.backgroundTaskId : undefined
    if (e.tool === 'Bash' && taskId) {
      const row: TaskRow = {
        id: taskId,
        label: e.description ?? e.command.slice(0, 60),
        status: '작업 중',
        startedAt: now,
        lastAt: now,
      }
      await quietly($, () => update($, tasks, rows => [...rows, row].slice(-MAX_ROWS)))
    }
    return ran
  })

  on('prompt.submit', async ($, e, next) => {
    const done = e.origin.kind === 'task-notification' ? parseNotification(e.text) : undefined
    if (done) {
      const now = Date.now()
      if (done.status === 'completed') await quietly($, () => update($, pet, row => ({ ...row, doneAt: now })))
      if (done.status === 'failed' || done.status === 'killed') await quietly($, () => update($, pet, row => ({ ...row, errorAt: now })))
      await quietly($, () =>
        update($, tasks, rows =>
          rows.map(row => (row.id === done.id ? { ...row, status: statusKo(done.status), lastAt: now } : row)),
        ),
      )
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    // In the terminal dock the viewport describes the remaining transcript;
    // include this pane's span to avoid shrinking it again on each resize.
    const totalColumns = (e.viewport?.columns ?? 0) + e.props.bodyColumns + 1
    if (e.props.placement === 'dock' && e.viewport?.columns && totalColumns !== lastViewportColumns) {
      lastViewportColumns = totalColumns
      await quietly($, () => $.ui.open({ id: PANE, title: TITLE, columns: Math.max(24, Math.floor(totalColumns * 0.4)) }))
    }
    const elements = $.ui.resolve(e)
    const [mainRow, agentRows, skillRows, mcpRows, serverNames, taskRows, headerRow, petRow, tabRow, modsRow, logRows] = await Promise.all([
      read($, main),
      read($, agents),
      read($, skills),
      read($, mcp),
      read($, servers),
      read($, tasks),
      read($, header),
      read($, pet),
      read($, tab), Promise.resolve(engineMods), read($, log),
    ])
    const data = { main: mainRow, agents: agentRows, tasks: taskRows, skills: skillRows, mcp: mcpRows, servers: serverNames, header: headerRow,
      tab: tabRow, plugins: modsRow, log: logRows,
      onTab: (index: number) => { void quietly($, async () => {
        await update($, tab, () => index)
        await $.ui.scroll({ in: PANE, to: 'start' })
        $.ui.invalidate('ui.render')
      }) },
    }
    const working = [mainRow, ...agentRows, ...taskRows].filter(row => row.status === '작업 중').length
    const taskErrorAt = Math.max(0, ...[...taskRows, ...agentRows].filter(row => row.status === '오류').map(row => row.lastAt))
    const state = petState({ ...petRow, errorAt: Math.max(petRow.errorAt, taskErrorAt) }, working, Date.now(), taskRows.filter(row => row.status === '작업 중').length)
    const bodyRows = e.props.scroll.bodyRows
    return renderBoard(elements, data, e.props.bodyColumns, {
      bodyRows, offset: e.props.scroll.offset, state, tick: petRow.tick,
    })
  })
}
