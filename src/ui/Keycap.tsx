import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { haptic, keySound } from '../lib/sound'

type Common = {
  color?: string
  ink?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

type AsButton = Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>
type AsLink = Common & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>

/** An HTML keycap that matches the 3D keys, for buttons and links in the UI. */
export function Keycap(props: AsButton | AsLink) {
  const { color = '#f4f2ee', ink = '#16161a', size = 'md', children, className = '', style: extra, ...rest } = props
  const style = { '--kc': color, '--kc-ink': ink, ...extra } as CSSProperties
  const cls = `kc kc-${size} ${className}`
  const down = () => {
    keySound(true)
    haptic()
  }
  const up = () => keySound(false)
  const inner = <span className="kc-top">{children}</span>

  if ('href' in rest && rest.href !== undefined) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a {...a} className={cls} style={style} onPointerDown={down} onPointerUp={up}>
        {inner}
      </a>
    )
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" {...b} className={cls} style={style} onPointerDown={down} onPointerUp={up}>
      {inner}
    </button>
  )
}
