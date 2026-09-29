import { mailto, profile } from '../data/profile'

export type KeyId =
  | 'github'
  | 'linkedin'
  | 'resume'
  | 'heart'
  | 'j'
  | 'a'
  | 'l1'
  | 'i'
  | 'l2'
  | 'projects'
  | 'about'
  | 'hire'

export type IconName = 'github' | 'heart' | 'enter' | 'arrow'

export type KeyAction =
  | { type: 'route'; to: '/projects' | '/about' }
  | { type: 'link'; href: string }
  | { type: 'mail'; href: string }
  | { type: 'heart' }
  | { type: 'letter'; char: string }

export type KeyDef = {
  id: KeyId
  label?: string
  icon?: IconName
  /** Small legend in the top-left corner: the physical key that triggers it. */
  corner?: string
  color: string
  ink: string
  action: KeyAction
  /** Values of KeyboardEvent.key (lowercased) that press this key. */
  hotkeys: string[]
  /** Accessible name, also shown on the display while hovering. */
  hint: string
}

const LETTER = { color: '#f4f2ee', ink: '#7c6cf0' }

export const KEYS: KeyDef[] = [
  {
    id: 'github',
    icon: 'github',
    corner: 'G',
    color: '#232327',
    ink: '#ffffff',
    action: { type: 'link', href: profile.github },
    hotkeys: ['g'],
    hint: 'GitHub ↗ github.com/Jalil-g',
  },
  {
    id: 'linkedin',
    label: 'in',
    corner: 'N',
    color: '#0a66c2',
    ink: '#ffffff',
    action: { type: 'link', href: profile.linkedin },
    hotkeys: ['n'],
    hint: 'LinkedIn ↗ in/jljalil',
  },
  {
    id: 'resume',
    label: 'Resume',
    icon: 'arrow',
    corner: 'R',
    color: '#2f7a66',
    ink: '#ffffff',
    action: { type: 'link', href: profile.resume },
    hotkeys: ['r'],
    hint: 'Resume ↗ open the PDF',
  },
  {
    id: 'heart',
    icon: 'heart',
    corner: 'H',
    color: '#240404',
    ink: '#ffffff',
    action: { type: 'heart' },
    hotkeys: ['h'],
    hint: 'Send some love',
  },
  { id: 'j', label: 'J', ...LETTER, action: { type: 'letter', char: 'j' }, hotkeys: ['j'], hint: 'J' },
  { id: 'a', label: 'A', ...LETTER, action: { type: 'letter', char: 'a' }, hotkeys: ['a'], hint: 'A' },
  { id: 'l1', label: 'L', ...LETTER, action: { type: 'letter', char: 'l' }, hotkeys: ['l'], hint: 'L' },
  { id: 'i', label: 'I', ...LETTER, action: { type: 'letter', char: 'i' }, hotkeys: ['i'], hint: 'I' },
  { id: 'l2', label: 'L', ...LETTER, action: { type: 'letter', char: 'l' }, hotkeys: ['l'], hint: 'L' },
  {
    id: 'projects',
    label: 'Projects',
    corner: 'P',
    color: '#f2b705',
    ink: '#ffffff',
    action: { type: 'route', to: '/projects' },
    hotkeys: ['p'],
    hint: 'Projects: things I have built',
  },
  {
    id: 'about',
    label: 'About',
    corner: '?',
    color: '#8b7cf6',
    ink: '#ffffff',
    action: { type: 'route', to: '/about' },
    hotkeys: ['?', '/'],
    hint: 'About: experience & skills',
  },
  {
    id: 'hire',
    label: 'Hire Me',
    icon: 'enter',
    color: '#f2701b',
    ink: '#ffffff',
    action: { type: 'mail', href: mailto },
    hotkeys: ['enter'],
    hint: `Hire me ✉ ${profile.email}`,
  },
]

export const KEY_BY_ID = Object.fromEntries(KEYS.map((k) => [k.id, k])) as Record<KeyId, KeyDef>

export type Slot = { x: number; y: number; w: number; h: number }
export type LayoutName = 'wide' | 'tall'
export type Layout = { cols: number; rows: number; slots: Record<KeyId, Slot> }

const s = (x: number, y: number, w = 1, h = 1): Slot => ({ x, y, w, h })

export const LAYOUTS: Record<LayoutName, Layout> = {
  // Desktop / landscape: 5 × 3
  //  [gh ][in ][ Resume ][ ♥ ]
  //  [ J ][ A ][ L ][ I ][ L ]
  //  [ Projects ][Abt][ Hire ↵ ]
  wide: {
    cols: 5,
    rows: 3,
    slots: {
      github: s(0, 0),
      linkedin: s(1, 0),
      resume: s(2, 0, 2),
      heart: s(4, 0),
      j: s(0, 1),
      a: s(1, 1),
      l1: s(2, 1),
      i: s(3, 1),
      l2: s(4, 1),
      projects: s(0, 2, 2),
      about: s(2, 2),
      hire: s(3, 2, 2),
    },
  },
  // Phones / portrait: 3 × 5
  //  [ J ][ A ][ L ]
  //  [ I ][ L ][ ♥ ]
  //  [ Projects ][Abt]
  //  [gh ][ Resume ]
  //  [in ][ Hire ↵ ]
  tall: {
    cols: 3,
    rows: 5,
    slots: {
      j: s(0, 0),
      a: s(1, 0),
      l1: s(2, 0),
      i: s(0, 1),
      l2: s(1, 1),
      heart: s(2, 1),
      projects: s(0, 2, 2),
      about: s(2, 2),
      github: s(0, 3),
      resume: s(1, 3, 2),
      linkedin: s(0, 4),
      hire: s(1, 4, 2),
    },
  },
}

export function pickLayout(width: number, height: number): LayoutName {
  return width < 620 || width / height < 0.9 ? 'tall' : 'wide'
}

/** Resolve a physical key press to a keycap. The two L keys take turns. */
let lastL: KeyId = 'l2'
export function keyForHotkey(key: string): KeyId | null {
  const k = key.toLowerCase()
  if (k === 'l') {
    lastL = lastL === 'l1' ? 'l2' : 'l1'
    return lastL
  }
  return KEYS.find((d) => d.hotkeys.includes(k))?.id ?? null
}
