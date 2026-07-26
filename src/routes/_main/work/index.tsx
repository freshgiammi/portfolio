import { createFileRoute } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

import { Typography } from "@/components/ui/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./index.module.scss"


const SEO = {
  title: "Work — freshgiammi",
  description: "Professional experience across frontend engineering, design systems, and product delivery."
} satisfies PageSeo

export const Route = createFileRoute("/_main/work/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/work" }),
  component: WorkPage
})

type Experience = {
  id: string
  period: string
  role: string
  company: string
  url?: string
  description: ReactNode
  highlights: Array<ReactNode>
}

const EXPERIENCE: Array<Experience> = [
  {
    id: "arduino",
    period: "Mar 2023 — Present",
    role: "Senior Frontend Developer",
    company: "Arduino",
    url: "https://arduino.cc/",
    description: (
      <span>
        Shaping how millions of makers interact with their IoT projects on{" "}
        <a href="https://app.arduino.cc/" target="_blank" rel="noopener noreferrer" className={styles.InlineLink}>
          Arduino Cloud
        </a>
        &apos;s web frontend.
      </span>
    ),
    highlights: [
      <span key="lead">
        Act as <b>de facto lead developer</b> for Arduino Cloud&apos;s web platform, triaging and owning delivery for
        nearly all incoming feature and technical requests
      </span>,
      "Own solution design end-to-end: drafting technical and architectural requirements, scoping estimates, and coordinating colleagues through implementation",
      "Interface directly with other teams to align on requirements and ensure features land on time and in their best form",
      <span key="design-system">
        Built the <b>Arduino Design System</b> from scratch (React components, iconography, and token-based
        theming), now powering products company-wide, well beyond Cloud
      </span>,
      "Created and maintain several internal and open-source libraries used across Arduino's frontend ecosystem"
    ]
  },
  {
    id: "deloitte",
    period: "Apr 2021 — Mar 2023",
    role: "Fullstack Developer (Consultant)",
    company: "Deloitte Risk Advisory",
    url: "https://www2.deloitte.com/it/it/services/risk.html",
    description:
      "Enterprise full-stack development for risk advisory clients, building applications and automation tooling.",
    highlights: [
      <span key="apps">
        Developed and maintained <b>4+ full-stack web apps</b> (React, Express), overseeing the entire process from
        development and prototyping through to final delivery
      </span>,
      "Worked directly with clients to build custom-tailored applications, through weekly and monthly meetings with clients and internal development teams",
      "Redesigned internal application development guidelines, including a unified UX/UI design style for applications built across different teams",
      "Guided multiple teams through adopting a git-flow methodology, with PR review and CI/CD integration",
      "Introduced a set of best practices and TODOs, along with templates for faster, leaner application development"
    ]
  },
  {
    id: "jecomm",
    period: "May 2019 — Mar 2021",
    role: "Communication Team Associate",
    company: "JECoMM",
    url: "https://jecomm.it/",
    description: "Digital communication strategies and web projects for a Milan-based agency.",
    highlights: [
      "Managed the agency's website end to end",
      <span key="redesign">
        Led a <b>complete redesign and rewrite</b> of the site&apos;s visual guidelines
      </span>,
      "Analyzed social campaign data using Google Analytics and Facebook Pixel",
      "Created graphics for clients and social media",
      "Wrote articles for the company blog"
    ]
  }
]

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function WorkPage() {
  const activeId = useActiveExperience(EXPERIENCE)
  const timelineRef = useRef<HTMLElement>(null)

  // On mobile, .Timeline is a horizontally-scrollable strip, so the newly-active item
  // (as the user scrolls the page content) can end up scrolled out of view within it.
  useEffect(() => {
    if (!activeId) return
    const link = timelineRef.current?.querySelector(`a[href="#${activeId}"]`)
    link?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [activeId])

  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Typography size="x-large" family="serif">
          Work
        </Typography>
        <Typography size="x-small" weight="regular" className={styles.Header__subtitle}>
          Frontend engineer, building for the web since 2019.
        </Typography>
      </header>

      <div className={styles.MainGrid}>
        <nav className={styles.Timeline} ref={timelineRef}>
          {EXPERIENCE.map((exp) => (
            <a
              key={exp.id}
              href={`#${exp.id}`}
              className={styles.TimelineItem}
              data-active={exp.id === activeId || undefined}
              onClick={(e) => {
                e.preventDefault()
                // Smoothness comes from the global CSS `scroll-behavior`; the JS option
                // silently no-ops on iOS Safari.
                document.getElementById(exp.id)?.scrollIntoView()
              }}>
              <div className={styles.TimelineDot} />
              <div className={styles.TimelineContent}>
                <Typography size="xxx-small" weight="regular" className={styles.TimelinePeriod}>
                  {exp.period}
                </Typography>
                <Typography size="small" weight="semibold" className={styles.TimelineRole}>
                  {exp.role}
                </Typography>
                <Typography size="x-small" weight="regular" className={styles.TimelineCompany}>
                  {exp.company}
                </Typography>
              </div>
            </a>
          ))}
        </nav>

        <div className={styles.Content}>
          {EXPERIENCE.map((exp) => (
            <section key={exp.id} id={exp.id} className={styles.JobSection}>
              <Typography size="xxx-small" weight="regular" className={styles.DetailPeriod}>
                {exp.period}
              </Typography>
              <Typography size="large" weight="semibold">
                {exp.role}
              </Typography>
              <Typography size="small" weight="regular" className={styles.DetailCompany}>
                {exp.url ? (
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className={styles.InlineLink}>
                    {exp.company}
                  </a>
                ) : (
                  exp.company
                )}
              </Typography>
              <Typography size="x-small" weight="regular" className={styles.DetailDescription}>
                {exp.description}
              </Typography>
              <ul className={styles.DetailHighlights}>
                {exp.highlights.map((h, i) => (
                  // Static, never-reordered list, so an index key is safe here.
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i}>
                    <Typography size="x-small" weight="regular">
                      {h}
                    </Typography>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function useActiveExperience(experience: Array<Experience>): string {
  const [activeId, setActiveId] = useState<string>(experience[0]?.id ?? "")
  const visibleRef = useRef(new Set<string>())

  useEffect(() => {
    const visible = visibleRef.current
    visible.clear()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        })

        const firstVisible = experience.find((exp) => visible.has(exp.id))
        if (firstVisible) {
          setActiveId(firstVisible.id)
        }
      },
      {
        rootMargin: "-45% 0px -45% 0px"
      }
    )

    const elements: Array<HTMLElement> = []
    experience.forEach((exp) => {
      const el = document.getElementById(exp.id)
      if (el) {
        elements.push(el)
        observer.observe(el)
      }
    })

    // The center-band IntersectionObserver above can never fire for the very last
    // section: there's nothing after it to scroll its midpoint through the band once
    // the page hits max scroll. Force it active once the user reaches the bottom.
    function handleScroll() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const last = experience[experience.length - 1]
      if (atBottom && last) {
        setActiveId(last.id)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      elements.forEach((el) => observer.unobserve(el))
      window.removeEventListener("scroll", handleScroll)
    }
  }, [experience])

  return activeId
}
