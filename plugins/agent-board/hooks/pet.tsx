import type { BoxProps, ElementConstructor, TextProps } from 'claude-code'
import { CAT } from './cat-sprites'
import type { PetActivity } from '../types'

export type PetState = keyof typeof CAT.states
export const emptyPet = (): PetActivity => ({ tick: 0, calls: [], inFlight: [], waiting: [], doneAt: 0, errorAt: 0 })
export const petState = (pet: PetActivity, working: number, now: number, background = 0): PetState => {
  if (pet.waiting.length) return 'waiting'
  if (pet.errorAt > 0 && now - pet.errorAt < 8000) return 'error'
  if (working > 0 || pet.inFlight.length > 0) {
    if (working >= 3 || pet.calls.filter(at => now - at < 10000).length >= 4) return 'busy'
    return pet.inFlight.length > 0 || background > 0 ? 'working' : 'watching'
  }
  if (pet.doneAt > 0 && now - pet.doneAt < 8000) return 'done'
  return 'idle'
}

type Pixel = keyof typeof CAT.palette
export const catCells = (state: PetState, elapsedMs: number, width: number) => {
  const animation = CAT.states[state]
  const frame = animation.frames[Math.floor(elapsedMs / animation.periodMs) % animation.frames.length]
  const crop = Math.max(0, Math.floor((CAT.width - width) / 2))
  const rows: { glyph: string; foreground: string | undefined; background: string | undefined }[][] = []
  for (let y = 0; y < CAT.height; y += 2) {
    const row = []
    for (let x = crop; x < Math.min(CAT.width, crop + Math.max(0, width)); x++) {
      const top = frame[y][x] as Pixel, bottom = frame[y + 1][x] as Pixel
      const foreground = CAT.palette[top === '.' ? bottom : top] ?? undefined
      row.push({ glyph: top === bottom ? top === '.' ? ' ' : '█' : top === '.' ? '▄' : '▀',
        foreground, background: top !== bottom && top !== '.' ? CAT.palette[bottom] ?? undefined : undefined })
    }
    rows.push(row)
  }
  return rows
}

export const renderPet = ({ Box, Text }: { Box: ElementConstructor<BoxProps>; Text: ElementConstructor<TextProps> },
  state: PetState, tick: number, columns: number) => (
  <Box key="family-cat" flexDirection="column" flexShrink={0} height={10} paddingX={1}>
    <Text dimColor wrap="truncate-end">{'─'.repeat(Math.max(1, columns - 2))}</Text>
    <Text wrap="truncate-end"> </Text>
    <Box flexDirection="column" alignItems="center">
      {catCells(state, tick * 250, Math.max(1, columns - 2)).map((row, y) => (
        <Text key={`cat-row-${y}`} wrap="truncate-end">{row.map((cell, x) => (
          <Text key={`pixel-${x}`} color={cell.foreground} backgroundColor={cell.background}>{cell.glyph}</Text>
        ))}</Text>
      ))}
      <Text key="cat-status" color={state === 'error' ? 'error' : state === 'waiting' ? 'warning' : state === 'done' ? 'success' : 'subtle'} wrap="truncate-end">{CAT.states[state].label}</Text>
    </Box>
  </Box>
)
