import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import LayoutBlock from '@/components/LayoutBlock';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme='system' attribute='class'>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* Chrome (Doesn't apply on dark-mode, see: https://caniuse.com/?search=theme-color */}
        <meta name='theme-color' content='#e4e4e7' />
        {/*  IOS Safari */}
        <meta name='apple-mobile-web-app-status-bar-style' content='#e4e4e7' />
      </Head>
      <LayoutBlock>
        <Component {...pageProps} />
      </LayoutBlock>
    </ThemeProvider>
  );
}

export default MyApp;
