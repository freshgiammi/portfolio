import { createFileRoute } from "@tanstack/react-router"
import { useDialKit } from "dialkit"

import { useConfetti } from "@/components/effects/confetti"
import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE =
  "The reward for finishing something. Thrown as far as it goes, then dropped: the panel decides how far."

/** What building a burst costs, in milliseconds, with no layout read in the way. */
const COST = [
  { pieces: "6", build: "0.013" },
  { pieces: "26", build: "0.045" },
  { pieces: "60", build: "0.068" },
  { pieces: "200", build: "0.214" }
]

/** Where the time in one burst of 26 actually goes, in milliseconds. */
const WHERE = [
  { step: "Reading where it came from", quiet: "0.10", busy: "0.20" },
  { step: "Building the pieces", quiet: "0.045", busy: "0.045" },
  { step: "Everything after the click", quiet: "0", busy: "0" }
]

const SEO = {
  title: "Confetti",
  description: "Interactive confetti showcase: one hook, one burst, and no state anywhere.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/confetti/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft/confetti" }),
  component: ConfettiShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ConfettiShowcase() {
  return (
    <ShowcaseTemplate.Root>
      <ShowcaseTemplate.Header
        to="/craft/confetti"
        subtitle={SUBTITLE}
        githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/ui/confetti"
      />
      <ShowcaseTemplate.Demo dials>
        <Canvas />
      </ShowcaseTemplate.Demo>
      <ShowcaseTemplate.Lede>
        A payoff, kept apart from whatever earned it. One hook hands back a ref for where the burst comes from and a
        single function to set it off. The burst lands on the page and cleans itself up once its last piece does. On the
        blog it marks the final clap of a capped run, so spending your last one feels like an event instead of a button
        just quietly going dead.
      </ShowcaseTemplate.Lede>

      <ShowcaseTemplate.Section title="Two ways to leave">
        <ShowcaseTemplate.Prose>
          Every piece starts from the same point. The only real question is how much of the circle they&apos;re allowed
          to share between them, and that one number is the entire difference between the two things confetti can be.
        </ShowcaseTemplate.Prose>

        <ShowcaseTemplate.Split
          columns={[
            {
              title: "Popper",
              children: (
                <ShowcaseTemplate.Prose>
                  All 360 degrees, plus an upward shove added on top of whatever direction each piece already had. The
                  charge goes off underneath the paper rather than around it, so pieces aimed sideways tilt upward and
                  the ones aimed down barely go anywhere. It still opens on every side.
                </ShowcaseTemplate.Prose>
              )
            },
            {
              title: "Cannon",
              children: (
                <ShowcaseTemplate.Prose>
                  A cone, as wide or as narrow as you like, pointed wherever you like. This is usually what a button on
                  a page actually wants. The clap on the blog fires one straight up, because a full circle in a column
                  of text would waste half its paper on the paragraph underneath.
                </ShowcaseTemplate.Prose>
              )
            }
          ]}
        />

        <ShowcaseTemplate.Aside>
          Nothing else about an individual piece knows which shape it belongs to. Given an arc, each piece takes its own
          slice and wanders inside it. Perfectly even angles read as a diagram; fully random ones leave a gap on one
          side and a knot on the other.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Thrown, then dropped">
        <ShowcaseTemplate.Prose>
          The flight is really two separate motions that have to stay that way. The throw runs along whatever angle the
          piece was given and bleeds off speed the way drag does on something light, decaying rather than stopping
          outright. The fall is always straight down the page, no matter which way the piece was aimed, and it reaches
          its own small terminal speed almost immediately, so the last few stops descend by equal amounts in equal time.
          Anything still picking up speed at the end reads as a stone falling, not paper.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          Both motions are sampled by hand across eight keyframe stops, using a linear timing function throughout,
          because a single easing curve can&apos;t slow a throw down and speed a fall up at once. Gravity gets applied
          before the aim in the transform, which is the only way it avoids getting rotated sideways along with
          everything else.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="What it costs">
        <ShowcaseTemplate.Prose>
          A burst is a single call. Everything after that runs on a thread this page never touches. What the call itself
          costs, I measured on an actual production build rather than guessing.
        </ShowcaseTemplate.Prose>

        <ShowcaseTemplate.Split
          columns={[
            {
              title: "Building a burst",
              children: (
                <ShowcaseTemplate.Table caption="By piece count, in milliseconds">
                  <thead>
                    <tr>
                      <th scope="col">Pieces</th>
                      <th scope="col">To build</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COST.map(row => (
                      <tr key={row.pieces}>
                        <th scope="row">{row.pieces}</th>
                        <td>{row.build}</td>
                      </tr>
                    ))}
                  </tbody>
                </ShowcaseTemplate.Table>
              )
            },
            {
              title: "Where the time goes",
              children: (
                <ShowcaseTemplate.Table caption="One burst of 26, in milliseconds">
                  <thead>
                    <tr>
                      <th scope="col">Step</th>
                      <th scope="col">Quiet</th>
                      <th scope="col">Mid burst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WHERE.map(row => (
                      <tr key={row.step}>
                        <th scope="row">{row.step}</th>
                        <td>{row.quiet}</td>
                        <td>{row.busy}</td>
                      </tr>
                    ))}
                  </tbody>
                </ShowcaseTemplate.Table>
              )
            }
          ]}
        />

        <ShowcaseTemplate.Prose>
          A single piece costs roughly a microsecond to make, so the count is almost free; two hundred of them still fit
          inside a fifth of a frame. The interesting part is everything around that number. Asking the page where the
          burst actually came from costs more than building the whole burst does, because reading an element&apos;s
          position forces the browser to work out layout first, and that cost doubles again while a previous burst is
          still mid-flight. Firing from a bare point instead of an element skips all of that.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          That last row is really the whole point of the shape. Once the pieces land on the page, nothing here runs
          again. No timer, no state, no frame loop, no re-render of whatever fired it. The only JavaScript left running
          is a single listener counting pieces as they land, just so the burst knows when to remove itself.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Details worth knowing">
        <ShowcaseTemplate.List
          items={[
            "A burst lands on the document rather than inside the button, only borrowing its position from it. Otherwise one stray overflow rule clips it to a pill, and one stacking context buries it under a header.",
            "Colour and shape just cycle off nth-child instead of being generated. What a piece actually carries, per piece, is only where it's going and when it leaves.",
            "Whatever you pass the hook is only a default. Any of it can be overridden again at the call site, which is how the panel beside this demo changes a burst without rebuilding anything.",
            "Reduced motion shortens the flight rather than skipping it outright, since it's the last animation ending that actually removes the pieces."
          ]}
        />
      </ShowcaseTemplate.Section>
    </ShowcaseTemplate.Root>
  )
}

