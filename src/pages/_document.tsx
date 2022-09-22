import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <body className='bg-sepia-300 transition-colors duration-[600ms] dark:bg-zinc-900'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
