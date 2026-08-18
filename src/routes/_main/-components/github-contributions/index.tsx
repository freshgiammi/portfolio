import { useQuery } from "@tanstack/react-query"
import { cx } from "cva"
import type { ComponentProps } from "react"

import { Icon } from "@/components/primitives/icons"
import { Scrollable } from "@/components/primitives/scrollable"
import { Skeleton } from "@/components/primitives/skeleton"
import { Tooltip } from "@/components/primitives/tooltip"
import { Typography } from "@/components/primitives/typography"
import { contributionsQueryOptions, milestonesQueryOptions } from "@/query/options/github-contributions"
import type { ContributionDay } from "@/server/contributions"
import type { Milestone, MilestoneKind } from "@/server/milestones"
import { formatDate } from "@/utils/date"
import { formatCount } from "@/utils/number"

import styles from "./index.module.scss"

type GithubContributionsProps = ComponentProps<"section">

const MILESTONE_ICON: Record<MilestoneKind, Icon.Icon> = {
  post: Icon.ArticleIcon,
  thought: Icon.ChatCircleIcon,
  release: Icon.RocketLaunchIcon
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })

// One label per week column, on the column whose Sunday opens a new month — the same rule GitHub
// uses, so a name sits over the grid rather than over the whole year.
function monthLabels(days: Array<ContributionDay>) {
  const labels: Array<string | null> = []
  let previous = ""

  for (let index = 0; index < days.length; index += 7) {
    const month = MONTH_FORMAT.format(new Date(days[index]!.date))
    const changed = month !== previous
    previous = month
    labels.push(changed ? month : null)
  }

  return labels
}

/**
 * A year of GitHub contributions: three totals and the calendar they came from.
 *
 * Headerless on purpose. It sits directly under the activity feed as the back half of one block,
 * under that block's heading, rather than announcing itself as a second section about the same
 * account. Prefetched by the home route's loader (which runs fresh on every request — home is
 * excluded from prerendering), so this renders with the real numbers from the first paint rather
 * than the skeleton below.
 */
export function GithubContributions({ className, ...rest }: GithubContributionsProps) {
  const { data } = useQuery(contributionsQueryOptions())
  const { data: milestonesByDate = {} } = useQuery(milestonesQueryOptions())

  if (!data) return <GithubContributionsSkeleton />

  // Held in a variable so the element identity survives the root's own re-renders: the popup
  // changing hands between cells must not re-render three hundred and seventy of them.
  const months = monthLabels(data.days)

  const calendar = (
    // Opened at the newest end, which is the one the numbers above are about. A narrow column
    // scrolls back through the year rather than being handed a smaller or shorter one.
    <Scrollable initialScroll={{ x: "end" }} className={styles.GithubContributions__calendarRail}>
      {/* The grid is the picture, and the picture is the same statement as the label: reading it
          cell by cell with a screen reader would be 370 announcements of nothing much. */}
      <div
        className={styles.GithubContributions__calendar}
        role="img"
        aria-label={`${data.year} contributions in the last year, ${data.week} of them this week`}>
        <div className={styles.GithubContributions__months} aria-hidden="true">
          {months.map((month, index) => (
            <span key={data.days[index * 7]!.date} className={styles.GithubContributions__month}>
              {month}
            </span>
          ))}
        </div>
        <div className={styles.GithubContributions__grid}>
          {data.days.map(day => (
            <Tooltip.Trigger
              key={day.date}
              payload={day}
              render={<span />}
              className={styles.GithubContributions__day}
              data-level={day.level}
              data-milestone={day.date in milestonesByDate || undefined}
            />
          ))}
        </div>
      </div>
    </Scrollable>
  )

  return (
    <section {...rest} className={cx(styles.GithubContributions, className)}>
      <div className={styles.GithubContributions__header}>
        <div className={styles.GithubContributions__primaryStat}>
          <Typography size="large" weight="bold" render={<span />} className={styles.GithubContributions__yearValue}>
            {formatCount(data.year)}
          </Typography>
          <Typography
            size="xx-small"
            weight="regular"
            render={<span />}
            className={styles.GithubContributions__yearLabel}>
            contributions in the last year
          </Typography>
        </div>

        <div className={styles.GithubContributions__subStats}>
          <div className={styles.GithubContributions__subStat}>
            <Typography
              size="small"
              weight="semibold"
              render={<span />}
              className={styles.GithubContributions__subValue}>
              {formatCount(data.month)}
            </Typography>
            <Typography
              size="xxx-small"
              family="mono"
              render={<span />}
              className={styles.GithubContributions__subLabel}>
              this month
            </Typography>
          </div>

          <span className={styles.GithubContributions__divider} aria-hidden="true" />

          <div className={styles.GithubContributions__subStat}>
            <Typography
              size="small"
              weight="semibold"
              render={<span />}
              className={styles.GithubContributions__subValue}>
              {formatCount(data.week)}
            </Typography>
            <Typography
              size="xxx-small"
              family="mono"
              render={<span />}
              className={styles.GithubContributions__subLabel}>
              this week
            </Typography>
          </div>
        </div>
      </div>

      {/* Every cell is a trigger of the same root, so the year is one popup being re-anchored
          rather than 370 of them waiting to be built. No opening delay: the cells are two pixels
          wide, and a pause on each one turns reading across a week into a wait. */}
      <Tooltip.Provider delay={0}>
        <Tooltip.Root<ContributionDay>>
          {({ payload }) => (
            <>
              {calendar}
              {payload && (
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={6}>
                    <Tooltip.Popup className={styles.GithubContributions__tooltip}>
                      <span className={styles.GithubContributions__tooltipHead}>
                        <Typography size="xxx-small" weight="medium" render={<span />}>
                          {payload.count === 0 ? "No" : formatCount(payload.count)} contribution
                          {payload.count === 1 ? "" : "s"}
                        </Typography>
                        <Typography
                          size="xxx-small"
                          weight="regular"
                          render={<span />}
                          className={styles.GithubContributions__tooltipDate}>
                          {formatDate(payload.date, "short")}
                        </Typography>
                      </span>
                      <Milestones milestones={milestonesByDate[payload.date]} />
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              )}
            </>
          )}
        </Tooltip.Root>
      </Tooltip.Provider>

      <div className={styles.GithubContributions__legend} aria-hidden="true">
        <span>less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <span key={level} className={styles.GithubContributions__legendCell} data-level={level} />
        ))}
        <span>more</span>
      </div>

      <div className={styles.GithubContributions__footer}>
        <Typography size="xxx-small" weight="regular" render={<span />} className={styles.GithubContributions__fact}>
          {/* The icon is wrapped because the embers are pseudo-elements, and an `svg` has no box for
              those to be drawn in. */}
          <span className={styles.GithubContributions__flame} data-lit={data.streak > 0 || undefined}>
            <Icon.FireIcon size={12} weight={data.streak > 0 ? "fill" : "regular"} />
          </span>
          {data.streak > 0 ? `${data.streak} day streak` : "No streak right now"}
        </Typography>
        <Typography size="xxx-small" weight="regular" render={<span />} className={styles.GithubContributions__fact}>
          <Icon.TrophyIcon size={12} />
          Best day: {formatCount(data.best.count)} on {formatDate(data.best.date, "short")}
        </Typography>
      </div>
    </section>
  )
}

