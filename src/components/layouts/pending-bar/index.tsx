import styles from "./index.module.scss"

/**
 * Router-wide `defaultPendingComponent`: the fallback for any route that suspends without a
 * tailored `pendingComponent` of its own. A slim indeterminate bar rather than a full-page
 * replacement, since it only ever covers one match's own content — the header and nav above it live
 * in a separate, unaffected match and stay in place throughout.
 */
export function PendingBar() {
  return (
    <div className={styles.PendingBar} role="progressbar" aria-label="Loading" aria-busy="true">
      <div className={styles.PendingBar__fill} />
    </div>
  )
}
