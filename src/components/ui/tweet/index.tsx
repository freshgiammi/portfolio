import { useQuery } from "@tanstack/react-query"
import type { ComponentProps } from "react"
import type { EnrichedQuotedTweet, EnrichedTweet } from "react-tweet"
import { enrichTweet, formatNumber, getMediaUrl } from "react-tweet"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import { getCachedTweet } from "@/server/tweet"
import { formatDate } from "@/utils/date"

import styles from "./index.module.scss"

type TweetProps = {
  /** The status id, which is the only part of a tweet URL that identifies it. */
  id: string
}

/**
 * A tweet, rendered in this site's own type and colour rather than Twitter's.
 *
 * `react-tweet` is used for the parts that are genuinely hard — the syndication endpoint, and
 * turning a tweet's entity offsets into linkable runs of text — and none of its markup or theme:
 * every element below is this site's, so a tweet in a post sits in the same visual language as the
 * paragraphs around it instead of importing another product's design.
 *
 * The fetch happens in the browser, so the server renders a placeholder of the same height and the
 * tweet fills it in. Nothing above it moves when it lands.
 */
export function Tweet({ id }: TweetProps) {
  const { data, error, isPending } = useQuery({
    queryKey: ["tweet", id],
    // Signal not forwarded — same reasoning as `activityQueryOptions`.
    queryFn: () => getCachedTweet({ data: { id } })
  })

  if (isPending) return <div className={styles.Tweet} data-state="loading" aria-busy="true" />
  if (error || !data) return <Unavailable id={id} />

  return <Card tweet={enrichTweet(data)} />
}

