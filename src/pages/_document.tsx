import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap'
          rel='stylesheet'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body className='bg-sepia-300 transition-colors duration-500 dark:bg-carbon-900'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
