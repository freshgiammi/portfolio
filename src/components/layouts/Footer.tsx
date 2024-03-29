/* eslint-disable max-len */
import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { HighlightedText } from '../animated/HighlightedText';

export default function Footer() {
  const heroTopAnim: Variants = {
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scrollInView: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
  };

  return (
    <motion.footer className='section-common my-6 md:my-20'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        variants={heroTopAnim}
        className='grid h-full grid-cols-1 gap-8 rounded-xl bg-sepia-200 py-10 px-10 dark:bg-carbon-800 md:grid-cols-[1fr_1fr]'
      >
        <motion.div className='text-xl font-medium text-carbon-800 dark:text-zinc-100 md:text-5xl'>
          <motion.div className='overflow-hidden'>
            <motion.p variants={scrollInView} className='text-carbon-800 dark:text-zinc-100'>
              {'Have an idea already?'}
            </motion.p>
          </motion.div>
          <motion.div className='overflow-hidden'>
            <motion.p variants={scrollInView} className='text-carbon-800 dark:text-zinc-100'>
              <Link
                href='https://www.linkedin.com/in/gianmarco-rengucci'
                className='text-amber-800/70 dark:text-amber-300/70'
                scroll={false}
              >
                <HighlightedText>{'Hit me up.'}</HighlightedText>
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
        <motion.div className='flex flex-row items-center space-x-4 overflow-hidden text-carbon-700 dark:text-zinc-300 md:justify-end'>
          <a href='https://www.instagram.com/freshgiammi'>
            <motion.svg
              variants={scrollInView}
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              className='bi bi-instagram h-8 w-8 md:h-20 md:w-20'
              viewBox='0 0 16 16'
            >
              <path d='M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z' />
            </motion.svg>
          </a>
          <a href='https://github.com/freshgiammi'>
            <motion.svg
              variants={scrollInView}
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              className='bi bi-github h-8 w-8 md:h-20 md:w-20'
              viewBox='0 0 16 16'
            >
              <path d='M 8 0 C 3.5812 0 0 3.5812 0 8 C 0 11.5344 2.2906 14.5344 5.4719 15.5906 C 5.8719 15.6656 6 15.4188 6 15.2062 L 6 13.7188 C 3.775 14.2 3.3125 12.7719 3.3125 12.7719 C 2.9469 11.85 2.4219 11.6031 2.4219 11.6031 C 1.6969 11.1062 2.4781 11.1156 2.4781 11.1156 C 3.2812 11.1719 3.7031 11.9406 3.7031 11.9406 C 4.4188 13.1625 5.575 12.8094 6.0312 12.6062 C 6.1031 12.0906 6.3094 11.7375 6.5406 11.5375 C 4.7625 11.3344 2.8969 10.6469 2.8969 7.5812 C 2.8969 6.7094 3.2094 5.9969 3.7188 5.4344 C 3.6375 5.2344 3.3625 4.4188 3.7969 3.3188 C 3.7969 3.3188 4.4688 3.1031 5.9969 4.1375 C 6.6375 3.9594 7.3188 3.8719 8 3.8688 C 8.6812 3.8719 9.3656 3.9594 10.0031 4.1375 C 11.5312 3.1031 12.2031 3.3188 12.2031 3.3188 C 12.6375 4.4188 12.3625 5.2344 12.2812 5.4344 C 12.7938 5.9969 13.1031 6.7094 13.1031 7.5812 C 13.1031 10.6562 11.2312 11.3312 9.45 11.5312 C 9.7375 11.7781 10 12.2656 10 13.0125 L 10 15.2062 C 10 15.4188 10.1281 15.6688 10.5344 15.5906 C 13.7094 14.5312 16 11.5344 16 8 C 16 3.5812 12.4188 0 8 0 Z M 8 0' />
            </motion.svg>
          </a>
          <a href='https://www.linkedin.com/in/gianmarco-rengucci/'>
            <motion.svg
              variants={scrollInView}
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              className='bi bi-linkedin h-8 w-8 md:h-20 md:w-20'
              viewBox='0 0 16 16'
            >
              <path d='M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z' />
            </motion.svg>
          </a>
        </motion.div>
        <motion.div className='overflow-hidden'>
          <motion.p variants={scrollInView} className='col-[1_/_3] text-sm'>
            © 2022 • Made with <span style={{ color: '#e25555' }}>♥</span> by{' '}
            <Link
              href='https://freshgiammi.github.io'
              className='text-amber-800/70 underline dark:text-amber-300/70'
              scroll={false}
            >
              freshgiammi
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