export declare namespace Tweet {
  export type Props = TweetProps
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

type CardProps = { tweet: EnrichedTweet }

function Card({ tweet }: CardProps) {
  const photos = tweet.photos ?? []

  return (
    <figure className={styles.Tweet}>
      <header className={styles.Tweet__header}>
        {/* The avatar, the name and the date all point at the tweet; only the handle goes somewhere
            else, to the follow intent, which is the one thing a reader might want that the tweet
            itself is not. */}
        <TweetLink href={tweet.url} className={styles.Tweet__avatarLink}>
          <img
            src={tweet.user.profile_image_url_https}
            alt=""
            loading="lazy"
            width={44}
            height={44}
            className={styles.Tweet__avatar}
          />
        </TweetLink>

        <div className={styles.Tweet__names}>
          <TweetLink href={tweet.url} className={styles.Tweet__name}>
            <Typography size="xx-small" weight="semibold" render={<span />}>
              {tweet.user.name}
            </Typography>
            {tweet.user.is_blue_verified && (
              <Icon.SealCheckIcon size={13} weight="fill" className={styles.Tweet__verified} />
            )}
          </TweetLink>

          <TweetLink
            href={tweet.user.follow_url}
            className={styles.Tweet__handle}
            title={`Follow @${tweet.user.screen_name}`}>
            <Typography size="xxx-small" family="mono" render={<span />}>
              @{tweet.user.screen_name}
            </Typography>
          </TweetLink>
        </div>

        {/* Opposite the avatar, where the eye is not already busy: the date is the one thing here
            that answers a question about the tweet rather than about its author. */}
        <TweetLink href={tweet.url} className={styles.Tweet__date}>
          <Typography size="xxx-small" family="mono" render={<time dateTime={tweet.created_at} />}>
            {formatDate(tweet.created_at)}
          </Typography>
        </TweetLink>
      </header>

      {tweet.in_reply_to_screen_name && (
        <TweetLink href={tweet.in_reply_to_url ?? tweet.url} className={styles.Tweet__replyTo}>
          <Typography size="xxx-small" family="mono" render={<span />}>
            Replying to @{tweet.in_reply_to_screen_name}
          </Typography>
        </TweetLink>
      )}

      <Typography size="x-small" weight="regular" render={<p />} className={styles.Tweet__body}>
        {tweet.entities.map(entity => {
          // A media entity's text is the t.co link to the image already shown below it.
          if (entity.type === "media") return null

          const text = decodeEntities(entity.text)
          // Character offsets into the tweet: unique and stable, which an index into a list that
          // drops its media entries is not.
          const key = entity.indices.join("-")

          if (entity.type === "text") return <span key={key}>{text}</span>

          return (
            <a key={key} href={entity.href} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          )
        })}
      </Typography>

      {/* Media is a link, not a picture: a video cannot play here, and a photo is worth opening at
          the size the author posted it. */}
      {tweet.video && (
        <TweetLink href={tweet.url} className={styles.Tweet__mediaLink} aria-label="View video on X">
          <img src={tweet.video.poster} alt="" loading="lazy" className={styles.Tweet__photo} />
          <span className={styles.Tweet__mediaLabel}>
            <Icon.PlayCircleIcon size={14} weight="fill" />
            <Typography size="xxx-small" family="mono" render={<span />}>
              View video on X
            </Typography>
          </span>
        </TweetLink>
      )}

      {!tweet.video && photos.length > 0 && (
        <TweetLink
          href={tweet.url}
          className={styles.Tweet__mediaLink}
          aria-label={photos.length === 1 ? "View photo on X" : `View ${photos.length} photos on X`}>
          <span className={styles.Tweet__media} data-count={Math.min(photos.length, 4)}>
            {photos.slice(0, 4).map(photo => (
              <img key={photo.url} src={photo.url} alt="" loading="lazy" className={styles.Tweet__photo} />
            ))}
          </span>
        </TweetLink>
      )}

      {tweet.quoted_tweet && <Quote tweet={tweet.quoted_tweet} />}

      {/* Counts that are also the actions they count: each one opens the intent it belongs to, so a
          reader can answer the tweet rather than only look at it. */}
      <footer className={styles.Tweet__footer}>
        <TweetLink
          href={tweet.reply_url}
          className={styles.Tweet__action}
          data-tone="reply"
          aria-label={`Reply. This tweet has ${tweet.conversation_count} ${tweet.conversation_count === 1 ? "reply" : "replies"}`}>
          <Icon.ChatCircleIcon size={13} />
          {tweet.conversation_count > 0 && (
            <Typography size="xxx-small" family="mono" render={<span />}>
              {formatNumber(tweet.conversation_count)}
            </Typography>
          )}
        </TweetLink>

        <TweetLink
          href={`https://x.com/intent/retweet?tweet_id=${tweet.id_str}`}
          className={styles.Tweet__action}
          data-tone="repost"
          aria-label="Repost this tweet on X">
          <Icon.RepeatIcon size={13} />
        </TweetLink>

        <TweetLink
          href={tweet.like_url}
          className={styles.Tweet__action}
          data-tone="like"
          aria-label={`Like. This tweet has ${tweet.favorite_count} ${tweet.favorite_count === 1 ? "like" : "likes"}`}>
          <Icon.HeartIcon size={13} />
          {tweet.favorite_count > 0 && (
            <Typography size="xxx-small" family="mono" render={<span />}>
              {formatNumber(tweet.favorite_count)}
            </Typography>
          )}
        </TweetLink>

        <TweetLink href={tweet.url} className={styles.Tweet__view} aria-label="View on X">
          <Icon.XLogoIcon size={14} weight="fill" />
        </TweetLink>
      </footer>
    </figure>
  )
}

/**
 * The tweet this one is quoting, which is often the half that carries the point: a quote with the
 * quoted post missing reads as a reply to nothing.
 *
 * The whole card is one link, so the quoted text is plain: its own entities cannot be anchors inside
 * an anchor, and a quote is a pointer to a tweet rather than a second tweet to read links out of.
 */
type QuoteProps = { tweet: EnrichedQuotedTweet }

function Quote({ tweet }: QuoteProps) {
  // `mediaDetails` rather than `photos`/`video`: a quoted tweet is typed with only the former, and it
  // covers both cases anyway — a video's entry carries the poster frame as its url.
  const media = tweet.mediaDetails?.[0]

  return (
    <TweetLink href={tweet.url} className={styles.Tweet__quote}>
      <span className={styles.Tweet__quoteHeader}>
        <img
          src={tweet.user.profile_image_url_https}
          alt=""
          loading="lazy"
          width={20}
          height={20}
          className={styles.Tweet__quoteAvatar}
        />
        <Typography size="xxx-small" weight="semibold" render={<span />} className={styles.Tweet__quoteName}>
          {tweet.user.name}
        </Typography>
        {tweet.user.is_blue_verified && <Icon.SealCheckIcon size={11} weight="fill" />}
        <Typography size="xxx-small" family="mono" render={<span />} className={styles.Tweet__quoteHandle}>
          @{tweet.user.screen_name}
        </Typography>
      </span>

      <Typography size="xx-small" weight="regular" render={<p />} className={styles.Tweet__quoteBody}>
        {decodeEntities(tweet.text)}
      </Typography>

      {media && (
        <span className={styles.Tweet__quoteMedia}>
          <img src={getMediaUrl(media, "small")} alt="" loading="lazy" />
          {media.type !== "photo" && (
            <span className={styles.Tweet__quoteMediaBadge}>
              <Icon.PlayCircleIcon size={16} weight="fill" />
            </span>
          )}
        </span>
      )}
    </TweetLink>
  )
}

type TweetLinkProps = ComponentProps<"a">

/** Every link here leaves the site, so none of them has to say so one at a time. */
function TweetLink(props: TweetLinkProps) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

/**
 * A deleted tweet, a protected account, or a syndication endpoint having a bad day all land here.
 * The link is kept: the reason the tweet was worth embedding does not stop being true.
 */
function Unavailable({ id }: TweetProps) {
  return (
    <figure className={styles.Tweet} data-state="unavailable">
      <Typography size="x-small" weight="regular" render={<p />} className={styles.Tweet__body}>
        This tweet could not be loaded.{" "}
        <a href={`https://x.com/i/status/${id}`} target="_blank" rel="noopener noreferrer">
          View it on X
        </a>
        .
      </Typography>
    </figure>
  )
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'"
}

/**
 * The API returns tweet text HTML-escaped. `react-tweet`'s own components hand it to
 * `dangerouslySetInnerHTML`; decoding the five named entities instead keeps the text a string, so
 * nothing from a third party is ever parsed as markup here.
 */
function decodeEntities(text: string) {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, match => ENTITIES[match] ?? match)
}
