import { vi } from 'vitest'

// Radix UI uses ResizeObserver for some components (e.g., Select).
// JSDOM doesn't provide it by default.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).ResizeObserver = ResizeObserverMock
}

if (!('matchMedia' in window)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Radix Select uses pointer capture + scrollIntoView; JSDOM doesn't implement these.
if (!('hasPointerCapture' in Element.prototype)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Element.prototype as any).hasPointerCapture = () => false
}
if (!('setPointerCapture' in Element.prototype)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Element.prototype as any).setPointerCapture = () => {}
}
if (!('releasePointerCapture' in Element.prototype)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Element.prototype as any).releasePointerCapture = () => {}
}
if (!('scrollIntoView' in HTMLElement.prototype)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(HTMLElement.prototype as any).scrollIntoView = () => {}
}

// Some components might call alert; keep tests quiet.
vi.spyOn(window, 'alert').mockImplementation(() => {})

