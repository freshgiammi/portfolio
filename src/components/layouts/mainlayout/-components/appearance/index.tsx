import { Checkbox } from "@base-ui/react/checkbox"
import { Collapsible } from "@base-ui/react/collapsible"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import type { ReactNode } from "react"

import { Icon } from "@/components/primitives/icons"
import { Popover } from "@/components/primitives/popover"
import { Scrollable } from "@/components/primitives/scrollable"
import { Tooltip } from "@/components/primitives/tooltip"
import { Typography } from "@/components/primitives/typography"
import type { Preferences } from "@/preferences"
import { usePreferences } from "@/preferences/context"
import { type AccentKey, ACCENTS, PRESETS, type ThemeKey, THEMES } from "@/theme"
import { useTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

const THEME_ICONS: Record<ThemeKey, ReactNode> = {
  light: <Icon.SunIcon />,
  dark: <Icon.MoonIcon />,
  system: <Icon.DesktopIcon />
}

const DECORATIONS = [
  { key: "grain", label: "Paper grain", hint: "Fibre under the page" },
  { key: "backdrop", label: "Backdrop", hint: "Shapes behind the page" }
] as const satisfies ReadonlyArray<{ key: keyof Preferences; label: string; hint: string }>

type AppearanceProps = Popover.Root.Props

export function Appearance(props: AppearanceProps) {
  const { theme, accent, setTheme } = useTheme()
  const { preferences, setPreference } = usePreferences()

  const currentPreset = PRESETS.find(p => p.theme === theme && p.accent === accent)?.key ?? ""

  return (
    <Popover.Root {...props}>
      <Popover.Trigger className={styles.Appearance__trigger} aria-label="Appearance">
        <Icon.PaletteIcon />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="end">
          <Popover.Popup className={styles.Appearance__popup}>
            <section className={styles.Appearance__section}>
              <Typography size="xxx-small" family="mono" className={styles.Appearance__label}>
                Presets
              </Typography>

              <RadioGroup
                value={currentPreset}
                onValueChange={value => {
                  const preset = PRESETS.find(p => p.key === value)
                  if (!preset) return
                  // Preset pairs theme + palette (accent) — both must be persisted, not just theme.
                  setTheme({ theme: preset.theme, accent: preset.accent })
                }}
                className={styles.Appearance__presets}>
                {PRESETS.map(preset => (
                  <Radio.Root key={preset.key} value={preset.key} className={styles.Appearance__preset}>
                    <span className={styles.Appearance__presetMeta}>
                      <span className={styles.Appearance__presetDot} data-accent={preset.accent} />
                      <span className={styles.Appearance__presetSlash} aria-hidden>
                        /
                      </span>
                      <span className={styles.Appearance__presetTheme}>
                        {preset.theme === "dark" ? <Icon.MoonIcon size={10} /> : <Icon.SunIcon size={10} />}
                      </span>
                    </span>
                    <Typography size="xxx-small" family="mono" render={<span />}>
                      {preset.label}
                    </Typography>
                  </Radio.Root>
                ))}
              </RadioGroup>
            </section>

            {preferences.unlocked ? (
              <>
                <section className={styles.Appearance__section}>
                  <Typography size="xxx-small" family="mono" className={styles.Appearance__label}>
                    Theme
                  </Typography>

                  <RadioGroup
                    value={theme}
                    onValueChange={(value: ThemeKey) => setTheme({ theme: value })}
                    className={styles.Appearance__themes}>
                    {(Object.entries(THEMES) as Array<[ThemeKey, (typeof THEMES)[ThemeKey]]>).map(
                      ([key, { label }]) => (
                        <Radio.Root key={key} value={key} className={styles.Appearance__theme}>
                          {THEME_ICONS[key]}
                          <Typography size="xxx-small" family="mono" render={<span />}>
                            {label}
                          </Typography>
                        </Radio.Root>
                      )
                    )}
                  </RadioGroup>
                </section>

                <section className={styles.Appearance__section}>
                  <Typography size="xxx-small" family="mono" className={styles.Appearance__label}>
                    Accent
                  </Typography>

                  <Tooltip.Provider>
                    <Scrollable scrollbar="hover" contentClassName={styles.Appearance__hues}>
                      <RadioGroup
                        value={accent}
                        onValueChange={(value: AccentKey) => setTheme({ accent: value })}
                        className={styles.Appearance__hueRow}>
                        {(Object.entries(ACCENTS) as Array<[AccentKey, (typeof ACCENTS)[AccentKey]]>).map(
                          ([key, { label }]) => (
                            <Tooltip.Root key={key}>
                              <Tooltip.Trigger
                                render={
                                  <Radio.Root value={key} aria-label={label} className={styles.Appearance__hue} />
                                }
                                data-accent={key}
                              />
                              <Tooltip.Portal>
                                <Tooltip.Positioner side="bottom">
                                  <Tooltip.Popup>{label}</Tooltip.Popup>
                                </Tooltip.Positioner>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          )
                        )}
                      </RadioGroup>
                    </Scrollable>
                  </Tooltip.Provider>
                </section>

                <Collapsible.Root className={styles.Appearance__decoration}>
                  <Collapsible.Trigger className={styles.Appearance__decorationTrigger}>
                    <Icon.CaretRightIcon size={12} />
                    <Typography size="xxx-small" family="mono" render={<span />}>
                      Decoration
                    </Typography>
                  </Collapsible.Trigger>

                  <Collapsible.Panel className={styles.Appearance__decorationPanel}>
                    <Scrollable scrollbar="hover" maxHeight={132} contentClassName={styles.Appearance__switches}>
                      {DECORATIONS.map(({ key, label, hint }) => (
                        <Checkbox.Root
                          key={key}
                          checked={preferences[key]}
                          onCheckedChange={checked => {
                            const patch: Partial<Preferences> = {}
                            patch[key] = checked
                            setPreference(patch)
                          }}
                          className={styles.Appearance__switch}>
                          <span className={styles.Appearance__box}>
                            <Checkbox.Indicator className={styles.Appearance__tick}>
                              <Icon.CheckIcon size={10} weight="bold" />
                            </Checkbox.Indicator>
                          </span>

                          <span className={styles.Appearance__switchText}>
                            <Typography size="xxx-small" family="mono" render={<span />}>
                              {label}
                            </Typography>
                            <Typography
                              size="xxx-small"
                              weight="regular"
                              render={<span />}
                              className={styles.Appearance__hint}>
                              {hint}
                            </Typography>
                          </span>
                        </Checkbox.Root>
                      ))}
                    </Scrollable>
                  </Collapsible.Panel>
                </Collapsible.Root>
              </>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export declare namespace Appearance {
  export type Props = AppearanceProps
}
