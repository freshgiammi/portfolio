import { createFileRoute } from "@tanstack/react-router"

import { Page } from "@/components/primitives/page"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"

import { WorkAccordion } from "./-components/work-accordion"

const SEO = {
  title: "Work — freshgiammi",
  description: "The places I've worked at and the stuff I got to build at each one.",
  emoji: "💼"
} satisfies PageSeo

export const Route = createFileRoute("/_main/work/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/work" }),
  component: WorkPage
})

function WorkPage() {
  return (
    <Page.Root width="narrow">
      <Page.Header emoji={SEO.emoji} title={pageTitleFromSeo(SEO.title)} subtitle={SEO.description} />

      <Page.Content>
        <WorkAccordion />
      </Page.Content>
    </Page.Root>
  )
}
