import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

// TODO: content should not be hardcoded.

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* Chrome (Doesn't apply on dark-mode, see: https://caniuse.com/?search=theme-color */}
        <meta name='theme-color' content='#2564eb' />
        {/*  IOS Safari */}
        <meta name='apple-mobile-web-app-status-bar-style' content='#2564eb' />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
