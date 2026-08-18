import type { ComponentType } from "react"

import type { CardStyleProps } from "./-shared"
import {
  DESCRIPTION_MAX_LENGTH,
  GRAIN_TILE_DARK,
  GRAIN_TILE_LIGHT,
  OG_CARD_HEIGHT,
  OG_CARD_WIDTH,
  TEXT_MAX_WIDTH,
  truncate
} from "./-shared"
import { CraftBackdrop } from "./-styles/craft"
import { DefaultBackdrop } from "./-styles/default"
import { PostBackdrop } from "./-styles/post"

type OGCardVariant = "post" | "craft" | "default"

export { OG_CARD_HEIGHT, OG_CARD_WIDTH }

/**
 * A card style is only ever a background: the ground fill, a grain tile matching its brightness,
 * optional decorative layers (shapes, frames) behind the text, and the ink colours the one shared
 * text layout is painted with. Nothing here may move or restyle the text itself - every variant
 * sets the same type, at the same size, in the same place.
 */
type CardStyle = {
  ground: string
  grain: string
  Backdrop?: ComponentType
  text: { title: string; body: string; muted: string }
}

// Derived from the same dark-theme values `tokens.scss` actually computes, not an unrelated
// invented palette; there's no live theme here, so these always render the dark variant.
const DARK_TEXT = {
  title: "#eeece8", // ~= --text-default
  body: "rgba(238, 236, 232, 0.78)",
  muted: "rgba(238, 236, 232, 0.56)"
}

const STYLES: Record<OGCardVariant, CardStyle> = {
  // Writing: shapes fading into the top-right corner.
  post: {
    ground: "radial-gradient(circle at 88% -8%, rgba(255, 255, 255, 0.06), transparent 42%), #1a1815",
    grain: GRAIN_TILE_DARK,
    Backdrop: PostBackdrop,
    text: DARK_TEXT
  },
  // Everything else: the mirror image - a shape-band along the bottom edge.
  default: {
    ground: "radial-gradient(circle at -8% 108%, rgba(255, 255, 255, 0.05), transparent 42%), #1a1815",
    grain: GRAIN_TILE_DARK,
    Backdrop: DefaultBackdrop,
    text: DARK_TEXT
  },
  // Craft: the print - paper-white ground under scattered tide-blue shapes, framed by a mat.
  craft: {
    ground: "#eee9e2",
    grain: GRAIN_TILE_LIGHT,
    Backdrop: CraftBackdrop,
    text: {
      title: "#262220",
      body: "rgba(38, 34, 32, 0.78)",
      muted: "rgba(38, 34, 32, 0.56)"
    }
  }
}

type OGCardProps = CardStyleProps & {
  /** Which card background renders. Derived from the path for real pages - see `variantFromPath`. */
  variant?: OGCardVariant
}

export function OGCard({ variant = "default", ...content }: OGCardProps) {
  const style = STYLES[variant]

  return (
    <div
      style={{
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        background: style.ground,
        fontFamily: "Inter",
        position: "relative"
      }}>
      {style.Backdrop && <style.Backdrop />}

      {/* The noise can't share the root's `background`: the shorthand resets background-image, so
          one element carries one or the other. On its own layer it also sits above any backdrop,
          so shapes read as grainy too. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: style.grain,
          backgroundRepeat: "repeat"
        }}
      />

      <CardContent content={content} colors={style.text} />
    </div>
  )
}

export declare namespace OGCard {
  export type Props = OGCardProps
}

/** The one text layout every variant shares: label pinned top, title block anchored bottom-left. */
function CardContent({
  content: { title, description, emoji, section },
  colors: { title: titleColor, body, muted }
}: {
  content: CardStyleProps
  colors: CardStyle["text"]
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "48px 64px 56px" }}>
      {(emoji || section) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {emoji && <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>}
          {section && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: muted
              }}>
              {section}
            </span>
          )}
        </div>
      )}

      {/* An empty flexible spacer, not `justifyContent: flex-end` on the column itself: that would
          anchor every child (including the top row above) to the bottom too. This pushes only the
          title block down, leaving the section label pinned at the top. */}
      <div style={{ flex: 1 }} />

      <div
        style={{
          fontSize: 54,
          fontWeight: 400,
          lineHeight: 1.12,
          color: titleColor,
          fontFamily: "Instrument Serif",
          marginBottom: description ? 14 : 0,
          letterSpacing: "-0.01em",
          maxWidth: TEXT_MAX_WIDTH
        }}>
        {title}
      </div>

      {description && (
        <div style={{ fontSize: 22, lineHeight: 1.42, color: body, maxWidth: TEXT_MAX_WIDTH }}>
          {truncate(description, DESCRIPTION_MAX_LENGTH)}
        </div>
      )}
    </div>
  )
}
