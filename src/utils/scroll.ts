/**
 * `"smooth"` unless the reader has asked for reduced motion, in which case any of this site's own
 * `scrollTo`/`scrollIntoView`/`scrollBy` calls should just jump — an explicit JS `behavior` always
 * overrides CSS `scroll-behavior`, so `@media (prefers-reduced-motion: reduce)` alone can't stop an
 * explicit "smooth" the way it stops one left to inherit from CSS.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
}
