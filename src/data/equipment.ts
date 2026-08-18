import { type OGImage, previewUrl } from "../../config/vite-plugins/link-previews/previewUrl.ts"

/** Groups the list into columns. Declared in the order the columns should read, left to right. */
export const EQUIPMENT_DOMAINS = ["Computer", "Audio", "Gaming", "Photo", "Coffee", "Around the house"] as const
type EquipmentDomain = (typeof EQUIPMENT_DOMAINS)[number]

export type EquipmentItem = {
  name: string
  note: string
  domain: EquipmentDomain
  /** A product page to preview on hover. Left off for anything without one worth linking to. */
  url?: string
  /** `previewUrl(url)`'s answer for the same page, resolved at build time — see
      `config/vite-plugins/link-previews`. */
  image?: OGImage
}

export const EQUIPMENT: Array<EquipmentItem> = [
  {
    name: 'MacBook Pro 16" M2 Pro',
    note: "daily driver",
    domain: "Computer",
    url: "https://support.apple.com/it-it/111838",
    image: previewUrl("https://support.apple.com/it-it/111838")
  },
  { name: "Logitech MX Master (1st gen)", note: "the original", domain: "Computer" },
  { name: "Zuoya GMK87", note: "Outemu Silent Peach V2 switches", domain: "Computer" },
  { name: "BenQ PD27051", note: "colour-accurate enough", domain: "Computer" },
  { name: "Sony WH-1000XM3", note: "still holding up", domain: "Audio" },
  { name: "Pro-Ject Debut II", note: "spins vinyl", domain: "Audio" },
  { name: "JVC RX-410V", note: "vintage receiver, still going", domain: "Audio" },
  {
    name: "Steam Deck",
    note: "for couch sessions",
    domain: "Gaming",
    url: "https://www.steamdeck.com/",
    image: previewUrl("https://www.steamdeck.com/")
  },
  { name: "Steam Machine", note: "living room rig", domain: "Gaming" },
  { name: "Ricoh FF-3AF", note: "pocket film shooter", domain: "Photo" },
  { name: "Gaggia Viva Style", note: "no frills, does the job", domain: "Coffee" },
  {
    name: "Pebble Time 2",
    note: "the prodigal son returns",
    domain: "Around the house",
    url: "https://repebble.com/",
    image: previewUrl("https://repebble.com/")
  },
  {
    name: "TRMNL OG",
    note: "the e-ink dashboard",
    domain: "Around the house",
    url: "https://usetrmnl.com/",
    image: previewUrl("https://usetrmnl.com/")
  },
  { name: "Raspberry Pi 4", note: "self-hosting experiments", domain: "Around the house" },
  { name: "Various plants 🌱", note: "still alive (mostly)", domain: "Around the house" }
]

/** The bare host a linked item points at, which stands in for the product page everywhere it's shown. */
export function equipmentHost(item: EquipmentItem): string | undefined {
  return item.url?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
}
