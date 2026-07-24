import { uid } from './storage.js'

// Toast minimalista sem dependências: emissor de eventos em nível de módulo.
const listeners = new Set()

export function toast(message, kind = 'ok') {
  for (const listener of listeners) listener({ id: uid(), message, kind })
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
