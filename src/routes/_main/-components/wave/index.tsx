import { useCallback, useEffect, useRef, useState } from "react"

import { useConfetti } from "@/components/effects/confetti"
import { useParticles } from "@/components/effects/particles"
import { snackbar } from "@/components/primitives/snackbar"
import { useMergeRefs } from "@/hooks/useMergeRefs"
import { useUnlocked } from "@/preferences/context"

import styles from "./index.module.scss"

/** How long a hand has to be held before it pays out. */
const HOLD_TO_UNLOCK = 3000

/** A press has to outlive a click before the hand reacts, so a click gets only its beat. */
const WAKE = 260

/** Clears the whole line above the heading a run of taps fills. */
const PARTICLES = { drift: 56, rise: 76, tilt: 40, size: "small", className: styles.Wave__particle } as const

const CONFETTI = { spray: "popper", pieces: 60, distance: 230 } as const

/** Same skin tone as the hand in the heading, so these read as coming off it. */
const THROWN = ["👋🏻", "✨", "🙌🏻", "🫶🏻"] as const

/** The one that only ever comes out once. */
const EARNED = "🎉"

/** How far past a full wind-up the payout kick goes, and how many frames the frenzy runs. */
const RECOIL = 1.5
const FRENZY_FRAMES = 34

/** How many frames the kick takes to arrive, so it reads as a kick and not a jump cut. */
const KICK_FRAMES = 5

/** Particles thrown per frenzy frame. */
const FRENZY_HANDFUL = 4

/** How long the hand takes to fall still after being let go early. */
const UNWIND = 420

/** Gap between throws while held, in ms: wide at first, tight by the end. */
const TRICKLE = { from: 240, to: 40 }

type WaveProps = {
  /** The hand itself, so the hero keeps the emoji it was written with. */
  children: string
}

/**
 * The hand in the hero. A tap throws an emoji off it; holding it past {@link HOLD_TO_UNLOCK} pays
 * out and flips the site's `unlocked` preference.
 */
export function Wave({ children }: WaveProps) {
  const { unlocked, unlock } = useUnlocked()
  const { ref: particles, emit } = useParticles(PARTICLES)
  const { burst } = useConfetti(CONFETTI)
  const [beat, setBeat] = useState(0)
  const [winding, setWinding] = useState(false)
  // A resting hand must have no animation at all, not a finished one: the wind-up rule only covers
  // this while a press lasts, and anything left underneath restarts the moment it's released.
  const [motion, setMotion] = useState<"hello" | "beat" | undefined>("hello")

  const box = useRef<HTMLButtonElement | null>(null)
  const ref = useMergeRefs([particles, box])

  // Written to the element as a custom property rather than through state, since it changes every
  // frame of a press and would otherwise re-render the hero that many times.
  const frame = useRef<number>(undefined)
  const wind = useRef(0)
  const paid = useRef(false)
  const woke = useRef(false)

  const stop = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = undefined
  }, [])

  useEffect(() => stop, [stop])

  const setWind = (value: number) => {
    wind.current = value
    box.current?.style.setProperty("--wind", value.toFixed(3))
  }

  const pick = () => THROWN[Math.floor(Math.random() * THROWN.length)]!

  /** Smoothstep, so the wind-up eases in and out instead of ramping at a constant rate. */
  const eased = (through: number) => through * through * (3 - 2 * through)

  const payOut = (node: HTMLButtonElement) => {
    paid.current = true
    emit(EARNED, { from: node })
    burst(node)

    let frames = 0
    const tick = () => {
      for (let i = 0; i < FRENZY_HANDFUL; i++) emit(pick(), { from: node })
      frames += 1
      if (frames === 7) burst(node, { pieces: 44, distance: 150 })
      if (frames === 16) burst(node, { pieces: 32, distance: 260 })

      // Kicks past the wind-up over KICK_FRAMES, then decays back to still.
      setWind(
        frames <= KICK_FRAMES
          ? 1 + (RECOIL - 1) * (frames / KICK_FRAMES)
          : RECOIL * (1 - (frames - KICK_FRAMES) / (FRENZY_FRAMES - KICK_FRAMES))
      )
      if (frames < FRENZY_FRAMES) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      setWind(0)
      frame.current = undefined
      setWinding(false)
    }
    frame.current = requestAnimationFrame(tick)

    if (unlocked) return
    unlock()
    snackbar({
      title: "Hello back.",
      description: "Nobody holds onto a hand that long by accident. A few things around here are open to you now."
    })
  }

  const hold = () => {
    const node = box.current
    if (!node) return

    stop()
    paid.current = false
    woke.current = false

    const began = performance.now()
    let last = began

    const tick = (now: number) => {
      const held = now - began
      if (held >= HOLD_TO_UNLOCK) {
        payOut(node)
        return
      }

      if (held < WAKE) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      if (!woke.current) {
        woke.current = true
        setWinding(true)
        // Clears any beat left from a tap just before this hold, so it can't play once uncovered.
        setMotion(undefined)
      }

      const through = (held - WAKE) / (HOLD_TO_UNLOCK - WAKE)
      setWind(eased(through))

      if (now - last >= TRICKLE.from - through * (TRICKLE.from - TRICKLE.to)) {
        last = now
        emit(pick(), { from: node })
      }

      frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
  }

  /** Eases the wind down from wherever it had reached, rather than snapping it to zero. */
  const release = () => {
    if (paid.current) return

    stop()
    const from = wind.current
    if (from === 0) {
      setWinding(false)
      return
    }

    const began = performance.now()
    const tick = (now: number) => {
      const through = Math.min((now - began) / UNWIND, 1)
      setWind(from * (1 - through))
      if (through < 1) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      frame.current = undefined
      setWinding(false)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const waveBack = () => {
    // Only a press that never became a hold waves back: an abandoned or paid-out hold still fires
    // the browser's click, and neither of those should also throw an emoji.
    if (paid.current || woke.current) {
      paid.current = false
      woke.current = false
      return
    }

    // Remounted on every tap, so a run of them restarts the animation instead of stacking on it.
    setBeat(current => current + 1)
    setMotion("beat")
    emit(pick())
  }

  return (
    <button
      type="button"
      className={styles.Wave}
      aria-label="Wave back"
      onClick={waveBack}
      onPointerDown={hold}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      // Keyboard needs the same hold; event.repeat filters the key-repeat events out.
      onKeyDown={event => {
        if (event.repeat || (event.key !== " " && event.key !== "Enter")) return
        if (event.key === " ") event.preventDefault()
        hold()
      }}
      onKeyUp={event => {
        if (event.key === " " || event.key === "Enter") release()
      }}
      ref={ref}>
      <span
        key={beat}
        className={styles.Wave__hand}
        data-motion={motion}
        data-winding={winding || undefined}
        onAnimationEnd={event => {
          if (event.animationName.includes("Wave-hello") || event.animationName.includes("Wave-beat")) {
            setMotion(undefined)
          }
        }}
        aria-hidden="true">
        {children}
      </span>
    </button>
  )
}

export declare namespace Wave {
  export type Props = WaveProps
}