/** Burst shape is a runtime option, not two code paths, so cannon-only settings (aim, cone) live nested under their own key. */
function Canvas() {
  const dials = useDialKit("Confetti", {
    spray: { type: "select", options: ["popper", "cannon"], default: "popper" },
    pieces: [24, 4, 120, 1],
    distance: [110, 20, 260, 5],
    cannon: {
      aim: [0, -180, 180, 5],
      cone: [60, 5, 180, 5]
    }
  })

  const options: useConfetti.Options = {
    spray: dials.spray as useConfetti.Options["spray"],
    pieces: dials.pieces,
    distance: dials.distance,
    aim: dials.cannon.aim,
    cone: dials.cannon.cone
  }

  const { burst } = useConfetti(options)

  return (
    <div
      className={styles.Demo}
      onClick={event => {
        if (event.target !== event.currentTarget) return
        burst({ x: event.pageX, y: event.pageY })
      }}>
      <ShowcaseTemplate.Action icon={<Icon.ConfettiIcon size={18} />} onClick={event => burst(event.currentTarget)}>
        Fire
      </ShowcaseTemplate.Action>
      <Typography size="xxx-small" family="mono" render={<p />} className={styles.Demo__hint}>
        Or click the space around it.
      </Typography>
    </div>
  )
}
