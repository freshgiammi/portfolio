import { Accordion } from "@base-ui/react/accordion"
import type { ReactNode } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

type Experience = {
  id: string
  period: string
  role: string
  company: string
  description: ReactNode
  highlights: Array<ReactNode>
}

const EXPERIENCE: Array<Experience> = [
  {
    id: "arduino",
    period: "Mar 2023 — Present",
    role: "Senior Frontend Developer",
    company: "Arduino",
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
        Built the <b>Arduino Design System</b> from scratch (React components, iconography, and token-based theming),
        now powering products company-wide, well beyond Cloud
      </span>,
      "Created and maintain several internal and open-source libraries used across Arduino's frontend ecosystem"
    ]
  },
  {
    id: "deloitte",
    period: "Apr 2021 — Mar 2023",
    role: "Fullstack Developer (Consultant)",
    company: "Deloitte Risk Advisory",
    description: (
      <span>
        Enterprise full-stack development for{" "}
        <a
          href="https://www2.deloitte.com/it/it/services/risk.html"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.InlineLink}>
          Deloitte Risk Advisory
        </a>{" "}
        clients, building applications and automation tooling.
      </span>
    ),
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
    description: (
      <span>
        Digital communication strategies and web projects for{" "}
        <a href="https://jecomm.it/" target="_blank" rel="noopener noreferrer" className={styles.InlineLink}>
          JECoMM
        </a>
        , a Milan-based agency.
      </span>
    ),
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

/**
 * One row per job, closed by default except the most recent.
 *
 * The company name in the header is plain text, never a link, since a link there would nest inside
 * `Accordion.Trigger`'s `<button>`, which is invalid markup. Each company is linked once instead,
 * inline in its description.
 */
export function WorkAccordion() {
  return (
    <Accordion.Root className={styles.Accordion} defaultValue={[EXPERIENCE[0]?.id]}>
      {EXPERIENCE.map(exp => (
        <Accordion.Item key={exp.id} value={exp.id} className={styles.Item}>
          <Accordion.Header>
            <Accordion.Trigger className={styles.Item__trigger}>
              <div className={styles.Item__main}>
                <Typography size="small" weight="medium" render={<span />}>
                  {exp.role}
                </Typography>
                <Typography size="xx-small" weight="regular" className={styles.Item__company} render={<span />}>
                  {exp.company}
                </Typography>
              </div>
              <div className={styles.Item__meta}>
                <Typography size="xxx-small" family="mono" weight="regular" className={styles.Item__period}>
                  {exp.period}
                </Typography>
                <Icon.CaretDownIcon size={13} weight="bold" className={styles.Item__caret} />
              </div>
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Panel className={styles.Item__panel}>
            <div className={styles.Item__panelContent}>
              <Typography size="x-small" weight="regular" className={styles.Item__description}>
                {exp.description}
              </Typography>
              <ul className={styles.Item__highlights}>
                {exp.highlights.map((highlight, i) => (
                  // Static, never-reordered list, so an index key is safe here.
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i}>
                    <Typography size="x-small" weight="regular">
                      {highlight}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
