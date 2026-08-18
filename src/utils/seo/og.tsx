import instrumentSerif400 from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff?inline"
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff?inline"
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff?inline"
import { render } from "takumi-js"

import { OG_CARD_HEIGHT, OG_CARD_WIDTH, OGCard } from "@/components/ui/ogcard"

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

export async function generateOGImage(opts: Parameters<typeof OGCard>[0]): Promise<Uint8Array<ArrayBuffer>> {
  const png = await render(<OGCard {...opts} />, {
    width: OG_CARD_WIDTH,
    height: OG_CARD_HEIGHT,
    format: "png",
    fonts: [...FONTS]
  })

  return png
}
