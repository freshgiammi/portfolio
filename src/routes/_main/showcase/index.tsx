import { createFileRoute, Link } from "@tanstack/react-router"

import { List } from "@/components/ui/list"
import { Tag } from "@/components/ui/tag"
import { Typography } from "@/components/ui/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { SHOWCASES } from "./-data/showcases"
import styles from "./index.module.scss"

const SEO = {
  title: "Showcase — freshgiammi",
  description: "Components, interactions, and small pieces of interface built for their own sake.",
  emoji: "🧩"
} satisfies PageSeo

export const Route = createFileRoute("/_main/showcase/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/showcase" }),
  component: ShowcasePage
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ShowcasePage() {
  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Typography size="x-large" family="serif">
          🧩 Showcase
        </Typography>
        <Typography size="xx-small" weight="regular" className={styles.Header__subtitle}>
          {SEO.description}
        </Typography>
      </header>

      {SHOWCASES.length === 0 ? (
        <Typography size="x-small" weight="regular" className={styles.Empty}>
          Nothing on display yet. The bench is busy.
        </Typography>
      ) : (
        <List.Root className={styles.Showcases}>
          {SHOWCASES.map(showcase => (
            <List.Item
              key={showcase.id}
              interactive
              render={<Link to={showcase.to} />}
              title={showcase.title}
              description={showcase.subtitle}>
              <Tag.List tags={showcase.tags} className={styles.Showcases__tags} />
            </List.Item>
          ))}
        </List.Root>
      )}
    </div>
  )
}
