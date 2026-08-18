import { useQuery } from "@tanstack/react-query"
import { cx } from "cva"
import type { ComponentProps } from "react"

import { Icon } from "@/components/primitives/icons"
import { Scrollable } from "@/components/primitives/scrollable"
import { Skeleton } from "@/components/primitives/skeleton"
import { Typography } from "@/components/primitives/typography"
import { activityQueryOptions } from "@/query/options/latest-activity"
import type { Activity, ActivityFeed, ActivityKind } from "@/server/activity"
import { formatRelativeTime } from "@/utils/date"

import styles from "./index.module.scss"

type LatestActivityProps = ComponentProps<"div">

/** A stable empty feed, so a render with no data does not look like new data. */
const EMPTY: ActivityFeed = { items: [], more: 0 }

const KIND_ICON: Record<ActivityKind, Icon.Icon> = {
  push: Icon.GitCommitIcon,
  pr: Icon.GitPullRequestIcon,
  comment: Icon.ChatCircleIcon,
  issue: Icon.WarningCircleIcon,
  release: Icon.RocketLaunchIcon,
  create: Icon.PlusCircleIcon
}

/**
 * Recent public GitHub activity, rendered as a list inside a scrollable container.
 *
 * Headerless: it is the back half of the block it sits in, under that block's heading, rather than a
 * section of its own. Prefetched by the home route's loader (which runs fresh on every request — home
 * is excluded from prerendering), so this renders with the real feed from the first paint rather than
 * the skeleton below.
 */
export function LatestActivity({ className, ...rest }: LatestActivityProps) {
  const { data: activity = EMPTY, isPending } = useQuery(activityQueryOptions())

  if (isPending) return <LatestActivitySkeleton />
  if (activity.items.length === 0) return null

  return (
    <div {...rest} className={cx(styles.LatestActivity, className)}>
      <Scrollable scrollbar="hover" className={styles.LatestActivity__scrollable}>
        <div className={styles.LatestActivity__list}>
          {activity.items.map(item => (
            <a
              key={`${item.at}-${item.url}`}
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.LatestActivity__row}>
              <span className={styles.LatestActivity__left}>
                <ActivityIcon kind={item.kind} />
                <Typography size="xx-small" weight="regular" render={<span />}>
                  {item.action}{" "}
                  <Typography className={styles.LatestActivity__repo} weight="semibold" render={<span />}>
                    {item.repo}
                    {item.number !== undefined && (
                      <span className={styles.LatestActivity__number}> (#{item.number})</span>
                    )}
                  </Typography>
                </Typography>
              </span>
              <Typography size="xx-small" weight="regular" render={<span />} className={styles.LatestActivity__right}>
                <time dateTime={item.at}>{formatRelativeTime(item.at, { style: "narrow" })}</time>
              </Typography>
            </a>
          ))}
        </div>
      </Scrollable>
    </div>
  )
}

export declare namespace LatestActivity {
  export type Props = LatestActivityProps
}

function ActivityIcon({ kind }: { kind: Activity["kind"] }) {
  const Glyph = KIND_ICON[kind]

  return <Glyph size={14} className={styles.LatestActivity__icon} />
}

const ACTIVITY_SKELETON_ROWS = 5

function LatestActivitySkeleton() {
  return (
    <div className={styles.LatestActivity} aria-hidden="true">
      <Scrollable scrollbar="invisible" className={styles.LatestActivity__scrollable}>
        <div className={styles.LatestActivity__list}>
          {Array.from({ length: ACTIVITY_SKELETON_ROWS }, (_, index) => (
            <div key={index} className={styles.LatestActivity__row}>
              <span className={styles.LatestActivity__left}>
                <Icon.GitBranchIcon size={14} className={styles.LatestActivity__icon} />{" "}
                <Skeleton>
                  <Typography size="xx-small" weight="regular" render={<span />}>
                    Loading activity
                  </Typography>
                </Skeleton>
              </span>
              <Skeleton>
                <Typography size="xx-small" weight="regular" render={<span />} className={styles.LatestActivity__right}>
                  1d
                </Typography>
              </Skeleton>
            </div>
          ))}
        </div>
      </Scrollable>
    </div>
  )
}
