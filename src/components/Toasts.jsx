import { useEffect, useState } from 'react'
import { subscribe } from '../lib/toast.js'

export default function Toasts() {
  const [items, setItems] = useState([])

  useEffect(
    () =>
      subscribe((t) => {
        setItems((cur) => [...cur, t])
        setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 2800)
      }),
    [],
  )

  if (!items.length) return null

  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          {t.kind === 'ok' ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 5 5L19.5 8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
