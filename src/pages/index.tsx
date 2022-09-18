import AnimatedText, { AnimatedTextProps } from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

// ! Wave credits: https://fffuel.co/sssquiggly/

function calculateStaggeredDelay(itemlist: AnimatedTextProps[], index: number) {
  if (index === 0) {
    return itemlist[index].delay || 0; // Set the item's delay to 0 if it's not defined
  }
  const previousItemTextLength = itemlist[index - 1].text.length;
  const previousItemStagger = itemlist[index - 1].stagger || 0.05; // Set the item's stagger to the default value (0.05) if it's not defined
  return previousItemTextLength * previousItemStagger;
}

const Home: NextPage = () => {
  const heroTitle: AnimatedTextProps[] = [
    {
      text: "Hi, I'm freshgiammi",
      key: 'title1',
      className: 'mb-3 text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-6xl',
      duration: 0.5,
      stagger: 0.05,
    },
    {
      text: 'a fullstack developer, with a passion for web design.',
      key: 'title2',
      className: 'mb-3 px-3 md:px-0 text-center text-xl text-zinc-800 dark:text-zinc-100 md:text-2xl',
      duration: 1.5,
      stagger: 0,
    },
  ];

  return (
    <LayoutBlock>
      <motion.section className='flex-center-column h-full p-6'>
        <div className='flex-center-column absolute'>
          {heroTitle.map(({ key, ...item }, index) => {
            return (
              <AnimatedText
                key={key}
                {...item}
                delay={calculateStaggeredDelay(heroTitle, index)} // This should be an external function.
              />
            );
          })}
          <AnimatedWave
            key='wave'
            loop={true}
            className='absolute -z-10 w-full overflow-hidden opacity-20 md:w-auto' // width: fit-content is not working on chrome mobile.
            strokeStyle='stroke-amber-800 dark:stroke-amber-300'
          />
        </div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
