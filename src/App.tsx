import { lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { profile } from './data/profile'
import { trigger } from './keyboard/actions'
import { KEYS, keyForHotkey, LAYOUTS, pickLayout, type KeyId } from './keyboard/keys'
import { goHome, navigate, usePath, type Path } from './lib/router'
import { setPressed, store } from './lib/store'
import { keySound } from './lib/sound'
import { About } from './ui/About'
import { FlatKeyboard } from './ui/FlatKeyboard'
import { Display, Header, Hearts, Toast } from './ui/Hud'
import { Projects } from './ui/Projects'
import { Sheet } from './ui/Sheet'

const Scene = lazy(() => import('./keyboard/Scene'))

const TITLES: Record<Path, string> = {
  '/': `${profile.name}: ${profile.tagline}`,
  '/projects': `Projects · ${profile.name}`,
  '/about': `About · ${profile.name}`,
}

export default function App() {
  const path = usePath()
  const { width, height } = useViewport()
  const layout = pickLayout(width, height)
  const touch = useMedia('(hover: none)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const webgl = useMemo(() => hasWebGL(), [])
  const sheetOpen = path !== '/'

  // Stop rendering the 3D scene while a panel covers it.
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!sheetOpen) return setPaused(false)
    const t = window.setTimeout(() => setPaused(true), 450)
    return () => clearTimeout(t)
  }, [sheetOpen])

  useEffect(() => {
    document.title = TITLES[path]
    if (sheetOpen) store.set({ hovered: null })
  }, [path, sheetOpen])

  usePhysicalKeyboard(sheetOpen)

  return (
    <>
      <main className="stage" inert={sheetOpen}>
        <div className="stage-canvas">
          {webgl ? (
            <Suspense fallback={null}>
              <Scene layout={layout} touch={touch} reducedMotion={reducedMotion} paused={paused} />
            </Suspense>
          ) : (
            <FlatKeyboard layout={layout} />
          )}
        </div>
        <Header />
        <Display touch={touch} />
        {webgl && <KeyNav />}
      </main>
      <Hearts reducedMotion={reducedMotion} />
      <Toast />
      <Sheet id="projects" open={path === '/projects'} title="Projects">
        <Projects />
      </Sheet>
      <Sheet id="about" open={path === '/about'} title="About">
        <About />
      </Sheet>
    </>
  )
}

/**
 * Screen-reader and Tab-key access to the 3D keys. Focusing a link lights up
 * its keycap, so sighted keyboard users can see where they are.
 */
function KeyNav() {
  const focus = (id: KeyId | null) => () => store.set({ hovered: id })
  return (
    <nav className="sr-only" aria-label="Main">
      <ul>
        {KEYS.filter((k) => k.action.type !== 'letter').map((k) => {
          const a = k.action
          const common = { onFocus: focus(k.id), onBlur: focus(null) }
          if (a.type === 'route')
            return (
              <li key={k.id}>
                <a
                  href={a.to}
                  {...common}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(a.to)
                  }}
                >
                  {k.hint}
                </a>
              </li>
            )
          if (a.type === 'link' || a.type === 'mail')
            return (
              <li key={k.id}>
                <a href={a.href} {...common} {...(a.type === 'link' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {k.hint}
                </a>
              </li>
            )
          return (
            <li key={k.id}>
              <button type="button" {...common} onClick={() => trigger(k.id)}>
                {k.hint}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** 2u keys sound lower and have stabilizers; sizes match in every layout. */
const isWide = (id: KeyId) => LAYOUTS.wide.slots[id].w > 1

/** Type on a real keyboard and the matching keycaps go down. */
function usePhysicalKeyboard(sheetOpen: boolean) {
  useEffect(() => {
    const held = new Map<string, KeyId>()

    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement
      if (el.closest?.('input, textarea, select, [contenteditable="true"]')) return
      if (sheetOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          goHome()
        }
        return
      }
      // Let Enter activate whatever control has focus.
      if (e.key === 'Enter' && el.closest?.('a, button')) return
      if (e.repeat) {
        if (held.has(e.code)) e.preventDefault()
        return
      }
      const id = keyForHotkey(e.key)
      if (!id) return
      e.preventDefault()
      held.set(e.code, id)
      setPressed(id, true)
      keySound(true, isWide(id))
      trigger(id)
    }

    const up = (e: KeyboardEvent) => {
      const id = held.get(e.code)
      if (!id) return
      held.delete(e.code)
      setPressed(id, false)
      keySound(false, isWide(id))
    }

    const releaseAll = () => {
      held.forEach((id) => setPressed(id, false))
      held.clear()
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', releaseAll)
      releaseAll()
    }
  }, [sheetOpen])
}

function subscribeResize(cb: () => void) {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}

let viewport = { width: window.innerWidth, height: window.innerHeight }
function readViewport() {
  if (viewport.width !== window.innerWidth || viewport.height !== window.innerHeight) {
    viewport = { width: window.innerWidth, height: window.innerHeight }
  }
  return viewport
}

function useViewport() {
  return useSyncExternalStore(subscribeResize, readViewport)
}

function useMedia(query: string) {
  const mql = useMemo(() => window.matchMedia(query), [query])
  return useSyncExternalStore(
    (cb) => {
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => mql.matches,
  )
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
