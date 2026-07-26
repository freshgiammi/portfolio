/** @type {import("prettier").Config} */
export default {
  $schema: "http://json.schemastore.org/prettierrc",
  semi: false,
  tabWidth: 2,
  printWidth: 120,
  trailingComma: "none",
  bracketSameLine: true,
  bracketSpacing: true,
  arrowParens: "avoid",
  overrides: [{ files: ["*.html"], options: { printWidth: 300 } }]
}
