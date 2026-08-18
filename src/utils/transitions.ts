/**
 * Tokens live behind `[data-theme]`, and plenty of elements transition colour, so swapping the
 * attribute would otherwise cross-fade the whole page one property at a time.
 *
 * `0ms` rather than `none`, on purpose: a zero-length transition still completes and still fires
 * `transitionend`, which Base UI waits on to finish closing a popup. Removing the property outright
 * means that event never arrives, and a menu open during the swap can be left stuck mid-animation.
 */
const SUPPRESS_TRANSITIONS = `[data-theme], [data-theme] * { transition: 0ms !important; }`

/** Suppressed for exactly one painted frame: long enough to cover the swap, short enough to be invisible. */
export function withoutTransitions(swap: () => void) {
  const style = document.createElement("style")
  style.textContent = SUPPRESS_TRANSITIONS
  document.head.appendChild(style)

  swap()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => style.remove())
  })
}
