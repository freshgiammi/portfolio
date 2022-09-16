import AnimatedText from '@/components/animated/AnimatedText';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const heroTitle = [
    {
      text: "Hello there, I'm freshgiammi.",
      key: 'title1',
      className: 'mb-3 text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-6xl',
    },
    {
      text: 'I build things for the web.',
      key: 'title2',
      className: 'mb-6 text-center text-2xl text-zinc-800 dark:text-zinc-100 md:text-2xl',
    },
  ];

  return (
    <LayoutBlock>
      <motion.section className='flex-center-column h-full p-6'>
        {heroTitle.map((item, index) => {
          return (
            <AnimatedText
              key={item.key}
              text={item.text}
              duration={0.3}
              delay={(index === 0 ? 0 : heroTitle[index - 1].text.length) * 0.05} // Number of characters * stagger = delay
              className={item.className}
            />
          );
        })}
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
