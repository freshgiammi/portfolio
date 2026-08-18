import { createFileRoute, Outlet } from "@tanstack/react-router"

import type { PageSeo } from "@/utils/seo"

// Real layout, not pathless: the pieces (`/craft/$id`) nest under here as actual children, so the
// breadcrumb picks up "Craft" as their ancestor from the router's own match chain instead of
// needing a hand-maintained virtual-parent table.
const SEO = {
  title: "Craft — freshgiammi",
  description: "Interface bits I built to see if I could, then wrote up so you can play with them too.",
  emoji: "🛠️"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft")({
  staticData: { seo: SEO },
  component: () => <Outlet />
})
