import { useEffect, type CSSProperties } from 'react'
import { trigger } from '../keyboard/actions'
import { KEYS, LAYOUTS, type KeyDef, type LayoutName } from '../keyboard/keys'
import { store, useStore } from '../lib/store'
import { Icon } from './Icon'
import { Keycap } from './Keycap'

/** Plain HTML keyboard for browsers without WebGL. Same keys, same layouts. */
export function FlatKeyboard({ layout }: { layout: LayoutName }) {
  const { cols, rows, slots } = LAYOUTS[layout]
  const pressed = useStore((s) => s.pressed)

  useEffect(() => store.set({ ready: true }), [])

  return (
    <div className="flat-kb" style={{ '--cols': cols, '--rows': rows } as CSSProperties}>
      {KEYS.map((k) => {
        const s = slots[k.id]
        return (
          <Keycap
            key={k.id}
            color={k.color}
            ink={k.ink}
            className={pressed[k.id] ? 'is-down' : ''}
            style={{ gridColumn: `${s.x + 1} / span ${s.w}`, gridRow: `${s.y + 1} / span ${s.h}` }}
            aria-label={k.hint}
            onMouseEnter={() => store.set({ hovered: k.id })}
            onMouseLeave={() => store.set({ hovered: null })}
            onClick={() => trigger(k.id)}
          >
            <Legend k={k} />
          </Keycap>
        )
      })}
    </div>
  )
}

function Legend({ k }: { k: KeyDef }) {
  if (k.id === 'github') return <Icon name="github" size={26} />
  if (k.id === 'heart') return <Icon name="heart" size={24} />
  if (k.id === 'hire')
    return (
      <>
        {k.label} <Icon name="enter" size={18} />
      </>
    )
  return <span className={k.label?.length === 1 ? 'flat-letter' : ''}>{k.label}</span>
}
