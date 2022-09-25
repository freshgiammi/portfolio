import AnimatedText, { AnimatedTextProps, calculateStaggeredDelay } from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import Escamadulimg from '~/img/escamadul.png';
import Jecommimg from '~/img/jecomm.png';
import Superchargednextimg from '~/img/superchargednext.png';

import DownArrow from '@/components/animated/DownArrow';
import HeroProject, { HeroProjectProps } from '@/components/HeroProject';

const Home: NextPage = () => {
  const heroTitle: AnimatedTextProps[] = [
    {
      text: "Hi, I'm freshgiammi.",
      key: 'title1',
      className: 'text-center text-4xl font-bold text-carbon-800 dark:text-carbon-100 md:text-6xl',
      duration: 0.5,
      stagger: 0.05,
    },
    {
      text: 'a fullstack developer, with a passion for web design.',
      key: 'title2',
      className: 'px-3 md:px-0 text-center text-base text-carbon-800 dark:text-carbon-100 md:text-xl',
      duration: 1.5,
      stagger: 0,
    },
  ];

  const projects: HeroProjectProps[] = [
    {
      orientation: 'right',
      key: 'supercharged-next',
      src: Superchargednextimg,
      alt: 'Supercharged-Next',
      title: 'Supercharged-Next',
      description:
        'A supercharged Next.js template that comes with built-in batteries: ' +
        'husky, commitlint, lint-staged and much more.',
      type: 'Web Developement',
      url: 'https://supercharged-next.vercel.app',
      tags: ['Open-Source', 'Next.js', 'React', 'Tailwind'],
    },
    {
      orientation: 'left',
      key: 'escamadul',
      src: Escamadulimg,
      alt: "E' Scamàdul",
      title: "E' Scamàdul",
      description: 'Website design & development. Currently maintained and updated based on scheduled events.',
      type: 'Web Developement',
      url: 'https://escamadul.it',
      tags: ['Wordpress', 'Brizy', 'Web developement'],
    },
    {
      orientation: 'right',
      key: 'jecomm',
      src: Jecommimg,
      alt: 'JECoMM',
      title: 'JECoMM',
      description: 'Website re-design & development. Google Analytics tracking and SEO optimization.',
      type: 'Web Developement',
      url: 'https://jecomm.it',
      tags: ['Wordpress', 'Brizy', 'Web developement', 'Google Analytics'],
    },
  ];

  return (
    <LayoutBlock>
      {/* Hero - Section */}
      <motion.section className='flex-center-column'>
        <div className='grid-row-1 grid grid-cols-1'>
          <div className='col-end-2 row-end-2 space-y-3 self-center'>
            {heroTitle.map(({ key, ...item }, index) => {
              return (
                <AnimatedText
                  key={key}
                  {...item}
                  delay={calculateStaggeredDelay(heroTitle, index)} // This should be an external function.
                />
              );
            })}
          </div>
          <AnimatedWave
            key='wave'
            loop={true}
            className='col-end-2 row-end-2 w-full self-center overflow-hidden opacity-20' // width: fit-content is not working on chrome mobile.
            strokeStyle='stroke-amber-800 dark:stroke-amber-300'
          />
        </div>
        <DownArrow key='downarrow' className='z-10 stroke-carbon-500 dark:stroke-carbon-500' delay={2} />
      </motion.section>
      {/* Projects -  Section */}
      <motion.section
        className='mx-4 space-y-20 py-6 transition-all 
        duration-500  lg:space-y-40 xl:mx-40'
      >
        {projects.map(({ key, ...p }, _i) => {
          return <HeroProject key={key} {...p} />;
        })}
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
