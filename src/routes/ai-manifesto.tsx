import { createFileRoute, Link } from "@tanstack/react-router"

import { Mdx } from "@/components/blog/mdx"
import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import Manifesto from "@/content/ai-manifesto.mdx"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./ai-manifesto.module.scss"

const SEO = {
  title: "AI Manifesto — freshgiammi",
  description: "My rules for working with AI: where it helps, where it doesn't, and where it's not allowed.",
  emoji: "🤖"
} satisfies PageSeo

export const Route = createFileRoute("/ai-manifesto")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/ai-manifesto" }),
  component: AiManifesto
})

function AiManifesto() {
  return (
    <div className={styles.Page}>
      <header className={styles.Hero}>
        <Typography size="xx-small" render={<Link to="/" />} className={styles.BackLink}>
          <Icon.ArrowLeftIcon size={12} />
          Back to site
        </Typography>
        <Typography size="x-large" family="serif">
          {SEO.emoji} AI Manifesto
        </Typography>
        <Typography size="xx-small" weight="regular" className={styles.Hero__subtitle}>
          {SEO.description}
        </Typography>
      </header>

      <Mdx component={Manifesto} />
    </div>
  )
}
