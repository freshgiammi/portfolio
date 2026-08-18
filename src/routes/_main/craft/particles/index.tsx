import { createFileRoute } from "@tanstack/react-router"
import { useDialKit } from "dialkit"
import type { ReactNode } from "react"
import { useCallback, useEffect, useRef } from "react"

import { useParticles } from "@/components/effects/particles"
import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE = "Tap to throw, hold for a storm, and use the panel to decide what a storm is."

/** Five, not four: the sideways step nearly repeats every fourth particle, so a four-item cycle would land in visible stripes. */
const EMOJI = ["🌸", "🍋", "🫧", "🌶️", "🍄"]

/** More than one kind, so a storm has to prove it can cache several drawings at a time. */
const ICONS = [
  <Icon.SparkleIcon key="sparkle" size={14} weight="fill" />,
  <Icon.StarFourIcon key="star" size={14} weight="fill" />,
  <Icon.HeartIcon key="heart" size={14} weight="fill" />,
  <Icon.LightningIcon key="lightning" size={14} weight="fill" />,
  <Icon.DropIcon key="drop" size={14} weight="fill" />
]

/**
 * What a single particle costs to throw, in milliseconds, against how many are already in the air:
 * shipped (DOM append) vs. rendered as React children (reconciles the whole flying list).
 */
const COST = [
  { flying: "none", dom: "0.003", react: "0.33" },
  { flying: "10", dom: "0.003", react: "0.37" },
  { flying: "40", dom: "0.003", react: "0.50" },
  { flying: "100", dom: "0.003", react: "0.75" }
]

/** Frame gaps while holding the volley for three seconds, worst of three runs, in milliseconds. */
const FRAMES = [
  { build: "This build, emoji", median: "8.3", worst: "17.0", missed: "0" },
  { build: "This build, icons", median: "8.3", worst: "17.7", missed: "0" },
  { build: "As components, emoji", median: "8.3", worst: "33.9", missed: "15" },
  { build: "As components, icons", median: "8.4", worst: "90.8", missed: "19" }
]

/** Held down, the gap between particles falls from this to `FASTEST`, and the tap becomes a storm. */
const SLOWEST = 140
const FASTEST = 28
/** How long the ramp takes to get there. Long enough to feel like it is winding up. */
const RAMP = 1400

const SEO = {
  title: "Particles",
  description: "Interactive particle emitter showcase: one hook that throws, one that flies, and nothing else.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/particles/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft/particles" }),
  component: ParticlesShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ParticlesShowcase() {
  return (
    <ShowcaseTemplate.Root>
      <ShowcaseTemplate.Header
        to="/craft/particles"
        subtitle={SUBTITLE}
        githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/ui/particles"
      />
      <ShowcaseTemplate.Demo dials>
        <Canvas />
      </ShowcaseTemplate.Demo>
      <ShowcaseTemplate.Lede>
        This is the feedback that makes a tap feel like it landed, kept apart from whatever you tapped. A single hook
        hands back a ref for where things should fly from and one function to throw them, and each particle deletes
        itself the moment its own animation ends. I&apos;d written almost this same logic twice, once for the reaction
        button and once for the waving hand in the hero, before finally pulling it out into its own hook.
      </ShowcaseTemplate.Lede>

      <ShowcaseTemplate.Section title="Thrown, not rendered">
        <ShowcaseTemplate.Prose>
          A particle has no state anyone can act on, nothing reads it, and it&apos;s gone a beat later. So it never goes
          through React at all. Putting it through the emitter&apos;s render would mean re-rendering a component on
          every single tap for something nobody can even observe, so instead a tap just builds a <code>span</code>,
          appends it to the box, and nothing above it moves.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          Emitting is a call, not a render. A button says <code>emit(&quot;+3&quot;)</code> in its click handler and
          moves on. There&apos;s no list to think about, because there is no list.
        </ShowcaseTemplate.Aside>
        <ShowcaseTemplate.Prose>
          Text gets written straight onto that element. Anything richer, an icon for instance, is a React tree, and
          React only ever draws each kind once: the first sparkle gets rendered properly, its DOM is kept around, and
          every sparkle after that is just a clone. Hold the button down as long as you like, five icons in this demo
          will always mean five renders, never more.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="What it costs">
        <ShowcaseTemplate.Prose>
          That&apos;s not a guess, I measured it. Both columns below are the exact same storm, run on the same page: one
          as it actually ships, and one with every particle rendered as a child of the emitter instead.
        </ShowcaseTemplate.Prose>

        <ShowcaseTemplate.Table caption="Cost of throwing one particle, in milliseconds">
          <thead>
            <tr>
              <th scope="col">Already flying</th>
              <th scope="col">Built</th>
              <th scope="col">Rendered</th>
            </tr>
          </thead>
          <tbody>
            {COST.map(row => (
              <tr key={row.flying}>
                <th scope="row">{row.flying}</th>
                <td>{row.dom}</td>
                <td>{row.react}</td>
              </tr>
            ))}
          </tbody>
        </ShowcaseTemplate.Table>

        <ShowcaseTemplate.Prose>
          It&apos;s basically flat versus growing. A thrown element costs one append no matter what else is flying; a
          rendered one has to reconcile every particle still in the air. Hold the button for three seconds with the
          handful dial cranked to twenty, and the emitter puts 460 particles on screen at once.
        </ShowcaseTemplate.Prose>

        <ShowcaseTemplate.Table caption="Frame gaps during a three second volley, in milliseconds">
          <thead>
            <tr>
              <th scope="col">Storm</th>
              <th scope="col">Median</th>
              <th scope="col">Worst</th>
              <th scope="col">Frames missed</th>
            </tr>
          </thead>
          <tbody>
            {FRAMES.map(row => (
              <tr key={row.build}>
                <th scope="row">{row.build}</th>
                <td>{row.median}</td>
                <td>{row.worst}</td>
                <td>{row.missed}</td>
              </tr>
            ))}
          </tbody>
        </ShowcaseTemplate.Table>

        <ShowcaseTemplate.Prose>
          Icons are where the two approaches really part ways. Drawing once and cloning gets you a component particle
          for roughly the price of a text one. Rendering, on the other hand, runs the full component for every particle
          and then tears all 460 of them down one animation at a time. That last row in the table is a tenth of a second
          where the page just freezes, right in the middle of whatever you were holding.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Where they land">
        <ShowcaseTemplate.Prose>
          Random placement was the first thing I tried, and it clumps, because that&apos;s just what randomness does.
          Throw twenty particles at once and nine times out of ten, two of them land right on top of each other. So
          instead, every particle gets its own slice of the spread and wanders inside it, stepped forward by an
          irrational fraction so each new one lands in the biggest gap the ones before it left behind.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          The step itself uses the plastic number&apos;s powers instead of the golden ratio&apos;s. The golden ratio is
          the better-known choice, but it&apos;s only optimal in one dimension, and a particle has two to fill. Across
          400 test volleys of twenty particles each, the closest pair in any single volley went from actually touching
          to 4.6px apart.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          One catch I only found by watching it run for a while: that step nearly repeats every fourth particle, so
          content cycling in sets of four came out in four vertical stripes. Making the emoji and icon lists five items
          long instead of four turned out to be the cheaper half of fixing it.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Details worth knowing">
        <ShowcaseTemplate.List
          items={[
            <span key="animationend">
              Every particle removes itself on <code>animationend</code>. Nothing runs on a timer, so a backgrounded tab
              never comes back to a backlog.
            </span>,
            "Drift, rise and tilt come from a spread the caller passes, so a heading throws further than a button without either knowing about the other.",
            "The ref names the box by default, but emit takes one too, so a row of cells can share a single hook and pass whichever was tapped.",
            "Colour is inherited, not configured. That's how one hook can serve a themed accent, a fixed tone and a halo, all without a single colour prop.",
            "Reduced motion shortens the flight rather than removing it outright, since the animation ending is what removes the element from the page."
          ]}
        />
      </ShowcaseTemplate.Section>
    </ShowcaseTemplate.Root>
  )
}

