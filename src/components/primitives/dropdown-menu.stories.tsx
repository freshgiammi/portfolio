import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"

import { DropdownMenu } from "./dropdown-menu"

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu.Root,
  subcomponents: {
    Trigger: DropdownMenu.Trigger,
    Portal: DropdownMenu.Portal,
    Positioner: DropdownMenu.Positioner,
    Popup: DropdownMenu.Popup,
    Item: DropdownMenu.Item,
    RadioGroup: DropdownMenu.RadioGroup,
    RadioItem: DropdownMenu.RadioItem,
    CheckboxItem: DropdownMenu.CheckboxItem,
    Group: DropdownMenu.Group,
    GroupLabel: DropdownMenu.GroupLabel,
    Separator: DropdownMenu.Separator
  }
} satisfies Meta<typeof DropdownMenu.Root>

export default meta

function Trigger({ children }: { children: React.ReactNode }) {
  return <DropdownMenu.Trigger render={<Button variant="secondary" />}>{children}</DropdownMenu.Trigger>
}

/** Click or keyboard-open the trigger; items close on select unless `keepOpen`. */
function MenuBody() {
  return (
    <>
      <DropdownMenu.Item icon={<Icon.PencilSimpleIcon size={14} />}>Rename</DropdownMenu.Item>
      <DropdownMenu.Item icon={<Icon.CopySimpleIcon size={14} />}>Duplicate</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item icon={<Icon.TrashIcon size={14} />} closeOnClick>
        Delete
      </DropdownMenu.Item>
    </>
  )
}

export const Items: StoryObj = {
  render: () => (
    <DropdownMenu.Root>
      <Trigger>Actions</Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Positioner>
          <DropdownMenu.Popup>
            <MenuBody />
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const RadioAndCheckboxGroups: StoryObj = {
  render: () => (
    <DropdownMenu.Root>
      <Trigger>View</Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Positioner>
          <DropdownMenu.Popup>
            <DropdownMenu.Group>
              <DropdownMenu.GroupLabel>Density</DropdownMenu.GroupLabel>
              <DropdownMenu.RadioGroup defaultValue="cozy">
                <DropdownMenu.RadioItem value="compact">Compact</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="cozy">Cozy</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="comfortable">Comfortable</DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.CheckboxItem defaultChecked>Show timestamps</DropdownMenu.CheckboxItem>
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
