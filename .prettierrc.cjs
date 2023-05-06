/**
 * @type {import('prettier').Options}
 */
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  bracketSameLine: true,

  pluginSearchDirs: ["./node_modules"],
  plugins: ["@plasmohq/prettier-plugin-sort-imports"],

  importOrder: ["^@plasmohq/(.*)$", "^@plasmo/(.*)$", "^~(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}