function Canvas() {
  // Named for the panel, and grouped the way someone tuning them would look for them: what leaves,
  // and how far it gets.
  const dials = useDialKit("Particles", {
    throws: { type: "select", options: ["counts", "emoji", "icons"], default: "counts" },
    size: { type: "select", options: ["xxx-small", "xx-small", "x-small", "small", "medium"], default: "xx-small" },
    handful: [1, 1, 20, 1],
    spread: {
      drift: [40, 0, 160, 2],
      rise: [34, 4, 160, 2],
      tilt: [40, 0, 180, 5]
    }
  })

  const throws = (count: number) => {
    if (dials.throws === "emoji") return EMOJI[count % EMOJI.length]!
    if (dials.throws === "icons") return ICONS[count % ICONS.length]
    return `+${count}`
  }

  return (
    <div className={styles.Demo}>
      <Emitter
        spread={{ ...dials.spread, size: dials.size as useParticles.Options["size"] }}
        handful={dials.handful}
        throws={throws}
      />
      <Typography size="xxx-small" family="mono" render={<p />} className={styles.Demo__hint}>
        Tap to throw. Hold, and it winds up into a storm.
      </Typography>
    </div>
  )
}

type EmitterProps = {
  spread: useParticles.Options
  /** What this one throws, given how many times it has been tapped. */
  throws: (count: number) => ReactNode
  /** How many leave at once. There is no batch call: a handful is a loop, and a loop is cheap. */
  handful?: number
}

function Emitter({ spread, throws, handful = 1 }: EmitterProps) {
  // No ref: the press already carries the element the particles should leave from.
  const { emit } = useParticles(spread)
  // Refs, not state: nothing on screen reads these, and a held button shouldn't re-render 30x/second.
  const taps = useRef(0)
  const held = useRef<number>(undefined)

  const start = (event: React.PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget
    // Pointer capture keeps the storm going even if the finger wanders off the button.
    try {
      box.setPointerCapture(event.pointerId)
    } catch {
      /* empty */
    }

    // performance.now() shares rAF's time origin; last=began prevents double-emitting on frame 1.
    const began = performance.now()
    let last = began

    const throwSome = () => {
      for (let i = 0; i < handful; i++) {
        taps.current += 1
        emit(throws(taps.current), { from: box })
      }
    }

    const wind = (now: number) => {
      held.current = requestAnimationFrame(wind)

      // The gap shrinks the longer it is held, so a press starts as a trickle and ends as a storm.
      const wound = Math.min((now - began) / RAMP, 1)
      const gap = SLOWEST + (FASTEST - SLOWEST) * wound
      if (now - last < gap) return

      last = now
      throwSome()
    }

    throwSome()
    held.current = requestAnimationFrame(wind)
  }

  const stop = useCallback(() => {
    if (held.current !== undefined) cancelAnimationFrame(held.current)
    held.current = undefined
  }, [])

  useEffect(() => stop, [stop])

  return (
    <ShowcaseTemplate.Action
      icon={<Icon.SparkleIcon size={18} />}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      // Holding the button is the interaction; a long-press must not read as a right-click.
      onContextMenu={event => event.preventDefault()}>
      Throw
    </ShowcaseTemplate.Action>
  )
}
