import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Group,
  type PointLight,
} from 'three'
import { setPressed, store } from '../lib/store'
import { haptic, keySound } from '../lib/sound'
import { trigger } from './actions'
import { DIM, keycapGeometry } from './geometry'
import { iconGeometry } from './icons'
import type { IconName, KeyDef, Slot } from './keys'

export const FONT = '/fonts/inter-latin-700-normal.woff'
export const GLYPHS = 'JALIProjectsResumeAboutHirMein?GNRH'

const noRaycast = () => null

type Props = {
  def: KeyDef
  slot: Slot
  cols: number
  rows: number
  /** Order in the intro drop. */
  order: number
  introAt: number
  showCorners: boolean
  reducedMotion: boolean
}

export function Key({ def, slot, cols, rows, order, introAt, showCorners, reducedMotion }: Props) {
  const root = useRef<Group>(null!)
  const cap = useRef<Group>(null!)
  const light = useRef<PointLight>(null)
  const isHeart = def.id === 'heart'

  const target = { x: slot.x + slot.w / 2 - cols / 2, z: slot.y + slot.h / 2 - rows / 2 }
  // Animation state lives in a ref so re-renders never reset it.
  const anim = useRef({
    x: target.x,
    z: target.z,
    fromX: target.x,
    fromZ: target.z,
    toX: target.x,
    toZ: target.z,
    moveStart: -1,
    dropY: reducedMotion ? 0 : 5,
    dropV: 0,
    press: 0,
    flash: 0,
  })

  const geo = keycapGeometry(slot.w - DIM.gap, slot.h - DIM.gap)
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: def.color,
      roughness: def.ink === '#7c6cf0' ? 0.55 : 0.42,
      metalness: 0,
    })
    if (isHeart) {
      // Dark smoked cap lit from below, like an RGB key.
      m.emissive = new Color('#ff1d0e')
      m.emissiveIntensity = 0.2
      m.roughness = 0.22
      m.metalness = 0.15
    }
    return m
  }, [def.color, def.ink, isHeart])

  const glow = useMemo(() => (isHeart ? glowMaterial() : new MeshBasicMaterial()), [isHeart])

  useFrame((state, dt) => {
    const a = anim.current
    const t = state.clock.elapsedTime
    const s = store.get()

    // Layout change: glide to the new slot along a small hop.
    if (a.toX !== target.x || a.toZ !== target.z) {
      a.fromX = a.x
      a.fromZ = a.z
      a.toX = target.x
      a.toZ = target.z
      a.moveStart = t + order * 0.025
    }
    let hop = 0
    if (a.moveStart >= 0) {
      const p = Math.min(1, Math.max(0, (t - a.moveStart) / 0.55))
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      a.x = a.fromX + (a.toX - a.fromX) * e
      a.z = a.fromZ + (a.toZ - a.fromZ) * e
      hop = Math.sin(p * Math.PI) * 0.9
      if (p >= 1) a.moveStart = -1
    }

    // Intro: fall in with a little bounce, one key after another.
    const started = t >= introAt + order * 0.05
    root.current.visible = started || reducedMotion
    if (started && !reducedMotion) {
      const step = Math.min(dt, 1 / 30)
      a.dropV += (-a.dropY * 190 - a.dropV * 13) * step
      a.dropY += a.dropV * step
    }

    root.current.position.set(a.x, hop + a.dropY, a.z)

    const down = !!s.pressed[def.id]
    const hover = s.hovered === def.id
    const goal = down ? -DIM.travel : hover ? 0.035 : 0
    a.press += (goal - a.press) * (1 - Math.exp(-dt * (down ? 45 : 20)))
    cap.current.position.y = DIM.capBase + DIM.capH / 2 + a.press

    if (isHeart) {
      a.flash = down ? 1 : Math.max(0, a.flash - dt * 1.5)
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4)
      material.emissiveIntensity = 0.12 + pulse * 0.16 + a.flash * 0.7
      if (light.current) light.current.intensity = 2.2 + pulse * 1.6 + a.flash * 3
      glow.opacity = 0.75 + pulse * 0.25 + a.flash * 0.3
    }
  })

  const handlers = {
    onPointerOver(e: ThreeEvent<PointerEvent>) {
      e.stopPropagation()
      store.set({ hovered: def.id })
      document.body.style.cursor = 'pointer'
    },
    onPointerOut() {
      if (store.get().hovered === def.id) store.set({ hovered: null })
      setPressed(def.id, false)
      document.body.style.cursor = ''
    },
    onPointerDown(e: ThreeEvent<PointerEvent>) {
      e.stopPropagation()
      setPressed(def.id, true)
      keySound(true, slot.w > 1)
      haptic()
    },
    onPointerUp() {
      if (!store.get().pressed[def.id]) return
      setPressed(def.id, false)
      keySound(false, slot.w > 1)
    },
    onClick(e: ThreeEvent<MouseEvent>) {
      e.stopPropagation()
      trigger(def.id)
    },
  }

  return (
    <group ref={root}>
      {/* Switch housing peeking out between the caps. */}
      <mesh position={[0, 0.07, 0]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.52, 0.14, 0.52]} />
        <meshStandardMaterial color={isHeart ? '#2a0606' : '#161618'} roughness={0.7} />
      </mesh>
      {isHeart && (
        <>
          <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2} material={glow} raycast={noRaycast}>
            <planeGeometry args={[2.6, 2.6]} />
          </mesh>
          <pointLight ref={light} position={[0, 0.95, 0]} color="#ff3b1f" distance={3.2} decay={1.6} />
        </>
      )}
      <group ref={cap}>
        <mesh geometry={geo} material={material} castShadow receiveShadow {...handlers} />
        <Legend def={def} w={slot.w - DIM.gap} d={slot.h - DIM.gap} showCorners={showCorners} />
      </group>
    </group>
  )
}

