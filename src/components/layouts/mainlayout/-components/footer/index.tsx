import { Link } from "@tanstack/react-router"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

const EXTERNAL_LINKS = [
  { href: "https://github.com/freshgiammi", label: "GitHub", Icon: Icon.GithubLogoIcon },
  { href: "https://x.com/freshgiammi", label: "X", Icon: Icon.XLogoIcon },
  { href: "https://github.com/freshgiammi/portfolio", label: "Source", Icon: Icon.CodeIcon },
  { href: "/feed.xml", label: "RSS", Icon: Icon.RssIcon }
]

export function Footer() {
  return (
    <footer className={styles.Footer}>
      <Typography size="xx-small" weight="regular">
        © {new Date().getFullYear()} freshgiammi
      </Typography>

      <div className={styles.Footer__links}>
        {EXTERNAL_LINKS.map(({ href, label, Icon: LinkIcon }) => (
          <Typography
            key={label}
            size="xx-small"
            weight="regular"
            render={
              <a
                href={href}
                aria-label={label}
                title={label}
                rel="noreferrer noopener"
                target={href.startsWith("http") ? "_blank" : undefined}
              />
            }>
            <LinkIcon size={14} />
          </Typography>
        ))}
        <Typography size="xx-small" weight="regular" render={<Link to="/ai-manifesto" />}>
          <Icon.RobotIcon size={14} />
          AI manifesto
        </Typography>
      </div>
    </footer>
  )
}