export declare namespace GithubContributions {
  export type Props = GithubContributionsProps
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

// Matches the real grid's 53-week shape rather than a blank rectangle, per the `Skeleton`
// convention: cover the real shape, don't restate it as a box.
const CALENDAR_SKELETON_CELLS = 53 * 7

function GithubContributionsSkeleton() {
  return (
    <section className={styles.GithubContributions} aria-hidden="true">
      <div className={styles.GithubContributions__header}>
        <Skeleton>
          <div className={styles.GithubContributions__primaryStat}>
            <Typography size="large" weight="bold" render={<span />} className={styles.GithubContributions__yearValue}>
              0,000
            </Typography>
            <Typography
              size="xx-small"
              weight="regular"
              render={<span />}
              className={styles.GithubContributions__yearLabel}>
              contributions in the last year
            </Typography>
          </div>
        </Skeleton>

        <div className={styles.GithubContributions__subStats}>
          <Skeleton>
            <div className={styles.GithubContributions__subStat}>
              <Typography
                size="small"
                weight="semibold"
                render={<span />}
                className={styles.GithubContributions__subValue}>
                00
              </Typography>
              <Typography
                size="xxx-small"
                family="mono"
                render={<span />}
                className={styles.GithubContributions__subLabel}>
                this month
              </Typography>
            </div>
          </Skeleton>
          <span className={styles.GithubContributions__divider} aria-hidden="true" />
          <Skeleton>
            <div className={styles.GithubContributions__subStat}>
              <Typography
                size="small"
                weight="semibold"
                render={<span />}
                className={styles.GithubContributions__subValue}>
                00
              </Typography>
              <Typography
                size="xxx-small"
                family="mono"
                render={<span />}
                className={styles.GithubContributions__subLabel}>
                this week
              </Typography>
            </div>
          </Skeleton>
        </div>
      </div>

      <Skeleton>
        <div className={styles.GithubContributions__calendar}>
          <div className={styles.GithubContributions__months} aria-hidden="true">
            {Array.from({ length: 53 }, (_, index) => (
              <span key={index} className={styles.GithubContributions__month} />
            ))}
          </div>
          <div className={styles.GithubContributions__grid}>
            {Array.from({ length: CALENDAR_SKELETON_CELLS }, (_, index) => (
              <span key={index} className={styles.GithubContributions__day} />
            ))}
          </div>
        </div>
      </Skeleton>

      <div className={styles.GithubContributions__legend} aria-hidden="true">
        <span>less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <span key={level} className={styles.GithubContributions__legendCell} data-level={level} />
        ))}
        <span>more</span>
      </div>

      <div className={styles.GithubContributions__footer}>
        <Skeleton>
          <Typography size="xxx-small" weight="regular" render={<span />} className={styles.GithubContributions__fact}>
            <Icon.FireIcon size={12} />
            Loading streak
          </Typography>
        </Skeleton>
        <Skeleton>
          <Typography size="xxx-small" weight="regular" render={<span />} className={styles.GithubContributions__fact}>
            <Icon.TrophyIcon size={12} />
            Loading best day
          </Typography>
        </Skeleton>
      </div>
    </section>
  )
}

/** What happened that day beyond the commits, for the days that have anything to say. */
type MilestonesProps = { milestones: Array<Milestone> | undefined }

function Milestones({ milestones }: MilestonesProps) {
  if (!milestones) return null

  return (
    <span className={styles.GithubContributions__tooltipMilestones}>
      {milestones.map(milestone => {
        const MilestoneIcon = MILESTONE_ICON[milestone.kind]

        return (
          <Typography
            key={`${milestone.kind}-${milestone.label}`}
            size="xxx-small"
            weight="regular"
            render={<span />}
            className={styles.GithubContributions__tooltipMilestone}>
            <MilestoneIcon size={11} weight="fill" />
            {milestone.label}
          </Typography>
        )
      })}
    </span>
  )
}
