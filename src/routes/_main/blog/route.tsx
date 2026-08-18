import { createFileRoute, Outlet } from "@tanstack/react-router"

import type { PageSeo } from "@/utils/seo"

// Real layout, not pathless: the post detail route (`/blog/$slug`) nests under here as an actual
// child, so the breadcrumb picks up "Blog" as its ancestor from the router's own match chain
// instead of needing a hand-maintained virtual-parent table.
const SEO = {
  title: "Blog — freshgiammi",
  description: "Writeups of whatever I've been building and figuring out lately.",
  emoji: "✍️"
} satisfies PageSeo

export const Route = createFileRoute("/_main/blog")({
  staticData: { seo: SEO },
  component: () => <Outlet />
})
