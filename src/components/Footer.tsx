/* eslint-disable max-len */
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <motion.footer
      className='grid grid-cols-4 border-t border-amber-800/[0.3] bg-sepia-200 p-5 text-center text-sm text-zinc-900 shadow 
  transition-colors duration-[600ms] dark:border-amber-300/[0.3] dark:bg-carbon-900 dark:text-zinc-300 lg:mx-10'
    >
      <p className='col-[1_/_3] text-left'>
        Made with <span style={{ color: '#e25555' }}>♥</span> by{' '}
        <Link href='https://freshgiammi.github.io' passHref>
          <a className='text-amber-800/70 underline dark:text-amber-300/70'>freshgiammi</a>
        </Link>
      </p>
      <div> I am footer</div>
      <div> I am footer</div>
    </motion.footer>
  );
}
