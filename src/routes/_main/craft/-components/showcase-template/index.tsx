/* eslint-disable react-refresh/only-export-components */
// The panel's own stylesheet, imported here because the template is what gives it a rail to sit in.
import "dialkit/styles.css"

import { Link } from "@tanstack/react-router"
import { cx } from "cva"
import { DialRoot } from "dialkit"
import type { ComponentProps, ReactNode } from "react"
import { useState } from "react"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import type { Showcase } from "@/data/showcases"
import { SHOWCASES } from "@/data/showcases"
import { usePreferences } from "@/preferences/context"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = ComponentProps<"article"> & {
  children: ReactNode
}

function Root({ children, className, ...rest }: RootProps) {
  return (
    <article {...rest} className={cx(styles.Showcase, className)}>
      {children}
    </article>
  )
}

/*
 * ====================================================================================
 * Header
 * ====================================================================================
 */

type HeaderProps = ComponentProps<"header"> & {
  to: Showcase["to"]
  subtitle: string
  githubUrl?: string
  title?: string
  tags?: Array<string>
}

function Header({ to, subtitle, githubUrl, title: propTitle, tags: propTags, className, ...rest }: HeaderProps) {
  const entry = SHOWCASES.find(item => item.to === to)
  const title = propTitle ?? entry?.title
  const tags = propTags ?? entry?.tags ?? []

  return (
    <header {...rest} className={cx(styles.Showcase__header, className)}>
      <div className={styles.Showcase__topRow}>
        <Typography size="xx-small" className={styles.Showcase__backLink} render={<Link to="/craft" />}>
          ← Back to Craft
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
      {title && (
        <Typography size="x-large" family="serif">
          {title}
        </Typography>
      )}
      <Typography size="x-small" weight="regular" className={styles.Showcase__subtitle}>
        {subtitle}
      </Typography>
      <div className={styles.Showcase__tags}>
        {tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </header>
  )
}

/*
 * ====================================================================================
 * Demo
 * ====================================================================================
 */

type DemoProps = ComponentProps<"section"> & {
  children: ReactNode
  ariaLabel?: string
  onReset?: () => void
  /** Whether this demo has controls; the demo itself registers what knobs exist. */
  dials?: boolean
}

function Demo({ children, ariaLabel = "Demo", onReset, dials, className, ...rest }: DemoProps) {
  const [run, setRun] = useState(0)
  const { preferences } = usePreferences()
  const theme = preferences.theme === "system" ? "system" : preferences.theme

  const handleReset = () => {
    setRun(current => current + 1)
    onReset?.()
  }

  return (
    <section {...rest} className={cx(styles.Showcase__demo, className)} aria-label={ariaLabel}>
      <div className={styles.Showcase__demoBar}>
        <Typography
          size="xx-small"
          className={styles.Showcase__reset}
          render={<button type="button" onClick={handleReset} />}>
          <Icon.ArrowCounterClockwiseIcon size={14} />
          <span>Reset demo</span>
        </Typography>
      </div>
      <div className={styles.Showcase__demoBody} data-dials={dials ? "" : undefined}>
        <div key={run} className={styles.Showcase__demoInner}>
          {children}
        </div>
        {dials && (
          <aside className={styles.Showcase__demoDials}>
            {/* Inline rather than the floating default, and shown in production, because this is
                part of the page rather than a tool left switched on by accident. */}
            <DialRoot mode="inline" productionEnabled theme={theme} />
          </aside>
        )}
      </div>
    </section>
  )
}

/*
 * ====================================================================================
 * Action
 * ====================================================================================
 */

/** The button a demo is worked by — the shared Button, kept under the template's own name so
    showcase pages read as pieces of one family. */
function Action(props: Button.Props) {
  return <Button {...props} />
}

/*
 * ====================================================================================
 * Lede
 * ====================================================================================
 */

type LedeProps = ComponentProps<"p"> & {
  children: ReactNode
}

/** The paragraph that says what the thing is and why it exists, before any of the how. */
function Lede({ children, className, ...rest }: LedeProps) {
  return (
    <Typography size="small" weight="regular" render={<p {...rest} />} className={cx(styles.Showcase__lede, className)}>
      {children}
    </Typography>
  )
}

/*
 * ====================================================================================
 * Prose
 * ====================================================================================
 */

type ProseProps = ComponentProps<"p"> & {
  children: ReactNode
}

/** A paragraph of the body, at the measure the whole page is written to. */
function Prose({ children, className, ...rest }: ProseProps) {
  return (
    <Typography
      size="x-small"
      weight="regular"
      render={<p {...rest} />}
      className={cx(styles.Showcase__prose, className)}>
      {children}
    </Typography>
  )
}

/*
 * ====================================================================================
 * List
 * ====================================================================================
 */

type ListProps = ComponentProps<"ul"> & {
  /** One line each. Anything that needs a paragraph is a paragraph, not a bullet. */
  items: Array<ReactNode>
}

function List({ items, className, ...rest }: ListProps) {
  return (
    <ul {...rest} className={cx(styles.Showcase__list, className)}>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key -- the items are prose, not records
        <li key={index} className={styles.Showcase__listItem}>
          <Typography size="x-small" weight="regular">
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  )
}

/*
 * ====================================================================================
 * Aside
 * ====================================================================================
 */

type AsideProps = ComponentProps<"aside"> & {
  children: ReactNode
}

/** The one thing worth stopping on: a trap, a measurement, the reason it is built this way. */
function Aside({ children, className, ...rest }: AsideProps) {
  return (
    <Typography
      size="x-small"
      weight="regular"
      render={<aside {...rest} />}
      className={cx(styles.Showcase__aside, className)}>
      {children}
    </Typography>
  )
}

/*
 * ====================================================================================
 * Split
 * ====================================================================================
 */

type SplitProps = ComponentProps<"div"> & {
  /** Two of them, each a heading and whatever belongs under it. More than two is a table. */
  columns: Array<{ title: string; children: ReactNode }>
}

/** A pair, side by side, for the rare case two things are genuinely being compared. */
function Split({ columns, className, ...rest }: SplitProps) {
  return (
    <div {...rest} className={cx(styles.Showcase__split, className)}>
      {columns.map(column => (
        <div key={column.title}>
          <Typography size="x-small" weight="semibold" className={styles.Showcase__splitTitle}>
            {column.title}
          </Typography>
          {column.children}
        </div>
      ))}
    </div>
  )
}

/*
 * ====================================================================================
 * Table
 * ====================================================================================
 */

type TableProps = ComponentProps<"table"> & {
  /** What the figures are, since a table of bare numbers is a puzzle. */
  caption: string
  children: ReactNode
}

/** Figures at reading size: mono digits, right-ranged columns, its own scroll on a narrow screen. */
function Table({ caption, children, className, ...rest }: TableProps) {
  return (
    <div className={cx(styles.Showcase__tableScroll, className)}>
      <Typography size="xxx-small" family="mono" render={<table {...rest} />}>
        <caption>{caption}</caption>
        {children}
      </Typography>
    </div>
  )
}

/*
 * ====================================================================================
 * Section
 * ====================================================================================
 */

type SectionProps = ComponentProps<"section"> & {
  title?: string
  children: ReactNode
}

function Section({ title, children, className, ...rest }: SectionProps) {
  return (
    <section {...rest} className={cx(styles.Showcase__section, className)}>
      {title && (
        <Typography size="medium" family="serif" render={<h2 />} className={styles.Showcase__sectionTitle}>
          {title}
        </Typography>
      )}
      {children}
    </section>
  )
}

export const ShowcaseTemplate = {
  Root,
  Header,
  Demo,
  Section,
  Action,
  Lede,
  Prose,
  List,
  Aside,
  Split,
  Table
}

export declare namespace ShowcaseTemplate {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace Header {
    export type Props = HeaderProps
  }
  export namespace Demo {
    export type Props = DemoProps
  }
  export namespace Action {
    export type Props = Button.Props
  }
  export namespace Lede {
    export type Props = LedeProps
  }
  export namespace Prose {
    export type Props = ProseProps
  }
  export namespace List {
    export type Props = ListProps
  }
  export namespace Aside {
    export type Props = AsideProps
  }
  export namespace Split {
    export type Props = SplitProps
  }
  export namespace Table {
    export type Props = TableProps
  }
  export namespace Section {
    export type Props = SectionProps
  }
}
