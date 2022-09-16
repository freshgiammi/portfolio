import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

// This is the root component. It wraps the whole app ina ThemeProvider to enable dark mode switching.
// It also contains the Navbar and the background layer, since these are always present on every page.
// ! Should we move background to LayoutBlock? This would enable us to have a different background for each page, with working transitions.

function MyApp({ Component, pageProps }: AppProps) {
  const { asPath } = useRouter();

  return (
    <ThemeProvider defaultTheme='system' attribute='class'>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* Chrome (Doesn't apply on dark-mode, see: https://caniuse.com/?search=theme-color */}
        <meta name='theme-color' content='#e4e4e7' />
        {/*  IOS Safari */}
        <meta name='apple-mobile-web-app-status-bar-style' content='#e4e4e7' />
      </Head>
      {/* Navbar component (contains motion elements) */}
      <Navbar type='light' />
      {/* Background layer (element has a negative z-index to make sure a background is *always* provided) */}
      <div
        className='absolute inset-0 min-h-full min-w-full bg-sepia-300 
          transition-colors duration-[600ms] dark:bg-zinc-900'
        style={{ zIndex: '-10' }}
      />

      {/* Actual page content. Component must be a motion element to enable transitions. */}
      <AnimatePresence exitBeforeEnter>
        <Component {...pageProps} key={asPath} /> {/* Key is used to identify the component and allow transitions. */}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
