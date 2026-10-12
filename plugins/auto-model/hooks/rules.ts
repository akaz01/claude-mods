import type { Choice, Decision, Rule, Tier } from '../types'

// Portable Claude aliases; the installed CLI resolves the models available to each account.
export const MODEL_BY_TIER: Record<Tier, string> = {
  haiku: 'haiku',
  sonnet: 'sonnet',
  opus: 'opus',
}

// Checked top to bottom: when a prompt matches several, the larger model wins.
export const RULES: readonly Rule[] = [
  { tier: 'opus', label: '복잡한 설계', pattern: /설계|아키텍처|architecture|system design/i },
  { tier: 'opus', label: '여러 파일 연결 분석', pattern: /여러 파일|파일들? (간|사이)|연결된|의존성 분석|코드베이스 (전체|분석)|전체 구조/i },
  { tier: 'sonnet', label: '코드 수정', pattern: /수정|고쳐|버그|구현|추가해|리팩터|\b(fix|bug|implement|refactor)\b/i },
  { tier: 'sonnet', label: '문서 작성', pattern: /문서 ?(작성|화)|README|가이드 (작성|써)|\bdocs?\b/i },
  { tier: 'haiku', label: '파일명 정리', pattern: /파일 ?명|파일 이름|이름 (정리|바꿔)|\brename\b/i },
  { tier: 'haiku', label: '단순 분류', pattern: /분류|\bclassify\b|\bcategori[sz]e\b/i },
  { tier: 'haiku', label: '짧은 요약', pattern: /요약|\bsummar(y|ize|ise)\b|\btl;?dr\b/i },
]

export const MAX_LOG = 20
const PREVIEW = 24

export const classify = (text: string): Choice | undefined => {
  const rule = RULES.find(one => one.pattern.test(text))
  if (!rule) return undefined
  const word = text.match(rule.pattern)?.[0] ?? ''
  return { tier: rule.tier, reason: `"${word}" → ${rule.label}` }
}

export const preview = (text: string): string => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > PREVIEW ? `${flat.slice(0, PREVIEW)}…` : flat
}

export const isAnsweredBy = (tier: Tier, answered: string): boolean => answered.includes(tier)

export const statusLine = (d: Decision): string => {
  if (!d.tier) return `자동 모델 · 세션 모델 유지 · ${d.reason}`
  const check = d.error
    ? `✗ ${d.error}`
    : d.answeredBy
      ? `${isAnsweredBy(d.tier, d.answeredBy) ? '✓' : '⚠ 다른 모델'} ${d.answeredBy}`
      : '응답 대기'
  return `자동 모델 · ${d.tier} · 이유: ${d.reason} · 검증 ${check}`
}

const time = (at: number): string => {
  const d = new Date(at)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const logLine = (d: Decision): string => {
  const tier = (d.tier ?? '(유지)').padEnd(7)
  const check = d.error
    ? `✗ 오류: ${d.error}`
    : d.answeredBy
      ? `답한 모델 ${d.tier && !isAnsweredBy(d.tier, d.answeredBy) ? '⚠' : '✓'} ${d.answeredBy}`
      : ''
  return `  ${time(d.at)}  ${tier} "${d.prompt}"  ${d.reason}  ${check}`.trimEnd()
}

export const statusReport = (isEnabled: boolean, pinned: string | null, log: readonly Decision[]): string => {
  const head = [
    `자동 선택: ${isEnabled ? '켜짐' : '꺼짐'}`,
    pinned ? `수동 우선: /model로 ${pinned} 선택됨 → 이 세션은 자동 선택 중지` : '수동 우선: 없음 (/model 쓰면 이 세션은 자동 중지)',
  ]
  const body = log.length === 0 ? ['  아직 판단 기록 없음'] : log.map(logLine)
  return [...head, '최근 판단', ...body].join('\n')
}
