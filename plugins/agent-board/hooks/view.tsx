import type { BoxProps, ButtonProps, Color, ElementConstructor, TextProps } from 'claude-code'

import type { AgentRow, HeaderData, LogRow, MainRow, TaskRow, UsageRow } from '../types'
import { CLAUDE_MARK } from './logo'
import { renderPet, type PetState } from './pet'
import { CAT } from './cat-sprites'

type Elements = {
  Box: ElementConstructor<BoxProps>
  Text: ElementConstructor<TextProps>
  Button?: ElementConstructor<ButtonProps>
}

export type BoardData = {
  main: MainRow
  agents: AgentRow[]
  tasks: TaskRow[]
  skills: UsageRow[]
  mcp: UsageRow[]
  servers: string[]
  header?: HeaderData
  tab?: number
  plugins?: string[]
  log?: LogRow[]
  onTab?: (index: number) => void
}

type Mark = { icon: string; color: Color }

const MARKS: Record<string, Mark> = {
  '작업 중': { icon: '●', color: 'success' },
  '대기': { icon: '○', color: 'inactive' },
  '완료': { icon: '✓', color: 'subtle' },
  '오류': { icon: '✗', color: 'error' },
}
const OTHER_MARK: Mark = { icon: '·', color: 'inactive' }
const ACCENT: Color = 'cyan'
const RULE = '─'

export const markFor = (status: string): Mark => MARKS[status] ?? OTHER_MARK

export const clock = (at: number): string =>
  at > 0 ? new Date(at).toTimeString().slice(0, 8) : '-'

export const isWorking = (status: string): boolean => status === '작업 중'

export const remainingLimits = (limits: HeaderData['limits']) =>
  limits.filter(row => Number.isFinite(row.percentUsed)).map(row => ({
    label: row.kind === 'five_hour' ? '5h' : row.kind === 'seven_day' ? '7d' : row.kind,
    remaining: Math.max(0, Math.min(100, 100 - row.percentUsed)),
  }))

export const summary = (data: BoardData): string => {
  const working = [data.main, ...data.agents, ...data.tasks].filter(row => isWorking(row.status)).length
  return `${working} 작업 중 · 서브 ${data.agents.length} · 작업 ${data.tasks.length} · MCP ${data.servers.length}`
}

export const splitServers = (servers: string[], used: UsageRow[]): { used: UsageRow[]; idle: number } => {
  const connected = used.filter(row => servers.includes(row.name))
  const extra = used.filter(row => !servers.includes(row.name))
  return {
    used: [...connected, ...extra].sort((a, b) => b.lastAt - a.lastAt),
    idle: servers.filter(name => !used.some(row => row.name === name)).length,
  }
}

