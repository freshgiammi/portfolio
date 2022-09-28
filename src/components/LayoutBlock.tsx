import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HTMLMotionProps, motion, Variants } from 'framer-motion';
import Footer from './Footer';

interface IMeta {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

interface Props extends HTMLMotionProps<'main'> {
  children?: ReactNode;
  customMeta?: IMeta;
}

const variants: Variants = {
  hidden: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};

/**
 * This element takes care of the layout of the page.
 * Shows a Navbar, a Footer, and a children between them..
 * @param {IMeta}  - `title` - The title of the page.
 */
export default function LayoutBlock({ children, customMeta, ...props }: Props) {
  const router = useRouter();

  const meta: IMeta = {
    title: 'freshgiammi - Fullstack developer',
    description: `Freshgiammi's WIP website.`,
    image: '../../public/assets/lightning.svg',
    type: 'website',
    ...customMeta,
  };

  return (
    <>
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
      <motion.main variants={variants} initial='hidden' animate='enter' exit='exit' {...props}>
        {children}
        <Footer />
      </motion.main>
    </>
  );
}
