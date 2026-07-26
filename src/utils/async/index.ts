type Success<T> = { data: T; error: null }
type Failure<E> = { data: null; error: E }
type Result<T, E = Error> = Success<T> | Failure<E>

type TryCatchOptions = {
  /**
   * Whether to mute the error or not. If true, the error will not be logged to the console.
   * Handy if the offending function is very noisy and you want to ignore the errors.
   * @default false
   */
  muteError?: boolean
}

/**
 * tryCatch - Error handling that can be synchronous or asynchronous
 * based on the input function.
 */

export function tryCatch<T>(fn: () => Promise<T>, opts?: TryCatchOptions): Promise<Result<T>>
export function tryCatch<T>(fn: () => T, opts?: TryCatchOptions): Result<T>
export function tryCatch<T>(fn: () => T | Promise<T>, opts?: TryCatchOptions): unknown {
  const { muteError = false } = opts || {}

  try {
    const result = fn()
    if (result instanceof Promise) {
      return result
        .then((data): Success<T> => ({ data, error: null }))
        .catch((rawError: unknown): Failure<Error> => {
          const processedError = rawError instanceof Error ? rawError : new Error(String(rawError))
          if (!muteError) console.error(processedError)
          return { data: null, error: processedError }
        })
    }

    return { data: result, error: null }
  } catch (rawError: unknown) {
    const processedError = rawError instanceof Error ? rawError : new Error(String(rawError))
    if (!muteError) console.error(processedError)
    return { data: null, error: processedError }
  }
}
