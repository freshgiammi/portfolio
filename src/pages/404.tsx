import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import Image from 'next/future/image';
import lol404 from '~/assets/lol404.gif';
import Button from '@/components/Button';

export default function Custom404() {
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

  return (
    <motion.section
      variants={variants}
      initial='hidden'
      animate='enter'
      exit='exit'
      className='flex-center-column fixed h-full w-full space-y-4 bg-sepia-300 dark:bg-carbon-900'
    >
      <Image alt='p.alt' src={lol404.src} sizes='100vw' width={400} height={400} placeholder='blur'></Image>
      <p className='px-2 text-center text-3xl font-bold text-carbon-800 dark:text-carbon-100 md:text-4xl'>
        {`Well, this is awkward. There's `}
        <span className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>nothing</span>
        {` here.`}
      </p>
      <p className='text-center text-lg text-carbon-800 dark:text-carbon-300 md:text-2xl'>
        {'Want to go back to the homepage?'}
      </p>
      <Link href='/' passHref scroll={false}>
        <a>
          <Button>Go back!</Button>
        </a>
      </Link>
    </motion.section>
  );
}
