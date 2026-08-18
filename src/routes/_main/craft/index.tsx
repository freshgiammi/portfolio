import { createFileRoute, Link } from "@tanstack/react-router"

import { Icon } from "@/components/primitives/icons"
import { Page } from "@/components/primitives/page"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import { SHOWCASES } from "@/data/showcases"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"

import { CardPreview } from "./-components/card-preview"
import styles from "./index.module.scss"

const SEO = {
  title: "Craft — freshgiammi",
  description: "Interface bits I built to see if I could, then wrote up so you can play with them too.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft" }),
  component: CraftPage
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function CraftPage() {
  return (
    <Page.Root gap="2xl">
      <Page.Header emoji={SEO.emoji} title={pageTitleFromSeo(SEO.title)} subtitle={SEO.description} />

      {SHOWCASES.length === 0 ? (
        <Page.Content>
          <Typography size="x-small" weight="regular">
            Nothing on display yet. The bench is busy.
          </Typography>
        </Page.Content>
      ) : (
        <Page.Content>
          <div className={styles.Grid}>
            {SHOWCASES.map(showcase => (
              <Link key={showcase.id} to={showcase.to} className={styles.Card}>
                <CardPreview id={showcase.id} />
                <div className={styles.Card__body}>
                  <Typography size="small" weight="semibold" className={styles.Card__title}>
                    {showcase.title}
                  </Typography>
                  <Typography size="xx-small" weight="regular" className={styles.Card__description}>
                    {showcase.subtitle}
                  </Typography>
                  <div className={styles.Card__tags}>
                    {showcase.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
                <Icon.ArrowRightIcon size={14} className={styles.Card__arrow} />
              </Link>
            ))}
          </div>
        </Page.Content>
      )}
    </Page.Root>
  )
}
