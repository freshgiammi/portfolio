import { createFileRoute } from "@tanstack/react-router"
import { Image } from "@unpic/react"
import type { FilesInFolder } from "virtual:static-assets"
import { staticAssets } from "virtual:static-assets"

import { Typography } from "@/components/ui/typography"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./index.module.scss"

const SEO = {
  title: "Personal — freshgiammi",
  description: "About Gianmarco Rengucci: background, interests, and the path behind freshgiammi."
} satisfies PageSeo

export const Route = createFileRoute("/_main/about/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/about" }),
  component: PersonalPage
})

const HOBBIES = [
  { icon: "🐧", label: "Linux" },
  { icon: "🔌", label: "Hardware Tinkering" },
  { icon: "☕", label: "Coffee" },
  { icon: "🌐", label: "Open Source" },
  { icon: "📷", label: "Photography" },
  { icon: "🏃", label: "Running" }
]

const ABOUT_IMAGES: Array<FilesInFolder<"images/about/">> = [
  "images/about/photo-01.jpg",
  "images/about/photo-02.jpg",
  "images/about/photo-03.jpg",
  "images/about/photo-04.jpg",
  "images/about/photo-05.jpg",
  "images/about/photo-06.jpg",
  "images/about/photo-08.jpg",
  "images/about/photo-10.jpg"
]

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function PersonalPage() {
  return (
    <div className={styles.Page}>
      <div className={styles.Intro}>
        <div className={styles.Heading}>
          <Typography size="x-large" family="serif">
            Hello there!
          </Typography>
          <Typography size="small" weight="regular" className={styles.IntroText}>
            I&apos;m <strong>Gianmarco Rengucci</strong> — but I usually go by <strong>freshgiammi</strong> pretty much
            anywhere.
          </Typography>
        </div>

        <Typography size="small" weight="regular" className={styles.IntroText}>
          I studied{" "}
          <a
            href="https://www.unimi.it/en/education/bachelor/computer-science-new-media-communications"
            target="_blank"
            rel="noopener noreferrer">
            Computer Science for New Media Communications
          </a>{" "}
          at Università Degli Studi di Milano, where my thesis focused on an <b>agent-based epidemic model</b> built on
          multilayer networks.
        </Typography>
        <Typography size="small" weight="regular" className={styles.IntroText}>
          Most machines at home run <b>GNU/Linux</b>, including a few that never volunteered. Away from the screen,
          I&apos;m usually out with a camera, tinkering with electronics, or dialing in espresso.
        </Typography>
        <Typography size="small" weight="regular" className={styles.IntroText}>
          I care about <b>building things that matter</b>, whether it&apos;s software, communities, or a really good cup
          of coffee.
        </Typography>

        <div className={styles.HobbyStrip}>
          {HOBBIES.map(h => (
            <Typography key={h.label} size="x-small" className={styles.HobbyPill} render={<span />}>
              <Typography size="small" render={<span />}>
                {h.icon}
              </Typography>
              {h.label}
            </Typography>
          ))}
        </div>
      </div>

      <div className={styles.PhotoGrid}>
        {ABOUT_IMAGES.map((path, i) => (
          <div key={path} className={styles.GridCell}>
            <Image src={staticAssets(path)} alt={`Photo ${i + 1}`} layout="fullWidth" className={styles.GridImg} />
          </div>
        ))}
      </div>
    </div>
  )
}
