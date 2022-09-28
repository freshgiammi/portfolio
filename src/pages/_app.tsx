import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { ParallaxProvider } from 'react-scroll-parallax';
import useMousePosition from '@/hooks/animated/useMousePosition';

// This is the root component. It wraps the whole app ina ThemeProvider to enable dark mode switching.
// It also contains the Navbar and the background layer, since these are always present on every page.
// ! Should we move background to LayoutBlock? This would enable us to have a different background for each page, with working transitions.
// ! BUG: theme-color still does not have an API. https://github.com/pacocoursey/next-themes/issues/78

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { x, y } = useMousePosition(-100, (a: number) => a - 10);

  if (router.pathname === '/404')
    return (
      <ThemeProvider defaultTheme='system' attribute='class'>
        <AnimatePresence mode='wait'>
          <Component {...pageProps} key={router.pathname} />
        </AnimatePresence>
      </ThemeProvider>
    );

  return (
    <ParallaxProvider>
      <ThemeProvider defaultTheme='system' attribute='class'>
        <Head>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          {/* Chrome (Doesn't apply on dark-mode, see: https://caniuse.com/?search=theme-color */}
          <meta name='theme-color' content='#e4e4e7' />
          {/*  IOS Safari */}
          <meta name='apple-mobile-web-app-status-bar-style' content='#e4e4e7' />
        </Head>
        {/* Navbar component (contains motion elements) */}
        <Navbar />
        {/* Actual page content. Component must be a motion element to enable transitions. */}
        <AnimatePresence
          mode='wait'
          onExitComplete={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0 });
            }
          }}
        >
          <Component {...pageProps} key={router.pathname} />{' '}
          {/* Key is used to identify the component and allow transitions. */}
        </AnimatePresence>
        <motion.div
          className='cursor'
          style={{
            translateX: x,
            translateY: y,
          }}
        />
      </ThemeProvider>
    </ParallaxProvider>
  );
}

export default MyApp;
