import type { FileRoutesByTo } from "@/routeTree.gen"

type ShowcaseTo = Extract<keyof FileRoutesByTo, `/craft/${string}`>

/**
 * Up to four, and a compile error at five: a card's tag row wraps past that, and a set of tags stops
 * being scannable at a glance long before it stops fitting.
 */
type UpToFour<T> = [] | [T] | [T, T] | [T, T, T] | [T, T, T, T]

export type Showcase = {
  id: string
  to: ShowcaseTo
  title: string
  subtitle: string
  tags: UpToFour<string>
}

export const SHOWCASES: Array<Showcase> = [
  {
    id: "polaroid-stack",
    to: "/craft/polaroid-stack",
    title: "Polaroid Stack",
    subtitle: "A draggable stack of photos with lightbox support.",
    tags: ["motion", "gesture", "accessibility", "component-design"]
  },
  {
    id: "particles",
    to: "/craft/particles",
    title: "Particles",
    subtitle: "The feedback that makes a tap feel like it landed, split from the things that tap.",
    tags: ["css-animation", "micro-interaction", "component-design", "performance"]
  },
  {
    id: "confetti",
    to: "/craft/confetti",
    title: "Confetti",
    subtitle: "The reward for finishing something, kept apart from whatever earned it.",
    tags: ["css-animation", "micro-interaction", "component-design"]
  },
  {
    id: "skeleton",
    to: "/craft/skeleton",
    title: "Skeleton",
    subtitle: "A loading state that covers the real component instead of standing in for it.",
    tags: ["css", "loading-states", "component-design", "accessibility"]
  },
  {
    id: "scrollable",
    to: "/craft/scrollable",
    title: "Scrollable",
    subtitle: "A scroll box that fades into whatever's behind it and can open already scrolled to the right spot.",
    tags: ["css", "component-design", "accessibility"]
  }
]
