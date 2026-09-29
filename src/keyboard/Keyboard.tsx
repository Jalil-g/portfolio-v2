import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshStandardMaterial, type Group, type Mesh } from 'three'
import { store, tap } from '../lib/store'
import { frameGeometry, trayGeometry } from './geometry'
import { Key } from './Key'
import { KEYS, LAYOUTS, type KeyId, type LayoutName } from './keys'
import { live } from './live'

const INTRO_TYPING: KeyId[] = ['j', 'a', 'l1', 'i', 'l2']

type Props = { layout: LayoutName; touch: boolean; reducedMotion: boolean }

export function Keyboard({ layout: name, touch, reducedMotion }: Props) {
  const layout = LAYOUTS[name]
  const group = useRef<Group>(null!)
  const frame = useRef<Mesh>(null!)
  const tray = useRef<Mesh>(null!)
  const built = useRef({ w: 0, d: 0 })
  const clock = useThree((s) => s.clock)
  const introAt = useMemo(() => clock.elapsedTime + 0.15, [clock])

  const frameMat = useMemo(
    () => new MeshStandardMaterial({ color: '#50555c', metalness: 0.85, roughness: 0.3 }),
    [],
  )
  const trayMat = useMemo(() => new MeshStandardMaterial({ color: '#070708', roughness: 0.9 }), [])
  // Drop keys in reading order: back row first, left to right.
  const order = useMemo(() => {
    const slots = LAYOUTS[name].slots
    const sorted = [...KEYS].sort((a, b) => slots[a.id].y - slots[b.id].y || slots[a.id].x - slots[b.id].x)
    return Object.fromEntries(sorted.map((k, i) => [k.id, i])) as Record<KeyId, number>
    // Only the first layout decides the intro order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once mounted (font loaded), tell the UI and type the name as a hello.
  useEffect(() => {
    live.w = layout.cols
    live.d = layout.rows
    store.set({ ready: true })
    const start = reducedMotion ? 300 : 1100
    const timers = INTRO_TYPING.map((id, i) =>
      window.setTimeout(() => {
        tap(id, 110)
        store.set({ typed: 'jalil'.slice(0, i + 1), typedAt: performance.now() })
      }, start + i * 150),
    )
    timers.push(window.setTimeout(() => store.set({ typed: '' }), start + 5 * 150 + 1800))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, dt) => {
    // Grow or shrink the case with the layout.
    const k = 1 - Math.exp(-dt * 7)
    live.w += (layout.cols - live.w) * k
    live.d += (layout.rows - live.d) * k
    if (Math.abs(live.w - layout.cols) < 0.002) live.w = layout.cols
    if (Math.abs(live.d - layout.rows) < 0.002) live.d = layout.rows
    const b = built.current
    if (Math.abs(b.w - live.w) > 0.004 || Math.abs(b.d - live.d) > 0.004) {
      frame.current.geometry.dispose()
      frame.current.geometry = frameGeometry(live.w, live.d)
      tray.current.geometry.dispose()
      tray.current.geometry = trayGeometry(live.w, live.d)
      b.w = live.w
      b.d = live.d
    }

    // Gentle float, and lean toward the cursor on desktop.
    const g = group.current
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    const px = touch ? 0 : state.pointer.x
    const py = touch ? 0 : state.pointer.y
    const e = 1 - Math.exp(-dt * 3)
    g.rotation.y += (px * 0.08 - g.rotation.y) * e
    g.rotation.x += (-py * 0.05 - g.rotation.x) * e
    g.position.y = Math.sin(t * 0.9) * 0.035
  })

  return (
    <group ref={group}>
      <mesh ref={frame} material={frameMat} castShadow receiveShadow />
      <mesh ref={tray} material={trayMat} receiveShadow />
      {KEYS.map((def) => (
        <Key
          key={def.id}
          def={def}
          slot={layout.slots[def.id]}
          cols={layout.cols}
          rows={layout.rows}
          order={order[def.id]}
          introAt={introAt}
          showCorners={!touch}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  )
}
