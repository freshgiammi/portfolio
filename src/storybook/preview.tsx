import "../styles/index.scss"

import type { Decorator, Preview } from "@storybook/tanstack-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { seedServerMocks } from "./lib/mocks/server-index"

/*
 * One shared QueryClient per the tanstack-react framework's documented pattern: handed to both
 * the router context (so loaders/hooks agree) and a provider decorator (so components render),
 * and cleared before every story so each starts without the previous story's cache.
 */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } }
})

/** Puts the toolbar's theme global on `<html>`, where every token block re-declares. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as "light" | "dark" | undefined

  // Applied synchronously per render rather than in an effect: it is idempotent, and every render
  // re-states the value anyway.
  if (theme) document.documentElement.dataset.theme = theme
  else delete document.documentElement.dataset.theme

  return <Story />
}

const withQueryClient: Decorator = Story => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
)

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Site theme: light, dark, or follow the OS"
    }
  },
  beforeEach: () => {
    queryClient.clear()
    seedServerMocks()
  },
  parameters: {
    tanstack: {
      router: {
        context: { queryClient }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
  decorators: [withTheme, withQueryClient]
}

export default preview