function Legend({ def, w, d, showCorners }: { def: KeyDef; w: number; d: number; showCorners: boolean }) {
  const y = DIM.capH / 2 + 0.004
  const tw = w - DIM.taper * 2
  const td = d - DIM.taper * 2
  const wide = w > 1.2
  const letter = def.label?.length === 1

  const text = (content: string, size: number, x = 0, z = 0, opacity = 1) => (
    <Text
      font={FONT}
      characters={GLYPHS}
      fontSize={size}
      color={def.ink}
      fillOpacity={opacity}
      anchorX="center"
      anchorY="middle"
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      letterSpacing={letter ? 0 : 0.01}
      raycast={noRaycast}
    >
      {content}
    </Text>
  )

  let main: ReactNode = null
  if (def.id === 'linkedin') main = text('in', 0.36, 0, 0.01)
  else if (letter) main = text(def.label!, 0.28)
  else if (def.id === 'hire') {
    main = (
      <>
        {text(def.label!, 0.19, -0.12)}
        <Icon name="enter" size={0.2} x={0.5} y={y} color={def.ink} />
      </>
    )
  } else if (def.label) main = text(def.label, wide ? 0.19 : 0.165)

  return (
    <group>
      {main}
      {def.icon && def.id !== 'hire' && def.id !== 'resume' && (
        <Icon name={def.icon} size={def.id === 'heart' ? 0.36 : 0.4} y={y} color={def.ink} bright={def.id === 'heart'} />
      )}
      {def.id === 'resume' && <Icon name="arrow" size={0.13} x={tw / 2 - 0.13} z={-td / 2 + 0.13} y={y} color={def.ink} opacity={0.7} />}
      {showCorners && def.corner && (
        <Text
          font={FONT}
          characters={GLYPHS}
          fontSize={0.1}
          color={def.ink}
          fillOpacity={0.55}
          anchorX="left"
          anchorY="top"
          position={[-tw / 2 + 0.09, y, -td / 2 + 0.08]}
          rotation-x={-Math.PI / 2}
          raycast={noRaycast}
        >
          {def.corner}
        </Text>
      )}
    </group>
  )
}

function Icon({
  name,
  size,
  x = 0,
  y,
  z = 0,
  color,
  opacity = 1,
  bright = false,
}: {
  name: IconName
  size: number
  x?: number
  y: number
  z?: number
  color: string
  opacity?: number
  bright?: boolean
}) {
  return (
    <mesh geometry={iconGeometry(name)} position={[x, y, z]} scale={size} raycast={noRaycast}>
      <meshBasicMaterial
        color={color}
        side={DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
        toneMapped={!bright}
      />
    </mesh>
  )
}

let glowTexture: CanvasTexture | null = null
function glowMaterial() {
  if (!glowTexture) {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,70,40,1)')
    grad.addColorStop(0.25, 'rgba(255,40,20,0.55)')
    grad.addColorStop(0.6, 'rgba(200,20,10,0.12)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    glowTexture = new CanvasTexture(c)
  }
  return new MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
}
