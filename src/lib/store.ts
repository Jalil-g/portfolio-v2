import { useSyncExternalStore } from 'react'
import type { KeyId } from '../keyboard/keys'

export type AppState = {
  /** Key under the pointer (or focused via Tab). */
  hovered: KeyId | null
  /** Keys currently held down, by pointer or physical keyboard. */
  pressed: Partial<Record<KeyId, boolean>>
  /** Letters typed on the name keys. */
  typed: string
  typedAt: number
  toast: { id: number; text: string } | null
  /** Incremented to launch a burst of hearts. */
  hearts: number
  /** The 3D scene has loaded its font and dropped the keys in. */
  ready: boolean
  muted: boolean
}

function readMuted() {
  try {
    return localStorage.getItem('muted') === '1'
  } catch {
    return false
  }
}

let state: AppState = {
  hovered: null,
  pressed: {},
  typed: '',
  typedAt: 0,
  toast: null,
  hearts: 0,
  ready: false,
  muted: readMuted(),
}

const listeners = new Set<() => void>()

export const store = {
  get: () => state,
  set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
    const next = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...next }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useStore<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(state))
}

export function setPressed(id: KeyId, down: boolean) {
  if (!!state.pressed[id] === down) return
  store.set((s) => ({ pressed: { ...s.pressed, [id]: down } }))
}

/** Briefly press a key, for presses that do not come from a held pointer or key. */
export function tap(id: KeyId, ms = 140) {
  setPressed(id, true)
  window.setTimeout(() => setPressed(id, false), ms)
}

let toastId = 0
let toastTimer: number | undefined
export function toast(text: string, ms = 2600) {
  store.set({ toast: { id: ++toastId, text } })
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => store.set({ toast: null }), ms)
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem('muted', muted ? '1' : '0')
  } catch {
    /* storage unavailable: keep it in memory only */
  }
  store.set({ muted })
}
