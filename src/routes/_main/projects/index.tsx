import { createFileRoute, Link } from "@tanstack/react-router"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./index.module.scss"

const SEO = {
  title: "Projects — freshgiammi",
  description: "Things I have built, shipped, or broken along the way.",
  emoji: "🛠️"
} satisfies PageSeo

export const Route = createFileRoute("/_main/projects/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/projects" }),
  component: ProjectsPage
})

type ProjectLink = {
  label: string
  href: string
}

type Project = {
  id: string
  name: string
  period: string
  description: string
  stack: Array<string>
  links: Array<ProjectLink>
  /** Slug of the post that goes into detail, linked separately from the external links. */
  writeUp?: string
}

const PROJECTS: Array<Project> = []

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ProjectsPage() {
  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Typography size="x-large" family="serif">
          🛠️ Projects
        </Typography>
        <Typography size="xx-small" weight="regular" className={styles.Header__subtitle}>
          {SEO.description}
        </Typography>
      </header>

      {PROJECTS.length === 0 ? (
        <Typography size="x-small" weight="regular" className={styles.Empty}>
          Nothing here yet. I’m not lazy: I just practice iterative development so hard that all my projects stay in
          eternal beta.
        </Typography>
      ) : (
        <div className={styles.List}>
          {PROJECTS.map(project => (
            <article key={project.id} className={styles.Project}>
              <div className={styles.Project__heading}>
                <Typography size="medium" weight="semibold">
                  {project.name}
                </Typography>
                <Typography size="xxx-small" family="mono" className={styles.Project__period}>
                  {project.period}
                </Typography>
              </div>

              <Typography size="x-small" weight="regular" className={styles.Project__description}>
                {project.description}
              </Typography>

              <div className={styles.Project__meta}>
                {project.stack.length > 0 && (
                  <div className={styles.Project__stack}>
                    {project.stack.map(tech => (
                      <Typography key={tech} size="xxx-small" family="mono" className={styles.Tag}>
                        {tech}
                      </Typography>
                    ))}
                  </div>
                )}

                {(project.writeUp || project.links.length > 0) && (
                  <div className={styles.Project__links}>
                    {project.writeUp && (
                      <Link to="/blog/$slug" params={{ slug: project.writeUp }} className={styles.Project__link}>
                        <Typography size="xx-small" weight="medium" render={<span />}>
                          Read the write-up
                        </Typography>
                        <Icon.ArrowRightIcon size={12} />
                      </Link>
                    )}
                    {project.links.map(link => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.Project__link}>
                        <Typography size="xx-small" weight="medium" render={<span />}>
                          {link.label}
                        </Typography>
                        <Icon.ArrowUpRightIcon size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
