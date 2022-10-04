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
import { HighlightedText } from '@/components/animated/HighlightedText';

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

  const heroTopAnim: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const scrollInVIew: Variants = {
    hidden: { opacity: 0, y: 100 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
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
              <motion.p variants={scrollInVIew} className='text-center font-bold'>
                {"Hi, I'm freshgiammi."}
                <motion.span
                  className='inline-block h-6 md:h-12'
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, loop: Infinity, ease: 'linear' }}
                >
                  {'*'}
                </motion.span>
              </motion.p>
            </motion.div>
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={scrollInVIew} className='text-center text-2xl font-light md:text-5xl'>
                {"I'm a fullstack developer & web designer based in "}
                <HighlightedText>{'Milan, Italy'}</HighlightedText>
                {'. '}
              </motion.p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, width: 0 },
                show: { opacity: 1, width: '100%', transition: { duration: 2, ease: 'easeInOut' } },
              }}
              className='paragraph-divider  
            after:m-0 after:bg-amber-800/30 dark:after:bg-amber-300/30'
            />
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={scrollInVIew} className='text-center text-sm font-light md:text-base'>
                {"* Technically speaking I'm just a website, but that's who built me."}
              </motion.p>
            </motion.div>
          </motion.div>
          <motion.div
            variants={scrollInVIew}
            className='col-[1_/_13] row-end-1 space-y-3 lg:col-[9_/_13]'
            style={{ y: yPic }}
          >
            <Image
              alt='p.alt'
              src={heroPropic}
              sizes='100vw'
              className='img-squareshadow mx-auto w-1/2 rounded object-cover opacity-10 shadow lg:w-5/6 lg:opacity-100'
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
        md:text-5xl xl:px-20 xl:text-6xl'
        >
          <div className='grid-row-1 grid grid-cols-12'>
            <div
              className='col-[1_/_13] row-end-2 mx-4 space-y-14 overflow-hidden pb-4 
            sm:col-[1_/_10] md:mx-10 md:space-y-20'
            >
              <ScrollLinkedOpacityText
                initial='hidden'
                whileInView='show'
                viewport={{ once: true }}
                variants={{
                  hidden: { y: 100 },
                  show: { y: 0, transition: { duration: 1, ease: 'easeInOut' } },
                }}
                className='w-full text-carbon-800 dark:text-zinc-100'
              >
                {'I develop digital products, create '}
                <HighlightedText>{'experiences'}</HighlightedText>
                {' and I have a thing for '}
                <HighlightedText>{'intuitively implemented'}</HighlightedText>
                {' UX'}.
              </ScrollLinkedOpacityText>
              <ScrollLinkedOpacityText
                initial='hidden'
                whileInView='show'
                viewport={{ once: true }}
                variants={{
                  hidden: { y: 100 },
                  show: { y: 0, transition: { duration: 1, ease: 'easeInOut' } },
                }}
                className='w-full text-carbon-800 dark:text-zinc-100'
              >
                {'Currently working at '}
                <HighlightedText>{'Deloitte Risk Advisory'}</HighlightedText>
                {', where I develop custom solutions for clients while leading teams across different fields.'}
              </ScrollLinkedOpacityText>
              <Link href='/about' passHref scroll={false}>
                <a>
                  <Button className='img-squareshadow'>{'Want to know more?'}</Button>
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
        <motion.div
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
          variants={heroTopAnim}
          className='grid h-full grid-cols-12 grid-rows-2 gap-4 text-center text-3xl font-medium text-carbon-800 
            dark:text-zinc-100 md:text-5xl'
        >
          <div className='col-[1_/_13] row-end-1 self-center overflow-hidden'>
            <motion.p variants={scrollInVIew} className='text-carbon-800 dark:text-zinc-100'>
              {'Have an idea already?'}
              <HighlightedText>{"Let's jam."}</HighlightedText>
            </motion.p>
          </div>
          <div className='col-[1_/_13] row-end-2 flex justify-center overflow-hidden'>
            <Link href='mailto:rengucci.gianmarco@gmail.com' passHref>
              <a>
                <motion.p
                  variants={scrollInVIew}
                  className='underline-custom w-fit text-lg text-carbon-500 dark:text-zinc-300 md:text-3xl'
                >
                  {'rengucci.gianmarco@gmail.com'}
                </motion.p>
              </a>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
