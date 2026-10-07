import type { CSSProperties } from 'react'

/**
 * How a leader photo sits in its frame. The photo is zoomed in around the focus point (x, y in %
 * of the frame), which pulls a person who stands off to one side towards the middle. Zooming
 * around a point inside the frame never leaves empty edges.
 */
export interface PhotoFocus {
  x: number
  y: number
  zoom: number
}

export const CENTERED: PhotoFocus = { x: 50, y: 30, zoom: 1 }

export function photoStyle(f: PhotoFocus): CSSProperties {
  return {
    objectPosition: '50% 12%',
    transform: f.zoom > 1 ? `scale(${f.zoom})` : undefined,
    transformOrigin: `${f.x}% ${f.y}%`,
  }
}
