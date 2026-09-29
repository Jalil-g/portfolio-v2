import { ShapeGeometry, type BufferGeometry } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { ICON_PATHS } from './iconPaths'
import type { IconName } from './keys'

const cache = new Map<IconName, BufferGeometry>()

/**
 * Flat icon geometry, 1 unit across, centered, lying in the XZ plane facing up
 * so it can sit on a keycap's top face.
 */
export function iconGeometry(name: IconName): BufferGeometry {
  const hit = cache.get(name)
  if (hit) return hit
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${ICON_PATHS[name]}"/></svg>`
  const { paths } = new SVGLoader().parse(svg)
  const shapes = paths.flatMap((p) => p.toShapes())
  const geo = new ShapeGeometry(shapes, 8)
  geo.computeBoundingBox()
  const box = geo.boundingBox!
  const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y)
  geo.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, 0)
  geo.scale(1 / size, 1 / size, 1)
  // SVG y points down; laying the shape flat maps SVG "up" to -z (away from the viewer).
  geo.rotateX(Math.PI / 2)
  cache.set(name, geo)
  return geo
}
