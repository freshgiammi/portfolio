import { createFileRoute } from "@tanstack/react-router"
import { useDialKit } from "dialkit"
import { useRef } from "react"

import { Scrollable } from "@/components/primitives/scrollable"
import { Typography } from "@/components/primitives/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE = "Opens already scrolled to the point that matters, and fades into whatever's behind it as you move."

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1)
const TODAY = 16

type ScrollbarMode = "invisible" | "hover" | "always"

const SEO = {
  title: "Scrollable",
  description: "A scroll box that fades into its background and can open already anchored to a specific node.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/scrollable/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft/scrollable" }),
  component: ScrollableShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ScrollableShowcase() {
  return (
    <ShowcaseTemplate.Root>
      <ShowcaseTemplate.Header
        to="/craft/scrollable"
        subtitle={SUBTITLE}
        githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/ui/scrollable"
      />

      <ShowcaseTemplate.Demo dials>
        <Demo />
      </ShowcaseTemplate.Demo>

      <ShowcaseTemplate.Lede>
        A calendar month, a table of contents, a settings panel: three things on this site that are taller than the box
        they live in, and none of them should announce that with a flat-coloured shadow or a scrollbar sitting there
        uninvited. This is the one box behind all three, built once so the fade and the scrollbar only had to be argued
        with a single time.
      </ShowcaseTemplate.Lede>

      <ShowcaseTemplate.Section title="Fading, not covering">
        <ShowcaseTemplate.Prose>
          The edges don&apos;t darken, they dissolve. That difference only matters because this site&apos;s background
          is never one flat colour, so a scrim tuned to look right at one scroll position shows up as a hard rectangle
          the moment the gradient behind it has moved on. A <code>mask-image</code> fades all the way to transparent
          instead, which means it always reveals whatever is actually back there.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          Two independent gradients, one per axis, layered with <code>mask-composite: intersect</code>. The default
          composite is <code>add</code>, which unions the layers instead of overlapping them, so a box that scrolls both
          ways would get a single fused shape with no fade left in either corner. <code>intersect</code> is what keeps
          the two axes independent of each other.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          Scroll the demo above all the way to either end. The fade on that edge disappears, because there&apos;s
          nothing left past it to hint at.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Opening already in the right place">
        <ShowcaseTemplate.Prose>
          The demo above didn&apos;t open at the top. It opened centred on day 16, because that&apos;s the node it was
          told to anchor to, measured against the box rather than the page. A GitHub-style contribution calendar
          elsewhere on this site does the same thing along the other axis, opening scrolled all the way to today without
          a single frame of showing January first.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          It isn&apos;t <code>scrollIntoView</code>, on purpose. That method walks up to the next scrollable ancestor
          once the box itself can&apos;t satisfy the request, which for a box near the page&apos;s own edge is the whole
          page. A table of contents on this site that has to keep the active heading in view as you read reaches for the
          same problem after the fact, and solves it the same way: measuring the two rects by hand and moving only the
          one element, never the page underneath it.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          Applied once per axis, the first time that axis actually has something to scroll. A box that only starts
          overflowing sideways later doesn&apos;t retroactively lose a position someone has already moved away from.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Three ways to admit it scrolls">
        <ShowcaseTemplate.Prose>
          Switch the setting in the panel above between the three. <code>invisible</code> draws no affordance at all,
          for places where the fade alone is enough of a hint. <code>always</code> keeps a dim thumb on screen the whole
          time. <code>hover</code> sits between the two: nothing until the box is worth looking at, then the same thumb{" "}
          <code>always</code> would have shown all along.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          This page&apos;s own table of contents, a blog post&apos;s code blocks, and the appearance panel&apos;s hue
          row all reach for <code>hover</code>. It&apos;s the one setting that never has to be defended either way:
          nothing to argue is cluttering the page at rest, and nothing to argue is hidden from someone who actually
          moves the pointer over it.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>
    </ShowcaseTemplate.Root>
  )
}

function Demo() {
  const dials = useDialKit("Scrollable", {
    scrollbar: { type: "select", options: ["invisible", "hover", "always"], default: "invisible" }
  })
  const todayRef = useRef<HTMLSpanElement>(null)

  return (
    <div className={styles.Demo}>
      <Scrollable
        className={styles.Demo__box}
        maxHeight={220}
        scrollbar={dials.scrollbar as ScrollbarMode}
        initialScroll={{ y: "center", target: todayRef }}
        contentClassName={styles.Demo__list}>
        {DAYS.map(day => (
          <span
            key={day}
            data-today={day === TODAY || undefined}
            className={styles.Demo__day}
            ref={day === TODAY ? todayRef : undefined}>
            <Typography size="xx-small" weight={day === TODAY ? "semibold" : "regular"}>
              Day {day}
            </Typography>
            {day === TODAY && (
              <Typography size="xxx-small" family="mono" className={styles.Demo__todayLabel}>
                anchored here
              </Typography>
            )}
          </span>
        ))}
      </Scrollable>
    </div>
  )
}
