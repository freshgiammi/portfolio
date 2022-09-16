import AnimatedText from '@/components/animated/AnimatedText';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

const About: NextPage = () => {
  const staggerer = {
    visible: {
      transition: {
        staggerChildren: 0.025,
      },
    },
  };

  return (
    <LayoutBlock>
      <motion.section className='flex-center-column h-full p-6' initial='hidden' animate='visible' variants={staggerer}>
        <AnimatedText
          key='title1'
          text='About me.'
          className='text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-8xl'
        />
      </motion.section>
    </LayoutBlock>
  );
};

export default About;
