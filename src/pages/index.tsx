import AnimatedText, { AnimatedTextProps } from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

// ! Wave credits: https://fffuel.co/sssquiggly/

const Home: NextPage = () => {
  const heroTitle: AnimatedTextProps[] = [
    {
      text: "Hello there, I'm freshgiammi.",
      key: 'title1',
      className: 'mb-3 text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-6xl',
      duration: 0.3,
    },
  ];

  return (
    <LayoutBlock>
      <motion.section className='flex-center-column h-full p-6'>
        <div className='flex-center-column absolute'>
          {heroTitle.map(({ key, ...item }, _index) => {
            return <AnimatedText key={key} {...item} />;
          })}
          <AnimatedWave key='wave' className='absolute -z-10 opacity-30' />
        </div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
