import type { FileRoutesByTo } from "@/routeTree.gen"

type ShowcaseTo = Extract<keyof FileRoutesByTo, `/showcase/${string}`>

export type Showcase = {
  id: string
  to: ShowcaseTo
  title: string
  subtitle: string
  description: string
  tags: Array<string>
}

export const SHOWCASES: Array<Showcase> = [
  {
    id: "polaroid-stack",
    to: "/showcase/polaroid-stack",
    title: "Polaroid Stack",
    subtitle: "A draggable stack of photos with lightbox support.",
    description:
      "A tactile card stack where the top photo can be dragged away and cycled to the back, with keyboard support and an integrated gallery overlay.",
    tags: ["motion", "gesture", "accessibility", "component-design"]
  }
]
