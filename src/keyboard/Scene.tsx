import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { NeutralToneMapping, Vector3, type OrthographicCamera } from 'three'
import { DIM } from './geometry'
import { Keyboard } from './Keyboard'
import { live } from './live'
import type { LayoutName } from './keys'

type Props = {
  layout: LayoutName
  touch: boolean
  reducedMotion: boolean
  paused: boolean
}

export default function Scene({ layout, touch, reducedMotion, paused }: Props) {
  return (
    <Canvas
      orthographic
      shadows="percentage"
      dpr={[1, 2]}
      frameloop={paused ? 'never' : 'always'}
      camera={{ position: [10, 12, 10], zoom: 80, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping
      }}
      aria-hidden
    >
      <Rig layout={layout} />
      <Lights />
      <Suspense fallback={null}>
        <Keyboard layout={layout} touch={touch} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}

// Camera angle per layout: classic isometric on wide screens, steeper and more
// head-on for the tall phone layout so keys stay big enough to tap.
const VIEW: Record<LayoutName, { az: number; el: number }> = {
  wide: { az: Math.PI / 4, el: 0.74 },
  tall: { az: 0.36, el: 0.95 },
}

const v = new Vector3()
const right = new Vector3()
const up = new Vector3()

/** Frames the keyboard between the header and the display on any screen size. */
function Rig({ layout }: { layout: LayoutName }) {
  const angle = useRef({ ...VIEW[layout] })

  useFrame((state, dt) => {
    const cam = state.camera as OrthographicCamera
    const { width, height } = state.size
    const a = angle.current
    const k = 1 - Math.exp(-dt * 5)
    a.az += (VIEW[layout].az - a.az) * k
    a.el += (VIEW[layout].el - a.el) * k

    const R = 40
    cam.position.set(Math.sin(a.az) * Math.cos(a.el) * R, Math.sin(a.el) * R, Math.cos(a.az) * Math.cos(a.el) * R)
    cam.lookAt(0, 0, 0)
    cam.updateMatrixWorld()

    // Bounds of the case in view space.
    const hx = live.w / 2 + DIM.trayInset + DIM.rim
    const hz = live.d / 2 + DIM.trayInset + DIM.rim
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const x of [-hx, hx])
      for (const z of [-hz, hz])
        for (const y of [-0.3, DIM.capBase + DIM.capH + 0.1]) {
          v.set(x, y, z).applyMatrix4(cam.matrixWorldInverse)
          minX = Math.min(minX, v.x)
          maxX = Math.max(maxX, v.x)
          minY = Math.min(minY, v.y)
          maxY = Math.max(maxY, v.y)
        }

    const compact = height < 520
    const pad = {
      t: compact ? 64 : width < 700 ? 118 : 120,
      b: compact ? 70 : width < 700 ? 132 : 140,
      l: width < 700 ? 18 : 48,
      r: width < 700 ? 18 : 48,
    }
    const availW = Math.max(100, width - pad.l - pad.r)
    const availH = Math.max(100, height - pad.t - pad.b)
    const zoom = Math.min(availW / (maxX - minX), availH / (maxY - minY), 150)

    // Center the case inside the padded area rather than the whole canvas.
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const dx = pad.l + availW / 2 - width / 2
    const dy = pad.t + availH / 2 - height / 2
    right.setFromMatrixColumn(cam.matrixWorld, 0)
    up.setFromMatrixColumn(cam.matrixWorld, 1)
    cam.position.addScaledVector(right, cx - dx / zoom).addScaledVector(up, cy + dy / zoom)

    if (cam.zoom !== zoom) {
      cam.zoom = zoom
      cam.updateProjectionMatrix()
    }
  }, -1)

  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-4, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[6, 4, -2]} intensity={0.35} color="#ffd9b8" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-8, 3, 4]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[8, 2, -2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="rect" color="#ff9a55" intensity={0.5} position={[3, 1, 8]} rotation-y={Math.PI} scale={[6, 1, 1]} />
      </Environment>
    </>
  )
}
