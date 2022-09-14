import AnimatedTitle from '@/components/animated/AnimatedTitle';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  const staggerer = {
    visible: {
      transition: {
        staggerChildren: 1,
      },
    },
  };

  return (
    <motion.section
      key={router.asPath}
      className='flex-center-column h-full p-6'
      initial='hidden'
      animate='visible'
      variants={staggerer}
    >
      <AnimatedTitle
        key='title1'
        text='This, is a work of art.'
        className='text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-8xl'
      />
      <AnimatedTitle
        key='title2'
        text="Don't believe me?"
        className='text-center text-2xl text-zinc-800 dark:text-zinc-100 md:text-4xl'
      />
      <AnimatedTitle
        key='title3'
        text='Come and see for yourself.'
        className='text-center text-2xl text-zinc-800 dark:text-zinc-100 md:text-4xl'
      />
    </motion.section>
  );
};

export default Home;
