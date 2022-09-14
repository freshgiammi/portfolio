import AnimatedTitle from '@/components/animated/AnimatedTitle';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const About: NextPage = () => {
  const router = useRouter();

  const staggerer = {
    visible: {
      transition: {
        staggerChildren: 0.025,
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
        text='About me.'
        className='text-center text-5xl font-bold text-zinc-800 dark:text-zinc-100 md:text-6xl'
      />
    </motion.section>
  );
};

export default About;
