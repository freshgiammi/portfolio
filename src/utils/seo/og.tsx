import fs from "node:fs/promises"
import path from "node:path"

import instrumentSerif400 from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff?inline"
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff?inline"
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff?inline"
import { render } from "takumi-js"

// `?inline` resolves each font to a data uri at build time, so the fonts travel inside the bundle.
// The worker this runs on has no filesystem to read them from.
const FONTS = [
  { name: "Inter", data: () => decodeDataUri(inter400), weight: 400, style: "normal" },
  { name: "Inter", data: () => decodeDataUri(inter600), weight: 600, style: "normal" },
  { name: "Instrument Serif", data: () => decodeDataUri(instrumentSerif400), weight: 400, style: "normal" }
] as const

function decodeDataUri(dataUri: string): Uint8Array {
  const binary = atob(dataUri.slice(dataUri.indexOf(",") + 1))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Straight off disk: this module only ever runs at build time, or in dev on the way to it. */
async function loadImage(src: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await fs.readFile(path.join(process.cwd(), "public", src.replace(/^\//, ""))))
  } catch {
    return null
  }
}

export async function generateOGImage(opts: {
  title: string
  description?: string | null
  image?: string | null
  emoji?: string | null
}): Promise<Uint8Array> {
  const WIDTH = 1200
  const HEIGHT = 630
  const DARK_BG = "#0b0c10"
  const SHELL_BG = "#111319"
  const CARD_BG = "#14161d"
  const CARD_BORDER = "rgba(255, 255, 255, 0.12)"
  const TITLE_COLOR = "#f4f5f8"
  const BODY_COLOR = "rgba(239, 241, 245, 0.82)"
  const MUTED_COLOR = "rgba(239, 241, 245, 0.56)"
  const BRAND = "freshgiammi.dev"
  const BRAND_EMOJI = "👨🏻‍💻"

  const imageBytes = opts.image ? await loadImage(opts.image) : null
  const imageSrc = imageBytes && opts.image ? opts.image : null

  const png = await render(
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        background: `radial-gradient(circle at 85% -10%, rgba(255, 255, 255, 0.07), transparent 42%), linear-gradient(180deg, ${SHELL_BG} 0%, ${DARK_BG} 100%)`,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 28,
          border: `1px solid ${CARD_BORDER}`,
          background: CARD_BG,
          boxShadow: "0 24px 90px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {imageSrc && (
          <div style={{ position: "relative", height: 268 }}>
            <img
              src={imageSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(20, 22, 29, 1) 0%, rgba(20, 22, 29, 0.94) 22%, rgba(20, 22, 29, 0.45) 56%, rgba(20, 22, 29, 0) 86%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: 72,
                background: "linear-gradient(to bottom, rgba(20, 22, 29, 0), rgba(20, 22, 29, 1))",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "38px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{BRAND_EMOJI}</span>
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: "0.04em",
                  color: MUTED_COLOR,
                  textTransform: "uppercase",
                }}
              >
                {BRAND}
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: imageSrc ? 56 : 62,
              fontWeight: 400,
              lineHeight: 1.08,
              color: TITLE_COLOR,
              fontFamily: "Instrument Serif",
              marginBottom: opts.description ? 16 : 0,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            {opts.emoji && <span style={{ fontSize: "0.8em", lineHeight: 1 }}>{opts.emoji}</span>}
            {opts.title}
          </div>

          {opts.description && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.42,
                color: BODY_COLOR,
                maxWidth: 900,
              }}
            >
              {opts.description}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      format: "png",
      fonts: [...FONTS],
      // Handed over pre-fetched and keyed by the same src the `img` uses, so the renderer never
      // reaches for the network itself.
      ...(imageSrc && imageBytes && { images: [{ src: imageSrc, data: imageBytes }] }),
    },
  )

  return png
}
