import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, useScroll, useSpring, useTransform, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Escamadulimg from '~/img/escamadul.png';
import Jecommimg from '~/img/jecomm.png';
import Superchargednextimg from '~/img/superchargednext.png';

import DownArrow from '@/components/animated/DownArrow';
import HeroProject, { HeroProjectProps } from '@/components/HeroProject';
import { ScrollLinkedOpacityText } from '@/components/animated/ScrollLinkedOpacityText';
import HandWave from '~/assets/handwave.svg';
import useMousePosition from '@/hooks/animated/useMousePosition';
import Image from 'next/future/image';
import heroPropic from '~/img/hero_propic.jpg';
import Button from '@/components/Button';
import Link from 'next/link';

const Home: NextPage = () => {
  const { x, y } = useMousePosition(0, (a: number) => a / 50);
  const { scrollY: y2 } = useScroll();

  const springConfig = { stiffness: 900, damping: 100 };
  const yPic = useSpring(useTransform(y2, [0, 1000], [0, 200]), springConfig);

  const projects: HeroProjectProps[] = [
    {
      orientation: 'right',
      key: 'supercharged-next',
      src: Superchargednextimg,
      alt: 'Supercharged Next',
      title: 'Supercharged Next',
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

  const highlightedSlideIn: Variants = {
    hidden: { backgroundSize: '0% 50%' },
    show: { backgroundSize: '100% 50%', transition: { delay: 1, duration: 2, ease: 'easeInOut' } },
  };

  const animatedHighlighted = (text: string) => {
    return (
      <motion.span
        className='highlighted font-fraunces font-bold text-amber-800/70 dark:text-amber-300/70'
        initial='hidden'
        whileInView='show'
        viewport={{ once: true }}
        variants={highlightedSlideIn}
      >
        {text}
      </motion.span>
    );
  };

  const heroAnim: Variants = {
    hidden: { opacity: 0, y: 100 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
  };

  const dividerAnim: Variants = {
    hidden: { opacity: 0, width: 0 },
    show: { opacity: 1, width: '100%', transition: { duration: 2, ease: 'easeInOut' } },
  };

  const heroTopAnim: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  return (
    <LayoutBlock className='overflow-hidden'>
      {/* Hero - Section */}
      <motion.section className='flex-center-column hero-full'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={heroTopAnim}
          className='grid h-full grid-cols-12 text-4xl
        text-carbon-800 dark:text-zinc-100 md:px-32 md:text-7xl md:leading-[5rem]'
        >
          <motion.div
            variants={heroTopAnim}
            className='z-10 col-[1_/_13] row-end-1 space-y-3 self-center px-4 md:px-0 lg:col-[1_/_8]'
            style={{ y, x }}
          >
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={heroAnim} className='text-center font-bold'>
                {"Hi, I'm freshgiammi."}
                <motion.span
                  className='inline-block h-6 md:h-10'
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, loop: Infinity, ease: 'linear' }}
                >
                  {'*'}
                </motion.span>
              </motion.p>
            </motion.div>
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={heroAnim} className='text-center text-2xl font-light md:text-5xl'>
                {"I'm a fullstack developer & web designer based in "}
                {animatedHighlighted('Milan, Italy')}
                {'. '}
              </motion.p>
            </motion.div>
            <motion.div
              variants={dividerAnim}
              className='paragraph-divider  
            after:m-0 after:bg-amber-800/30 dark:after:bg-amber-300/30'
            />
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={heroAnim} className='text-center text-sm font-light md:text-base'>
                {"* Technically speaking I'm just a website, but that's who built me."}
              </motion.p>
            </motion.div>
          </motion.div>
          <motion.div
            variants={heroAnim}
            className='col-[1_/_13] row-end-1 space-y-3 lg:col-[9_/_13]'
            style={{ y: yPic }}
          >
            <Image
              alt='p.alt'
              src={heroPropic}
              sizes='100vw'
              className='img-squareshadow mx-auto w-1/2 rounded object-cover opacity-10 shadow 
              dark:opacity-20 lg:w-5/6 lg:opacity-100'
            />
          </motion.div>
        </motion.div>
        <DownArrow key='downarrow' className='absolute bottom-8 stroke-carbon-500 dark:stroke-carbon-500' delay={2} />
      </motion.section>
      {/* About -  Section */}
      <motion.section className='section-common'>
        <div
          className='paragraph-divider flex flex-row items-center justify-start space-x-2 
        font-ibm-mono text-base font-semibold after:bg-amber-800/30 dark:after:bg-amber-300/30 md:text-2xl'
        >
          <h2 className='text-amber-800/60 dark:text-amber-300/60'>01.</h2>
          <h2 className='highlighted'>About</h2>
        </div>
        <motion.div
          className='flex flex-col items-center justify-center
        text-3xl font-medium tracking-tight text-carbon-800 dark:text-zinc-100 
        md:text-6xl xl:px-20'
        >
          <div className='grid-row-1 grid grid-cols-12'>
            <div className='col-[1_/_13] row-end-2 mx-4 space-y-14 sm:col-[1_/_11] md:mx-10 md:space-y-20'>
              <ScrollLinkedOpacityText className='w-full text-carbon-800 dark:text-zinc-100'>
                {'I develop digital products, create '}
                {animatedHighlighted('experiences')}
                {' and I have a thing for '}
                {animatedHighlighted('intuitively implemented')}
                {' UX'}.
              </ScrollLinkedOpacityText>
              <ScrollLinkedOpacityText className='w-full text-carbon-800 dark:text-zinc-100'>
                {'Currently working at '}
                {animatedHighlighted('Deloitte Risk Advisory')}
                {', where I develop custom solutions for clients while leading teams across different fields.'}
              </ScrollLinkedOpacityText>
              <Link href='/about' passHref scroll={false}>
                <a>
                  <Button>{'Want to know more?'}</Button>
                </a>
              </Link>
            </div>
            <div className='-z-10 col-[1_/_2] row-end-2 sm:col-[1_/_13] sm:self-center sm:justify-self-end'>
              <HandWave className='wave opacity-30 md:opacity-10' />
            </div>
          </div>
        </motion.div>
      </motion.section>
      {/* Projects -  Section */}
      <motion.section className='section-common my-6 md:my-20'>
        <div
          className='paragraph-divider flex flex-row items-center justify-start space-x-2 
        font-ibm-mono text-base font-semibold after:bg-amber-800/30 dark:after:bg-amber-300/30 md:text-2xl'
        >
          <h2 className='text-amber-800/60 dark:text-amber-300/60'>02.</h2>
          <h2 className='highlighted'>Projects</h2>
        </div>
        {projects.map(({ key, ...p }, _i) => {
          return <HeroProject key={key} {...p} />;
        })}
      </motion.section>
      {/* Contact -  Section */}
      <motion.section className='section-common mb-6 md:mb-20'>
        <div
          className='paragraph-divider flex flex-row items-center justify-start space-x-2 
        font-ibm-mono text-base font-semibold after:bg-amber-800/30 dark:after:bg-amber-300/30 md:text-2xl'
        >
          <h2 className='text-amber-800/60 dark:text-amber-300/60'>03.</h2>
          <h2 className='highlighted'>Contact</h2>
        </div>
        <motion.div className='h-fulldark:text-zinc-100 text-center text-4xl font-medium text-carbon-800 md:text-6xl'>
          <p className='w-full text-carbon-800 dark:text-zinc-100'>
            {'Have an idea already? Send me a message and '}
            {animatedHighlighted("let's jam!")}
          </p>
        </motion.div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
