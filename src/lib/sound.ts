import { store } from './store'

/*
 * Clicky mechanical switch, synthesized so there is no audio file to download.
 *
 * A real keystroke is a few distinct events a few milliseconds apart:
 *   press:   click-leaf snap (sharp, bright tick) → keycap bottoms out on the
 *            plate (short plastic resonance + low thud)
 *   release: softer upstroke click → keycap slaps back against the housing
 * Each is modelled as filtered noise transients plus a handful of decaying
 * resonant modes. Several variants are pre-rendered and picked at random so
 * repeated presses never sound identical.
 */

type Mode = [freq: number, decayMs: number, gain: number]

let ctx: AudioContext | null = null
let out: GainNode | null = null
let bank: { down: AudioBuffer[]; up: AudioBuffer[]; wideDown: AudioBuffer[]; wideUp: AudioBuffer[] } | null = null

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Decaying noise burst through a one-pole high-pass: the "tick" of a transient. */
function transient(buf: Float32Array, sr: number, atMs: number, amp: number, decayMs: number, hpHz: number) {
  const n0 = Math.floor((atMs / 1000) * sr)
  const len = Math.min(buf.length - n0, Math.floor((decayMs / 1000) * sr * 8))
  const rc = 1 / (2 * Math.PI * hpHz)
  const a = rc / (rc + 1 / sr)
  let prevX = 0
  let prevY = 0
  for (let i = 0; i < len; i++) {
    const x = (Math.random() * 2 - 1) * Math.exp(-i / ((decayMs / 1000) * sr))
    const y = a * (prevY + x - prevX)
    prevX = x
    prevY = y
    buf[n0 + i] += y * amp
  }
}

/** Sum of exponentially decaying sines: the ring of plastic and metal parts. */
function modes(buf: Float32Array, sr: number, atMs: number, amp: number, list: Mode[], sweep = 1) {
  const n0 = Math.floor((atMs / 1000) * sr)
  for (const [f, decayMs, gain] of list) {
    const len = Math.min(buf.length - n0, Math.floor((decayMs / 1000) * sr * 7))
    const tau = (decayMs / 1000) * sr
    const phase0 = Math.random() * Math.PI * 2
    let phase = phase0
    for (let i = 0; i < len; i++) {
      // Optional downward pitch sweep (used for the thud).
      const k = 1 - (1 - sweep) * Math.min(1, i / (tau * 2))
      phase += (2 * Math.PI * f * k) / sr
      const attack = 1 - Math.exp(-i / (sr * 0.00015))
      buf[n0 + i] += Math.sin(phase) * Math.exp(-i / tau) * attack * gain * amp
    }
  }
}

function render(sr: number, ms: number, draw: (b: Float32Array) => void) {
  const buf = new Float32Array(Math.floor((ms / 1000) * sr))
  draw(buf)
  let peak = 0
  for (const v of buf) peak = Math.max(peak, Math.abs(v))
  if (peak > 0) for (let i = 0; i < buf.length; i++) buf[i] *= 0.9 / peak
  const ab = ctx!.createBuffer(1, buf.length, sr)
  ab.copyToChannel(buf, 0)
  return ab
}

function pressSound(sr: number, wide: boolean) {
  const p = rand(0.95, 1.05) * (wide ? 0.8 : 1)
  const bottom = rand(9, 14)
  return render(sr, 90, (b) => {
    // Click leaf snapping: a bright double tick with a metallic ring.
    transient(b, sr, 0, 1, 0.4, 2800)
    transient(b, sr, rand(0.7, 1.1), 0.55, 0.3, 3200)
    modes(b, sr, 0, 0.55, [
      [rand(4000, 4400), 1.6, 0.6],
      [rand(5900, 6400), 1.0, 0.35],
    ])
    // Keycap bottoming out on the plate.
    transient(b, sr, bottom, 0.6, 1.1, 900)
    modes(b, sr, bottom, 1, [
      [1250 * p, 9, 0.5],
      [2050 * p, 6, 0.36],
      [2950 * p, 4, 0.24],
      [4300 * p, 2.4, 0.14],
    ])
    modes(b, sr, bottom, 0.9, [[165 * p, 13, 0.55]], 0.7)
    if (wide) {
      // Stabilizer wire landing a moment later: a lower, rattly echo.
      const s = bottom + rand(2.5, 4)
      transient(b, sr, s, 0.3, 0.8, 700)
      modes(b, sr, s, 0.5, [
        [900 * p, 7, 0.4],
        [1700 * p, 4, 0.25],
      ])
    }
  })
}

function releaseSound(sr: number, wide: boolean) {
  const p = rand(0.95, 1.06) * (wide ? 0.85 : 1)
  const top = rand(6, 9)
  return render(sr, 60, (b) => {
    // Upstroke click, softer than the press.
    transient(b, sr, 0, 0.5, 0.3, 3000)
    modes(b, sr, 0, 0.3, [[rand(4400, 4800), 1.2, 0.5]])
    // Keycap returning against the top housing.
    transient(b, sr, top, 0.3, 0.8, 1200)
    modes(b, sr, top, 0.55, [
      [1600 * p, 5, 0.4],
      [2700 * p, 3, 0.26],
    ])
  })
}

function audio() {
  if (!ctx) {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC({ latencyHint: 'interactive' })
    // Take the harsh edge off the very top end, like a real room would.
    const soften = ctx.createBiquadFilter()
    soften.type = 'lowpass'
    soften.frequency.value = 9000
    out = ctx.createGain()
    out.gain.value = 0.55
    out.connect(soften).connect(ctx.destination)
    const sr = ctx.sampleRate
    const many = (n: number, f: () => AudioBuffer) => Array.from({ length: n }, f)
    bank = {
      down: many(6, () => pressSound(sr, false)),
      up: many(6, () => releaseSound(sr, false)),
      wideDown: many(4, () => pressSound(sr, true)),
      wideUp: many(4, () => releaseSound(sr, true)),
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Play a keystroke. `down` is the press (click + bottom-out), otherwise the
 * release. `wide` keys (2u) sound lower and add stabilizer rattle.
 */
export function keySound(down = true, wide = false) {
  if (store.get().muted) return
  const ac = audio()
  if (!ac || !bank || !out) return
  const list = down ? (wide ? bank.wideDown : bank.down) : wide ? bank.wideUp : bank.up
  const src = ac.createBufferSource()
  src.buffer = list[Math.floor(Math.random() * list.length)]
  src.playbackRate.value = rand(0.97, 1.03)
  const g = ac.createGain()
  g.gain.value = down ? rand(0.85, 1) : rand(0.45, 0.6)
  src.connect(g).connect(out)
  src.start()
}

export function haptic() {
  navigator.vibrate?.(8)
}
