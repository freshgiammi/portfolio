import { type OGImage, previewUrl } from "../../config/vite-plugins/link-previews/previewUrl.ts"

/**
 * The tags a find may carry, each with the heading its section gets on the finds page. Declaration
 * order is section order, and the type is derived from these keys rather than written beside them —
 * a tag that has no home on the page is one nothing can be tagged with.
 */
export const FIND_TAGS = {
  library: "Libraries",
  tool: "Tools",
  app: "Apps",
  design: "Design",
  website: "Websites",
  article: "Articles",
  inspiration: "Inspiration"
} as const satisfies Record<string, string>

export type FindTag = keyof typeof FIND_TAGS

export type Find = {
  id: string
  title: string
  description: string
  url: string
  tag: FindTag
  /**
   * The preview to show: `previewUrl(url)` for the page's own `og:image`, resolved at build time —
   * see `config/vite-plugins/link-previews`. A plain string in its place overrides it, for a page
   * whose own `og:image` is wrong or missing. Absent for neither, which the card renders as its
   * placeholder.
   */
  image?: OGImage
}

// Newest first: add new finds at the top, so declaration order is display order with nothing to reverse at read time.
export const FINDS: Array<Find> = [
  {
    id: "learn-inference",
    title: "Learn Inference",
    description:
      "An interactive guide to serving generative models in production, complete with interactive simulators for complex inference engineering concepts.",
    url: "https://learn-inference.com/",
    tag: "inspiration",
    image: previewUrl("https://learn-inference.com/")
  },
  {
    id: "footer-design",
    title: "Footer Design",
    description: "A curated gallery of the top website footer inspiration on earth.",
    url: "https://www.footer.design/",
    tag: "inspiration",
    image: previewUrl("https://www.footer.design/")
  },
  {
    id: "design-system",
    title: "You Don't Have a Design System",
    description:
      "Matt Rothenberg on why a shared component library isn't a system until the decisions behind it, not just its parts, get written down and carried forward.",
    url: "https://mattrothenberg.com/notes/you-dont-have-a-design-system/",
    tag: "article",
    // The page sits behind a Cloudflare bot challenge, so the build-time og:image fetch gets a 403; overridden with the known static asset instead.
    image: "https://mattrothenberg.com/og/you-dont-have-a-design-system.png"
  },
  {
    id: "bounded-cognition",
    title: "Engineering for Bounded Cognition",
    description:
      "An argument that most of what counts as good engineering, naming, testing, drawing boundaries, is really just offloading what a mind can only hold four things of at once.",
    url: "https://shapeofthesystem.com/posts/2026/02/03/bounded-cognition",
    tag: "article",
    image: previewUrl("https://shapeofthesystem.com/posts/2026/02/03/bounded-cognition")
  },
  {
    id: "delphi-tools",
    title: "Delphi Tools",
    description:
      "Small single-purpose browser tools that run entirely on your machine: no login, no upload, no data leaving the tab.",
    url: "https://delphi.tools",
    tag: "tool",
    image: previewUrl("https://delphi.tools")
  },
  {
    id: "apossible",
    title: "APOSSIBLE",
    description:
      "A non-profit research and design initiative building technology around care, inquisitiveness and self-control instead of engagement.",
    url: "https://apossible.com/",
    tag: "inspiration",
    image: previewUrl("https://apossible.com/")
  },
  {
    id: "visual-rambling",
    title: "Visual Rambling",
    description: "Ideas worked out in motion rather than prose: interactive explanations you scrub through to follow.",
    url: "https://visualrambling.space",
    tag: "inspiration",
    image: previewUrl("https://visualrambling.space")
  },
  {
    id: "depo",
    title: "Depo",
    description:
      "A curated shelf of tools, resources and references, collected for the next project rather than this one.",
    url: "https://www.depo.zip",
    tag: "inspiration",
    image: previewUrl("https://www.depo.zip")
  },
  {
    id: "capa",
    title: "Capa",
    description:
      "Generates 35mm contact sheets from a roll of scans, the way you would have got them back from the lab.",
    url: "https://www.capa.cx",
    tag: "tool",
    image: previewUrl("https://www.capa.cx")
  },
  {
    id: "tooooools",
    title: "Tooooools",
    description:
      "Dithering, halftone, gradients and patterns applied to images and video in the browser, for making things look deliberately lo-fi.",
    url: "https://www.tooooools.app",
    tag: "tool",
    image: previewUrl("https://www.tooooools.app")
  },
  {
    id: "developing-taste",
    title: "Developing Taste",
    description:
      "Emil Kowalski on why taste is the thing separating competent interfaces from good ones, and how to actually build it.",
    url: "https://emilkowal.ski/ui/developing-taste",
    tag: "article",
    image: previewUrl("https://emilkowal.ski/ui/developing-taste")
  }
]

/** The bare host a find points at, which is what stands in for a source everywhere it is shown. */
export function findHost(find: Find): string {
  return find.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] ?? find.url
}

/**
 * The finds grouped into the sections the page renders, in `FIND_TAGS` order. A tag nothing carries
 * is left out entirely rather than heading an empty section.
 */
export function findsByTag(): Array<{ tag: FindTag; label: string; finds: Array<Find> }> {
  return Object.entries(FIND_TAGS).flatMap(([tag, label]) => {
    const finds = FINDS.filter(find => find.tag === tag)
    return finds.length > 0 ? [{ tag: tag as FindTag, label, finds }] : []
  })
}

/**
 * The `count` most recent finds, for a teaser that doesn't need the whole page. `FINDS` is already
 * declared newest first, so this is the first `count` entries — deterministic, unlike a random draw,
 * so the same list renders whether this runs on the server or (on a client-side navigation) again on
 * the client, with nothing to disagree with what already reached the screen.
 */
export function latestFinds(count: number): Array<Find> {
  return FINDS.slice(0, count)
}
