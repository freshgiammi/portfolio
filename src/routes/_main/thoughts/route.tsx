import { createFileRoute, Outlet } from "@tanstack/react-router"

import type { PageSeo } from "@/utils/seo"

// Same shape as the blog layout: a real segment, so a thought's permalink inherits "Thoughts" as
// its breadcrumb ancestor.
const SEO = {
  title: "Thoughts — freshgiammi",
  description: "Short-form notes, half-formed ideas, and things worth writing down.",
  emoji: "💭"
} satisfies PageSeo

export const Route = createFileRoute("/_main/thoughts")({
  staticData: { seo: SEO },
  component: () => <Outlet />
})
