import { useEffect, useRef, useState, type ReactNode } from 'react'
import { goHome } from '../lib/router'
import { Icon } from './Icon'
import { Keycap } from './Keycap'

type Props = { id: string; open: boolean; title: string; children: ReactNode }

/** Full-screen panel that slides over the keyboard. Esc is handled globally. */
export function Sheet({ id, open, title, children }: Props) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Two frames so the enter transition starts from the hidden state.
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    const t = window.setTimeout(() => setMounted(false), 380)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!shown) return
    scroller.current?.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [shown])

  if (!mounted) return null

  return (
    <div className="sheet" data-shown={shown} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
      <div className="sheet-scroll" ref={scroller}>
        <div className="sheet-inner">
          <div className="sheet-bar">
            <Keycap size="sm" color="#1c1c20" ink="#ececec" onClick={goHome} aria-label="Back to the keyboard">
              <Icon name="back" size={15} />
              <span className="kc-label">esc</span>
            </Keycap>
            <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
              {title}
            </h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
