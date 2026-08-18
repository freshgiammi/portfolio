import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"

import { postStatsQueryOptions, statsKey } from "@/query/options/post-stats"
import type { PostStats } from "@/server/post-stats"
import { addPostClaps, CLAP_CAP, recordPostRead, setPostLike } from "@/server/post-stats"
import { getVoterId } from "@/utils/voter"

/** How far down the page, and how long on it, before this counts as read rather than opened. */
const READ_RATIO = 0.5
const READ_DWELL_MS = 20_000

/** How long taps are gathered before they go out as one request. */
const CLAP_FLUSH_MS = 600

/**
 * Which slugs already have an instance of the hook watching for a read. Storage cannot stand in for
 * this: its key is only written once the read is recorded, long after both instances have mounted.
 */
const observing = new Set<string>()

/**
 * The numbers under a post, and the two things a reader can do to them.
 *
 * This is the query layer's view of `server/post-stats`, which is why it lives here rather than
 * beside it: none of it runs on the server. Keys, staleness, optimistic writes and the coalescing of
 * a burst of taps into one request are all decisions about the client's cache.
 *
 * The rail is rendered twice on a post page (sidebar on wide viewports, after the article on narrow
 * ones), so this runs twice: the counts are shared through the query cache, and the read is claimed
 * by whichever instance mounts first (see `observing`) rather than being recorded by both.
 */
export function usePostStats(slug: string) {
  const queryClient = useQueryClient()
  const key = statsKey(slug)

  const { data: stats } = useQuery({
    ...postStatsQueryOptions(slug, getVoterId() ?? undefined),
    // The route loader's own prefetch already sends the same voter (via the cookie `getVoterId`
    // mirrors itself into — see `utils/voter`), so this is normally just a reconfirmation. It's the
    // fallback for the cases that cookie can't cover: a first-ever visit, where storage only gets its
    // id (and mirrors the cookie) once this hook mounts, one page too late for that page's own SSR;
    // or storage and the cookie having drifted apart some other way.
    refetchOnMount: "always"
  })

  const { mutate: mutateRead } = useMutation({
    mutationFn: () => recordPostRead({ data: { slug } }),
    onSuccess: reads => {
      queryClient.setQueryData<PostStats>(key, current => (current ? { ...current, reads } : current))
    }
  })

  const like = useMutation({
    mutationFn: (liked: boolean) => {
      const voter = getVoterId()
      if (!voter) throw new Error("No voter id available")

      return setPostLike({ data: { slug, voter, liked } })
    },
    /** The heart fills on click; only a failed request puts it back. */
    onMutate: async (liked: boolean) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PostStats>(key)

      queryClient.setQueryData<PostStats>(key, current =>
        current ? { ...current, liked, likes: Math.max(0, current.likes + (liked ? 1 : -1)) } : current
      )

      return { previous }
    },
    onError: (_error, _liked, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    // The response carries the real count, which may have moved with other readers' likes since
    // the query last ran.
    onSuccess: result => {
      queryClient.setQueryData<PostStats>(key, current => (current ? { ...current, ...result } : current))
    }
  })

  const pendingClaps = useRef(0)
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutate: mutateClaps } = useMutation({
    mutationFn: (claps: number) => {
      const voter = getVoterId()
      if (!voter) throw new Error("No voter id available")

      return addPostClaps({ data: { slug, voter, claps } })
    },
    onSuccess: result => {
      queryClient.setQueryData<PostStats>(key, current => (current ? { ...current, ...result } : current))
    },
    // The optimistic taps below have no single point to roll back to once several have landed, so a
    // failure takes the server's counts instead of unwinding them one by one.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: key })
    }
  })

  const flushClaps = useCallback(() => {
    flushTimer.current = null
    const claps = pendingClaps.current
    pendingClaps.current = 0

    if (claps > 0) mutateClaps(claps)
  }, [mutateClaps])

  /**
   * The sprite has to answer every tap, but a request per tap would be a dozen writes for one
   * reader, so the count moves immediately and the taps leave together once the finger stops.
   */
  const clap = useCallback(() => {
    const current = queryClient.getQueryData<PostStats>(key)
    if (!current || current.myClaps >= CLAP_CAP) return

    queryClient.setQueryData<PostStats>(key, { ...current, claps: current.claps + 1, myClaps: current.myClaps + 1 })
    pendingClaps.current += 1

    if (flushTimer.current) clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flushClaps, CLAP_FLUSH_MS)
  }, [queryClient, key, flushClaps])

  // Leaving the page mid-burst still has to spend the taps that were already shown as counted.
  useEffect(
    () => () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current)
        flushClaps()
      }
    },
    [flushClaps]
  )

  useEffect(() => {
    const storageKey = `read:${slug}`
    if (alreadyCounted(storageKey) || observing.has(slug)) return undefined

    observing.add(slug)
    const openedAt = Date.now()
    let counted = false

    const check = () => {
      if (counted) return

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 1
      if (ratio < READ_RATIO || Date.now() - openedAt < READ_DWELL_MS) return

      counted = true
      markCounted(storageKey)
      mutateRead()
    }

    // Scroll alone would miss a reader who passes the halfway point before the dwell elapses, so
    // the timer re-checks once the clock catches up.
    const timer = setTimeout(check, READ_DWELL_MS)
    window.addEventListener("scroll", check, { passive: true })

    return () => {
      observing.delete(slug)
      clearTimeout(timer)
      window.removeEventListener("scroll", check)
    }
  }, [slug, mutateRead])

  const toggleLike = useCallback(() => {
    if (stats) like.mutate(!stats.liked)
  }, [stats, like])

  // The like is disabled while a toggle is in flight, so a double click cannot land its two
  // requests out of order and leave the button disagreeing with the row in the database. Claps need
  // no such guard: they only ever add, and the taps are coalesced before they leave.
  return {
    stats: stats ?? null,
    toggleLike,
    canLike: Boolean(stats) && !like.isPending,
    clap,
    canClap: Boolean(stats && stats.myClaps < CLAP_CAP)
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/**
 * Deduping is per session and client side, so a reload does not count twice and nothing about the
 * reader has to be stored server side.
 */
function alreadyCounted(key: string) {
  try {
    return sessionStorage.getItem(key) !== null
  } catch {
    // Storage can be blocked outright; counting twice beats not counting at all.
    return false
  }
}

function markCounted(key: string) {
  try {
    sessionStorage.setItem(key, "1")
  } catch {
    // Same as above: the count still goes through.
  }
}
