import { Link } from "@tanstack/react-router"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

type ShowcaseTemplateProps = {
  title: string
  subtitle: string
  overview: string
  demo: React.ReactNode
  buildNotes: Array<string>
  techniques: Array<string>
  githubUrl?: string
}

export function ShowcaseTemplate({ title, subtitle, overview, demo, buildNotes, techniques, githubUrl }: ShowcaseTemplateProps) {
  return (
    <article className={styles.Showcase}>
      <header className={styles.Showcase__header}>
        <div className={styles.Showcase__topRow}>
          <Typography size="xx-small" className={styles.Showcase__backLink} render={<Link to="/showcase" />}>
            ← Back to showcase
          </Typography>
          {githubUrl && (
            <Typography
              size="xx-small"
              className={styles.Showcase__githubLink}
              render={<a href={githubUrl} target="_blank" rel="noopener noreferrer" />}>
              <Icon.GithubLogoIcon size={14} />
              <span>Open code on GitHub</span>
            </Typography>
          )}
        </div>
        <Typography size="x-large" family="serif">
          {title}
        </Typography>
        <Typography size="x-small" weight="regular" className={styles.Showcase__subtitle}>
          {subtitle}
        </Typography>
      </header>

      <section className={styles.Showcase__demo} aria-label={`${title} demo`}>
        <div className={styles.Showcase__demoInner}>{demo}</div>
      </section>

      <section className={styles.Showcase__overview}>
        <Typography size="small" family="serif">
          Overview
        </Typography>
        <Typography size="x-small" weight="regular" className={styles.Showcase__copy}>
          {overview}
        </Typography>
      </section>

      <section className={styles.Showcase__details}>
        <section className={styles.Showcase__detail}>
          <Typography size="small" family="serif">
            How it&apos;s built
          </Typography>
          <ul className={styles.Showcase__list}>
            {buildNotes.map(item => (
              <li key={item} className={styles.Showcase__listItem}>
                <Typography size="xx-small" weight="regular">
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.Showcase__detail}>
          <Typography size="small" family="serif">
            Techniques used
          </Typography>
          <ul className={styles.Showcase__list}>
            {techniques.map(item => (
              <li key={item} className={styles.Showcase__listItem}>
                <Typography size="xx-small" weight="regular">
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </article>
  )
}

export declare namespace ShowcaseTemplate {
  export type Props = ShowcaseTemplateProps
}
