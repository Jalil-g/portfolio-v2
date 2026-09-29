import { useEffect, useState, type CSSProperties } from 'react'
import { profile } from '../data/profile'
import { KEY_BY_ID } from '../keyboard/keys'
import { setMuted, useStore } from '../lib/store'
import { Icon } from './Icon'
import { Keycap } from './Keycap'

export function Header() {
  const muted = useStore((s) => s.muted)
  return (
    <header className="hud-header">
      <div className="brand">
        <h1>{profile.name}</h1>
        <p>
          {profile.tagline}
          <span className="dot" aria-hidden>
            ·
          </span>
          <span className="nowrap">{profile.current}</span>
        </p>
      </div>
      <Keycap
        size="sm"
        color="#1c1c20"
        ink="#e8e8e8"
        onClick={() => setMuted(!muted)}
        aria-label={muted ? 'Turn key sounds on' : 'Turn key sounds off'}
        aria-pressed={!muted}
        title={muted ? 'Sound off' : 'Sound on'}
      >
        <Icon name={muted ? 'soundOff' : 'soundOn'} size={17} />
      </Keycap>
    </header>
  )
}

const TYPED_FOR = 2600

/** The little OLED strip under the keyboard. */
export function Display({ touch }: { touch: boolean }) {
  const hovered = useStore((s) => s.hovered)
  const typed = useStore((s) => s.typed)
  const typedAt = useStore((s) => s.typedAt)
  const ready = useStore((s) => s.ready)
  const [, rerender] = useState(0)

  const typing = typed.length > 0 && performance.now() - typedAt < TYPED_FOR
  useEffect(() => {
    if (!typing) return
    const id = window.setTimeout(() => rerender((n) => n + 1), TYPED_FOR - (performance.now() - typedAt) + 16)
    return () => clearTimeout(id)
  }, [typing, typedAt])

  let text: string
  let mode = 'idle'
  if (!ready) {
    text = 'booting keyboard…'
  } else if (typing) {
    text = typed
    mode = 'typing'
  } else if (hovered && KEY_BY_ID[hovered].action.type !== 'letter') {
    text = KEY_BY_ID[hovered].hint
    mode = 'hint'
  } else if (hovered) {
    text = 'type my name: J A L I L'
  } else {
    text = touch ? 'tap a key' : 'click a key, or type on your keyboard'
  }

  return (
    <div className="hud-display" data-mode={mode}>
      <div className="oled">
        <span className="prompt" aria-hidden>
          &gt;
        </span>
        <span className="oled-text">{text}</span>
        <span className="caret" aria-hidden />
      </div>
    </div>
  )
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          {toast.text}
        </div>
      )}
    </div>
  )
}

type Heart = { id: number; left: number; size: number; dur: number; drift: number; hue: number; delay: number }

export function Hearts({ reducedMotion }: { reducedMotion: boolean }) {
  const bursts = useStore((s) => s.hearts)
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    if (bursts === 0) return
    const count = reducedMotion ? 5 : 16
    const born = Array.from({ length: count }, (_, i) => ({
      id: bursts * 100 + i,
      left: 8 + Math.random() * 84,
      size: 18 + Math.random() * 26,
      dur: 3.2 + Math.random() * 2.2,
      drift: (Math.random() - 0.5) * 120,
      hue: [0, 350, 14, 330][i % 4],
      delay: Math.random() * 0.5,
    }))
    setHearts((h) => [...h, ...born])
    const id = window.setTimeout(() => setHearts((h) => h.filter((x) => !born.includes(x))), 6200)
    return () => clearTimeout(id)
  }, [bursts, reducedMotion])

  return (
    <div className="hearts" aria-hidden>
      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 24 24"
          className="heart"
          style={
            {
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              animationDuration: `${h.dur}s`,
              animationDelay: `${h.delay}s`,
              '--drift': `${h.drift}px`,
              color: `hsl(${h.hue} 95% 60%)`,
            } as CSSProperties
          }
        >
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      ))}
    </div>
  )
}
