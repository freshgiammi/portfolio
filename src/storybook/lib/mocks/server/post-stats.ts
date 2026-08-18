import { mocked } from "storybook/test"

import { addPostClaps, getPostStats, recordPostRead, setPostLike } from "@/server/post-stats"
import { faker } from "@/storybook/lib/fake"

/**
 * Default mock behaviour for every server function any story touches, applied once from the
 * preview-level `beforeEach`. Individual stories override these with their own `beforeEach`
 * (which runs later), e.g. the tweet id "0" mapping to an unavailable card.
 */
export function seed() {
  const postStats = {
    reads: faker.number.int({ min: 300, max: 9000 }),
    likes: faker.number.int({ min: 5, max: 120 }),
    liked: false,
    claps: faker.number.int({ min: 0, max: 200 }),
    myClaps: 0
  }

  mocked(getPostStats).mockResolvedValue({ ...postStats })
  mocked(recordPostRead).mockResolvedValue(postStats.reads + 1)
  mocked(setPostLike).mockImplementation(({ data }) => {
    postStats.liked = data.liked
    postStats.likes += data.liked ? 1 : -1
    return Promise.resolve({ ...postStats })
  })
  mocked(addPostClaps).mockImplementation(({ data }) => {
    postStats.claps += data.claps
    postStats.myClaps += data.claps
    return Promise.resolve({ ...postStats })
  })
}
