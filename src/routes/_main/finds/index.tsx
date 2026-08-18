import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Page } from "@/components/primitives/page"
import { Tab } from "@/components/primitives/tab"
import { Typography } from "@/components/primitives/typography"
import { FINDS, findsByTag } from "@/data/finds"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"

import { FindsMasonry } from "./-components/finds-masonry"
import { FindsRail } from "./-components/finds-rail"
import styles from "./index.module.scss"

const SEO = {
  title: "Finds — freshgiammi",
  description:
    "Things I've stumbled across online and liked enough to keep around. Tools, apps, design, that kind of thing.",
  emoji: "🧭"
} satisfies PageSeo

/** The two ways the same links are laid out: all of them at once, or sorted into rails. */
const VIEWS = [
  { value: "grid", label: "All at once", icon: <Icon.SquaresFourIcon size={16} /> },
  { value: "sections", label: "By section", icon: <Icon.RowsIcon size={16} /> }
] as const

const DEFAULT_VIEW = "grid"

type View = (typeof VIEWS)[number]["value"]

export const Route = createFileRoute("/_main/finds/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/finds" }),
  component: FindsPage
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function FindsPage() {
  const [view, setView] = useState<View>(DEFAULT_VIEW)

  return (
    <Tab.Root className={styles.Page} value={view} onValueChange={setView}>
      <Page.Header
        emoji={SEO.emoji}
        title={pageTitleFromSeo(SEO.title)}
        subtitle={SEO.description}
        trailing={
          FINDS.length > 0 ? (
            <Tab.List label="Layout">
              {VIEWS.map(({ value, label, icon }) => (
                <Tab.Item key={value} value={value} icon={icon}>
                  {label}
                </Tab.Item>
              ))}
              <Tab.Indicator />
            </Tab.List>
          ) : undefined
        }
      />

      {FINDS.length === 0 && (
        <Page.Content>
          <Typography size="x-small" weight="regular">
            Nothing saved yet. Check back soon!
          </Typography>
        </Page.Content>
      )}

      <Tab.Panel value="grid">
        <FindsMasonry />
      </Tab.Panel>
      <Tab.Panel value="sections" className={styles.Panel}>
        <FindsSections />
      </Tab.Panel>
    </Tab.Root>
  )
}

/** A rail per tag, so grouping does the job a label on each card would otherwise have to. */
function FindsSections() {
  return findsByTag().map(({ tag, label, finds }) => (
    <section key={tag} className={styles.Section}>
      <Typography size="xxx-small" family="mono" weight="regular" className={styles.Section__label}>
        {label}
      </Typography>

      <FindsRail finds={finds} />
    </section>
  ))
}
