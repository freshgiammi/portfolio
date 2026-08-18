import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Icon } from "@/components/primitives/icons"

import { Menu } from "./index"

const meta = {
  title: "Primitives/Menu",
  component: Menu.Popup,
  subcomponents: { Item: Menu.Item, GroupLabel: Menu.GroupLabel, Separator: Menu.Separator }
} satisfies Meta<typeof Menu.Popup>

export default meta

/** A static composition, since these parts carry no behaviour of their own. */
export const Composition: StoryObj = {
  render: () => (
    <div style={{ width: "fit-content", padding: "2rem" }}>
      <Menu.Popup>
        <Menu.GroupLabel>File</Menu.GroupLabel>
        <Menu.Item icon={<Icon.PencilSimpleIcon size={14} />}>Rename</Menu.Item>
        <Menu.Item icon={<Icon.CopySimpleIcon size={14} />}>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Icon.TrashIcon size={14} />} indicator={<Icon.CheckIcon size={12} />}>
          Delete
        </Menu.Item>
      </Menu.Popup>
    </div>
  )
}

/** Without an icon the label still lines up with icon'd rows. */
export const WithAndWithoutIcons: StoryObj = {
  render: () => (
    <div style={{ width: "fit-content", padding: "2rem" }}>
      <Menu.Popup>
        <Menu.Item icon={<Icon.GithubLogoIcon size={14} />}>With an icon</Menu.Item>
        <Menu.Item>Without one</Menu.Item>
      </Menu.Popup>
    </div>
  )
}