export const renderBoard = ({ Box, Text, Button }: Elements, data: BoardData, columns: number,
  pet?: { bodyRows: number; offset: number; state: PetState; tick: number }) => {
  const width = Math.max(1, columns)
  const ruleWidth = Math.max(1, columns - 4)
  const tab = data.tab ?? 0
  const header = data.header
  const limits = remainingLimits(header?.limits ?? []).filter(row => row.label === '5h' || row.label === '7d')
  const headerWidth = Math.max(1, columns - (columns >= 44 ? 18 : 4))
  const quotaWidth = Math.max(1, Math.min(13, Math.floor((headerWidth - Math.max(0, limits.length - 1) * 2) / Math.max(1, limits.length))))
  const barWidth = Math.max(1, Math.min(12, quotaWidth))
  const tabNames = ['Home', 'Agents', 'Log', 'MCP', 'Plug', 'Skills']
  const activeAgents = data.agents.filter(row => isWorking(row.status))
  const activeTasks = data.tasks.filter(row => isWorking(row.status))
  const connectedServers = [...new Set([...data.servers, ...data.mcp.map(row => row.name)])].sort()
  const headerRows = 12

  const Section = ({ title, count }: { title: string; count?: string }) => (
    <Box flexDirection="row" marginTop={1} gap={1}>
      <Box flexShrink={0}><Text wrap="truncate-end" bold>{title}</Text></Box>
      {count !== undefined && <Box flexShrink={0}><Text wrap="truncate-end" bold>{count}</Text></Box>}
      <Box flexShrink={1} flexGrow={1}><Text wrap="truncate-end" bold>{RULE.repeat(Math.max(1, ruleWidth - [...title].reduce((n, c) => n + (c.charCodeAt(0) > 255 ? 2 : 1), 0) - (count === undefined ? 1 : count.length + 2)))}</Text></Box>
    </Box>
  )
  const Empty = ({ text = '없음' }: { text?: string }) => <Text wrap="truncate-end" dimColor>{text}</Text>
  const Row = (props: { status: string; name: string; model?: string; task?: string }) => {
    const mark = markFor(props.status)
    return <Box flexDirection="column">
      <Text wrap="truncate-end" color={mark.color}>{`${mark.icon} ${props.name}  ·  ${props.status}`}</Text>
      {props.model !== undefined && <Text wrap="truncate-end" color={ACCENT}>{`    ${props.model}`}</Text>}
      {props.task !== undefined && <Text wrap="truncate-end">{`    ${props.task}`}</Text>}
    </Box>
  }
  const Main = () => <Box flexDirection="column">
    <Section title="메인 세션" count="1" />
    <Row status={data.main.status} name="main" model={data.main.model ?? header?.model ?? '모델 미확인'}
      task={data.main.tool ? `마지막 도구 · ${data.main.tool}` : '공개 작업 기록을 기다리는 중'} />
  </Box>
  const Agents = () => <Box flexDirection="column">
    <Section title="서브 에이전트" count={`${activeAgents.length}`} />
    {!activeAgents.length && <Empty text="작업 중인 서브 에이전트 없음" />}
    {activeAgents.map(row => <Row status={row.status} name={row.name} model={row.model} task={row.task} />)}
  </Box>
  const Background = () => <Box flexDirection="column">
    <Section title="백그라운드 작업" count={`${activeTasks.length}`} />
    {!activeTasks.length && <Empty text="조회된 실행 명령 없음" />}
    {activeTasks.map(row => <Box flexDirection="column">
      <Text color="success" wrap="truncate-end">{`● ${row.label}`}</Text>
      <Text dimColor wrap="truncate-end">{`  ${row.id.slice(0, 8)} · 시작 ${clock(row.startedAt)}`}</Text>
    </Box>)}
  </Box>
  const Skills = () => <Box flexDirection="column">
    <Section title="스킬" count={`${data.skills.length}`} />
    <Text dimColor wrap="truncate-end">이 세션에서 사용한 스킬 · 실행 중 여부와 구분</Text>
    {!data.skills.length && <Empty text="이 세션에서 사용한 스킬 없음" />}
    {data.skills.map(row => <Text color={ACCENT} wrap="truncate-end">{`● ${row.name}  ·  ×${row.count}`}</Text>)}
  </Box>
  const MCP = () => <Box flexDirection="column">
    <Section title="MCP 서버" count={`${connectedServers.length}`} />
    <Text dimColor wrap="truncate-end">현재 세션 · 사용 가능한 도구 서버와 호출 기록</Text>
    {!connectedServers.length && <Empty text="현재 확인된 서버 없음" />}
    {connectedServers.map(name => {
      const row = data.mcp.find(item => item.name === name)
      return <Text color="success" wrap="truncate-end">{`● ${name}${row ? `  ·  ×${row.count}` : ''}`}</Text>
    })}
  </Box>
  const body = <Box key="board-content" flexDirection="column" paddingX={2} flexShrink={0}>
    {tab === 0 && <Box flexDirection="column"><Main /><Agents /><Background /><Skills /><MCP /></Box>}
    {tab === 1 && <Box flexDirection="column"><Main /><Agents /></Box>}
    {tab === 2 && <Box flexDirection="column">
      <Section title="ACTIVITY" />
      <Text dimColor wrap="truncate-end">최근 도구 24개 · 인수·대화·비공개 추론 저장 안 함</Text>
      {!data.log?.length && <Empty text="아직 표시할 활동이 없습니다." />}
      {data.log?.map(row => <Text wrap="truncate-end" color={markFor(row.status).color}>{`${clock(row.at)}  ${row.owner === 'main' ? 'main' : row.owner.slice(0, 8)}  ${row.status}  ${row.tool}`}</Text>)}
      <Background />
    </Box>}
    {tab === 3 && <MCP />}
    {tab === 4 && <Box flexDirection="column">
      <Section title="PLUGINS" count={`${data.plugins?.length ?? 0}`} />
      <Text dimColor wrap="truncate-end">현재 엔진 로드 그룹의 모드 · 설치 목록과 구분</Text>
      {!data.plugins?.length && <Empty text="로드 정보 없음" />}
      {data.plugins?.map(name => <Text wrap="truncate-end" color="success">{`● ${name}`}</Text>)}
    </Box>}
    {tab === 5 && <Skills />}
  </Box>
  const top = <Box key="board-header" flexDirection="column" height={headerRows} paddingX={2} paddingTop={1} flexShrink={0}>
    <Box flexDirection="row" gap={2} height={7} flexShrink={0}>
      {columns >= 44 && <Box flexDirection="column" width={12} flexShrink={0}>
        {CLAUDE_MARK.map(line => <Text wrap="truncate-end" color="claude">{line}</Text>)}
      </Box>}
      <Box flexDirection="column" flexGrow={1} flexShrink={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text wrap="truncate-end" bold>Anthropic</Text>
          {columns >= 54 && <Text wrap="truncate-end" color={header?.stale ? 'warning' : header?.updatedAt ? 'success' : 'subtle'}>{header?.stale ? '● STALE' : header?.updatedAt ? '● LIVE' : '● WAIT'}</Text>}
        </Box>
        <Text dimColor wrap="truncate-end">CLAUDE / LOCAL MONITOR</Text>
        <Text color={ACCENT} wrap="truncate-end">{header?.model ?? data.main.model ?? '모델 미확인'}</Text>
        <Text dimColor wrap="truncate-end">Git  {header?.branch ?? '—'}</Text>
        {limits.length > 0 && <Box key="quota-windows" flexDirection="row" alignSelf="flex-start">
          {limits.map((row, index) => {
            const filled = Math.round(barWidth * row.remaining / 100)
            const color: Color = row.remaining <= 15 ? 'error' : row.remaining <= 40 ? 'warning' : 'success'
            return <Box key={`quota-${row.label}`} flexDirection="row" flexShrink={0}>
              <Box flexDirection="column" width={quotaWidth}>
                <Text wrap="truncate-end" color={color}>{`${row.label} ${Math.round(row.remaining * 10) / 10}% left`}</Text>
                <Text wrap="truncate-end" color={color}>{'━'.repeat(filled) + '─'.repeat(barWidth - filled)}</Text>
              </Box>
              {index < limits.length - 1 && <Box width={2} flexDirection="column" alignItems="center" flexShrink={0}>
                <Text dimColor wrap="truncate-end">│</Text><Text dimColor wrap="truncate-end">│</Text>
              </Box>}
            </Box>
          })}
        </Box>}
        {!limits.length && <Text wrap="truncate-end" dimColor>한도 미제공 / 조회 중</Text>}
        {!limits.length && <Text wrap="truncate-end" dimColor>읽기 전용 · 모델 호출 없음</Text>}
      </Box>
    </Box>
    <Text dimColor wrap="truncate-end">{summary(data)}</Text>
    <Text wrap="truncate-end"> </Text>
    <Box flexDirection="row" gap={1}>
      {tabNames.map((name, index) => Button ? <Button key={`tab-${index}`} plain hotkey={`${index + 1}`} label={columns >= 58 ? name : name.slice(0, 1)}
        dimColor={index !== tab} onPress={() => data.onTab?.(index)} /> :
        <Text wrap="truncate-end" color={index === tab ? ACCENT : 'subtle'}>{`${index + 1} ${name}`}</Text>)}
    </Box>
    <Text wrap="truncate-end" dimColor>{RULE.repeat(ruleWidth)}</Text>
  </Box>
  if (!pet) return <Box flexDirection="column" width={width}>{top}{body}</Box>
  const footerRows = pet.bodyRows >= 26 ? 10 : 2
  return <Box key="board-with-cat" position="relative" flexDirection="column" minHeight={Math.max(1, pet.bodyRows)} width={width}>
    <Box key="board-window" flexDirection="column" flexShrink={0}>
      <Box height={headerRows} flexShrink={0} />{body}
    </Box>
    <Box height={footerRows} flexShrink={0} />
    <Box key="fixed-header" position="absolute" top={pet.offset} left={0} width={width} height={headerRows} backgroundColor="#171d27">{top}</Box>
    <Box key="cat-footer" position="absolute" top={pet.offset + Math.max(0, pet.bodyRows - footerRows)} left={0} width={width} height={footerRows} backgroundColor="#171d27" flexDirection="column">
      {footerRows === 10 ? renderPet({ Box, Text }, pet.state, pet.tick, columns) :
        <Box key="family-cat-compact" flexDirection="column" height={2} paddingX={2} flexShrink={0}>
          <Text wrap="truncate-end" dimColor>{RULE.repeat(ruleWidth)}</Text>
          <Text wrap="truncate-end" dimColor>{String.raw`/\_/\ · ${CAT.states[pet.state].label}`}</Text>
        </Box>}
    </Box>
  </Box>
}
