import { type SimpleGit, simpleGit } from "simple-git"

export async function getRepoInfo(root: string) {
  const git = simpleGit(root)

  if (!(await git.checkIsRepo())) {
    return undefined
  }

  const [branch, currentCommit] = await Promise.all([getBranch(git), getCommit(git)] as const)

  return {
    ...branch,
    ...currentCommit
  }
}

async function getBranch(git: SimpleGit) {
  try {
    const branch = (await git.branch([])).current
    return { branch }
  } catch {
    return { branch: undefined }
  }
}

async function getCommit(git: SimpleGit) {
  try {
    const log = await git.log(["-1"])
    const sha = log.latest?.hash
    return {
      sha,
      abbreviatedSha: sha?.slice(0, 7)
    }
  } catch {
    return {
      sha: undefined,
      abbreviatedSha: undefined
    }
  }
}
