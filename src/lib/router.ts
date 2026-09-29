import { useSyncExternalStore } from 'react'

export type Path = '/' | '/projects' | '/about'

const known: Path[] = ['/', '/projects', '/about']

function current(): Path {
  const p = window.location.pathname.replace(/\/+$/, '') || '/'
  return (known as string[]).includes(p) ? (p as Path) : '/'
}

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb)
  return () => window.removeEventListener('popstate', cb)
}

export function usePath(): Path {
  return useSyncExternalStore(subscribe, current)
}

export function navigate(to: Path) {
  if (to === current()) return
  // Remember that this entry was opened from inside the app, so "back" can pop it.
  window.history.pushState({ inApp: true }, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Close a panel: pop history when we pushed it, otherwise replace with home. */
export function goHome() {
  if (window.history.state?.inApp) {
    window.history.back()
  } else {
    window.history.replaceState(null, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}
