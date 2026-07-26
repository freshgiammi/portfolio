import * as buildinfo from "virtual:buildinfo"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

type BuildInfoFooterProps = Record<string, never>

/**
 * Pinned to UTC, and says so.
 *
 * Without a `timeZone` this formats in whatever zone the runtime sits in: UTC on the worker, the
 * reader's own zone in the browser. Same instant, two different strings, which is a hydration
 * mismatch on every visit from outside UTC.
 */
const BUILD_TIME = buildinfo.time.toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" })

export function BuildInfoFooter(_props: BuildInfoFooterProps) {
  return (
    <footer className={styles.BuildInfoFooter}>
      <Typography size="xxx-small" weight="regular" className={styles.BuildInfoFooter__item}>
        <Icon.GitBranchIcon size={10} />
        <a
          href={`https://github.com/freshgiammi/portfolio/tree/${buildinfo.branch}`}
          target="_blank"
          rel="noopener noreferrer">
          {buildinfo.branch}
        </a>
      </Typography>
      <Typography size="xxx-small" weight="regular" className={styles.BuildInfoFooter__item}>
        <Icon.GitCommitIcon size={10} />
        <a
          href={`https://github.com/freshgiammi/portfolio/commit/${buildinfo.sha}`}
          target="_blank"
          rel="noopener noreferrer">
          {buildinfo.abbreviatedSha || "N/A"}
        </a>
      </Typography>
      <Typography size="xxx-small" weight="regular" className={styles.BuildInfoFooter__item}>
        <Icon.ClockIcon size={10} />
        <time dateTime={buildinfo.time.toISOString()}>{BUILD_TIME}</time>
      </Typography>
    </footer>
  )
}

export declare namespace BuildInfoFooter {
  export type Props = BuildInfoFooterProps
}
