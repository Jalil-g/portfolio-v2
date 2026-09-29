import { navigate } from '../lib/router'
import { store, toast } from '../lib/store'
import { KEY_BY_ID, type KeyId } from './keys'

const NAME = 'jalil'

function typeLetter(char: string) {
  const typed = (store.get().typed + char).slice(-12)
  store.set({ typed, typedAt: performance.now() })
  if (typed.endsWith(NAME)) {
    store.set((s) => ({ hearts: s.hearts + 1 }))
    toast('Hey, that’s me 👋')
  }
}

/**
 * Run a key's action. Must be called synchronously from the pointer or keyboard
 * event so that opening a new tab counts as a user gesture (no popup blocking).
 */
export function trigger(id: KeyId) {
  const { action } = KEY_BY_ID[id]
  switch (action.type) {
    case 'letter':
      typeLetter(action.char)
      break
    case 'heart':
      store.set((s) => ({ hearts: s.hearts + 1 }))
      toast('Thanks for stopping by ♥')
      break
    case 'link':
      window.open(action.href, '_blank', 'noopener,noreferrer')
      break
    case 'mail':
      window.location.href = action.href
      toast('Opening your mail app…')
      break
    case 'route':
      // Let the keycap finish its travel before the panel slides in.
      window.setTimeout(() => navigate(action.to), 170)
      break
  }
}
