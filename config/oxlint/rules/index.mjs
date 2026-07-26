import { readdirSync } from "fs"
import { basename, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ruleFiles = readdirSync(__dirname).filter(file => file.endsWith(".mjs") && file !== "index.mjs")

const rulesEntries = await Promise.all(
  ruleFiles.map(async file => {
    const ruleName = basename(file, ".mjs")
    const module = await import(`./${file}`)
    return [ruleName, module.default]
  })
)

export default {
  rules: Object.fromEntries(rulesEntries)
}
