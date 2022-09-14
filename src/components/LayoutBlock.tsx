import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';

interface IMeta {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

interface Props {
  children?: ReactNode;
  customMeta?: IMeta;
}

/**
 * This element takes care of the layout of the page.
 * Shows a Navbar, a Footer, and a children between them..
 * @param {IMeta}  - `title` - The title of the page.
 */
export default function LayoutBlock({ children, ...customMeta }: Props) {
  const router = useRouter();

  const meta: IMeta = {
    title: 'freshgiammi - Fullstack developer',
    description: `Freshgiammi's WIP website.`,
    image: '../../public/assets/lightning.svg',
    type: 'website',
    ...customMeta,
  };

  return (
    <div>
      <Head>
        <title>{meta.title}</title>
        <meta name='robots' content='follow, index' />
        <meta content={meta.description} name='description' />
        <meta property='og:url' content={`https://freshgiammi.dev${router.asPath}`} />
        <link rel='canonical' href={`https://freshgiammi.dev${router.asPath}`} />
        <meta property='og:type' content={meta.type} />
        <meta property='og:site_name' content='Freshgiammi' />
        <meta property='og:description' content={meta.description} />
        <meta property='og:title' content={meta.title} />
        <meta property='og:image' content={meta.image} />
      </Head>
      <main className='h-full w-full'>
        {/* Navbar component (contains motion elements) */}
        <Navbar type='light' />
        {/* Background layer (element has a negative z-index to make sure a background is *always* provided) */}
        <div
          className='absolute inset-0 min-h-full min-w-full bg-sepia-300 
          transition-colors duration-[600ms] dark:bg-zinc-900'
          style={{ zIndex: '-10' }}
        />

        {/* Actual page content (might contain motion elements) */}
        <div className='h-full'>{children}</div>
      </main>
    </div>
  );
}
