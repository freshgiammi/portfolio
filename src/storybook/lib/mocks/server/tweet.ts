import type { Tweet } from "react-tweet/api"
import { mocked } from "storybook/test"

import { getCachedTweet } from "@/server/tweet"
import { catImage, faker } from "@/storybook/lib/fake"

export function seed() {
  // The id "0" is reserved for the unavailable state.
  mocked(getCachedTweet).mockImplementation(({ data }) => Promise.resolve(data.id === "0" ? null : fakeTweet(data.id)))
}

function fakeTweet(id: string): Tweet {
  const text = `${faker.lorem.sentence()} ${faker.internet.url()}`

  return {
    __typename: "Tweet",
    lang: "en",
    id_str: id,
    text,
    created_at: faker.date.recent({ days: 400 }).toISOString(),
    display_text_range: [0, text.length],
    edit_control: { edit_tweet_ids: [id], editable_until_msecs: "0", is_edit_eligible: false, edits_remaining: "0" },
    isEdited: false,
    isStaleEdit: false,
    user: {
      id_str: "14862297",
      name: "Giammi",
      screen_name: "freshgiammi",
      is_blue_verified: true,
      verified: false,
      profile_image_url_https: catImage(88, 88),
      profile_image_shape: "Square"
    },
    favorite_count: faker.number.int({ min: 3, max: 900 }),
    conversation_count: faker.number.int({ min: 0, max: 60 }),
    news_action_type: "conversation"
  }
}
