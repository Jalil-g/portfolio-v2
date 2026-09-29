import { ExtrudeGeometry, Shape, Path, type BufferGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Keyboard dimensions, in keyboard units (1 = one key pitch). */
export const DIM = {
  gap: 0.1,
  capH: 0.42,
  /** How far each side of a keycap leans in from bottom to top. */
  taper: 0.07,
  /** Keycap bottom height above the tray while at rest. */
  capBase: 0.13,
  travel: 0.11,
  trayInset: 0.08,
  rim: 0.3,
  frameTop: 0.2,
  frameDepth: 0.46,
}

const capCache = new Map<string, BufferGeometry>()

/** Sculpted keycap: a rounded box whose walls lean inwards toward the top. */
export function keycapGeometry(w: number, d: number): BufferGeometry {
  const id = `${w}:${d}`
  const hit = capCache.get(id)
  if (hit) return hit

  const H = DIM.capH
  let geo: BufferGeometry = new RoundedBoxGeometry(w, H, d, 5, 0.11)
  geo.deleteAttribute('normal')
  geo.deleteAttribute('uv')
  geo = mergeVertices(geo)

  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + H / 2) / H
    const inset = DIM.taper * t
    pos.setX(i, pos.getX(i) * (1 - (2 * inset) / w))
    pos.setZ(i, pos.getZ(i) * (1 - (2 * inset) / d))
  }
  geo.computeVertexNormals()
  capCache.set(id, geo)
  return geo
}

function roundedRect<T extends Path>(target: T, w: number, d: number, r: number): T {
  const x = -w / 2
  const y = -d / 2
  target.moveTo(x + r, y)
  target.lineTo(x + w - r, y)
  target.quadraticCurveTo(x + w, y, x + w, y + r)
  target.lineTo(x + w, y + d - r)
  target.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  target.lineTo(x + r, y + d)
  target.quadraticCurveTo(x, y + d, x, y + d - r)
  target.lineTo(x, y + r)
  target.quadraticCurveTo(x, y, x + r, y)
  return target
}

/**
 * The machined case: a rounded ring with bevelled edges around the key well.
 * `w`/`d` are the size of the key area.
 */
export function frameGeometry(w: number, d: number): BufferGeometry {
  const inner = { w: w + DIM.trayInset * 2, d: d + DIM.trayInset * 2 }
  const outer = { w: inner.w + DIM.rim * 2, d: inner.d + DIM.rim * 2 }
  const shape = roundedRect(new Shape(), outer.w, outer.d, 0.34)
  shape.holes.push(roundedRect(new Path(), inner.w, inner.d, 0.14))
  const bevel = 0.06
  const geo = new ExtrudeGeometry(shape, {
    depth: DIM.frameDepth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 4,
    curveSegments: 10,
  })
  // Extruded along +z; stand it up so the top face is at y = frameTop.
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, DIM.frameTop - DIM.frameDepth + bevel, 0)
  return geo
}

export function trayGeometry(w: number, d: number): BufferGeometry {
  const tw = w + DIM.trayInset * 2 + 0.1
  const td = d + DIM.trayInset * 2 + 0.1
  const geo = new RoundedBoxGeometry(tw, 0.3, td, 2, 0.08)
  geo.translate(0, -0.15, 0)
  return geo
}
