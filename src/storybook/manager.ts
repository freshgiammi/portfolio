import { addons, types } from "storybook/manager-api"

import { ThemeTool } from "./addons/theme-switcher"

const ADDON_ID = "theme-switcher"
const TOOL_ID = `${ADDON_ID}/tool`

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "Theme",
    match: () => true,
    render: ThemeTool
  })
})
