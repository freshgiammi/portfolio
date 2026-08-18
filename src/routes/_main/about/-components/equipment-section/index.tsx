import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { PreviewCard } from "@/components/primitives/preview-card"
import { Typography } from "@/components/primitives/typography"
import { EQUIPMENT, EQUIPMENT_DOMAINS, equipmentHost, type EquipmentItem } from "@/data/equipment"

import styles from "./index.module.scss"

export function EquipmentSection() {
  return (
    <div className={styles.Section}>
      <Typography size="xxx-small" family="mono" weight="regular" className={styles.Section__label}>
        Gear I use
      </Typography>

      {/* One shared card rather than one per item: hovering from a linked name to the next morphs
          the same popup between them instead of closing and reopening it. */}
      <PreviewCard.Root<EquipmentItem>>
        {({ payload }) => (
          <>
            {/* Native CSS columns rather than a grid: domains have different item counts, and a
                grid would need every column the same height or an explicit row-span per block. */}
            <div className={styles.Domains}>
              {EQUIPMENT_DOMAINS.map(domain => {
                const items = EQUIPMENT.filter(item => item.domain === domain)
                if (items.length === 0) return null

                return (
                  <div key={domain} className={styles.Domain}>
                    <Typography size="xxx-small" family="mono" className={styles.Domain__label}>
                      {domain}
                    </Typography>
                    <ul className={styles.List}>
                      {items.map(item => (
                        <li key={item.name} className={styles.Item}>
                          {item.url ? (
                            <PreviewCard.Trigger
                              payload={item}
                              delay={0}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.Item__link}
                              render={
                                <Typography size="xx-small" weight="regular" render={<a />}>
                                  {item.name}
                                </Typography>
                              }
                            />
                          ) : (
                            <Typography size="xx-small" weight="regular">
                              {item.name}
                            </Typography>
                          )}
                          {item.note && (
                            <Typography size="xxx-small" weight="regular" className={styles.Item__note}>
                              {item.note}
                            </Typography>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {payload && (
              <PreviewCard.Portal>
                <PreviewCard.Positioner side="top">
                  <PreviewCard.Popup>
                    <PreviewCard.Viewport>
                      <EquipmentPreview item={payload} />
                    </PreviewCard.Viewport>
                  </PreviewCard.Popup>
                </PreviewCard.Positioner>
              </PreviewCard.Portal>
            )}
          </>
        )}
      </PreviewCard.Root>
    </div>
  )
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

type EquipmentPreviewProps = {
  item: EquipmentItem
}

function EquipmentPreview({ item }: EquipmentPreviewProps) {
  const host = equipmentHost(item)

  return (
    <>
      <div className={styles.Preview}>
        <Image
          src={item.image}
          alt={item.name}
          className={styles.Preview__image}
          layout="fill"
          fallback={
            <span className={styles.Preview__fallback}>
              <Icon.GlobeSimpleIcon size={20} />
            </span>
          }
        />
      </div>
      <Typography size="xxx-small" family="mono" render={<span />} className={styles.Preview__host}>
        {host}
        <Icon.ArrowUpRightIcon size={12} />
      </Typography>
    </>
  )
}
