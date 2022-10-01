import AnimatedText from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Image from 'next/future/image';
import Link from 'next/link';
import propic from '~/img/propic.jpg';

// ! Ooooouh something ugly is going on in the LayoutBlock props...

const About: NextPage = () => {
  const aboutVariants: Variants = {
    hidden: { opacity: 0, x: -100, transition: { delay: 0.5, duration: 1, ease: 'easeInOut' } },
    show: { opacity: 1, x: 0, transition: { delay: 0.5, duration: 1, ease: 'easeInOut' } },
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 1.5,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <LayoutBlock className='pt-[var(--navbar-height)]'>
      {/* Hero - Section */}
      <motion.section variants={container} initial='hidden' animate='show' className='flex-center-column'>
        <motion.div variants={item} className='grid-row-1 grid grid-cols-1 sm:pt-10'>
          <div className='col-end-2 row-end-2 space-y-3 self-center'>
            <AnimatedText
              key='aboutme-hero'
              text='About me'
              className='text-center text-4xl font-bold text-carbon-800 dark:text-carbon-100 md:text-6xl'
            />
          </div>
          <AnimatedWave
            key='wave'
            loop={true}
            className='col-end-2 row-end-2 w-full self-center overflow-hidden opacity-20' // width: fit-content is not working on chrome mobile.
            strokeStyle='stroke-amber-800 dark:stroke-amber-300'
          />
        </motion.div>
        <motion.div
          variants={item}
          className='mx-4 grid h-full grid-cols-1 gap-8 self-center py-6 text-center 
          sm:py-24 lg:grid-cols-2 lg:text-left xl:mx-40'
        >
          <div className='row-[1_/_1] self-center lg:col-[1_/_2]'>
            <Image
              alt='p.alt'
              src={propic}
              sizes='100vw'
              className='img-squareshadow mx-auto h-auto max-w-[200px] rounded object-cover shadow brightness-90
            md:max-w-[300px] lg:max-w-[400px]'
            />
          </div>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
            variants={aboutVariants}
            className='z-10 mx-auto space-y-4 self-center text-base text-carbon-800 dark:text-carbon-100 
          md:text-lg lg:col-[2_/_3]'
          >
            <motion.p className='text-4xl font-bold md:text-4xl'>{`Hello there! 👋`}</motion.p>
            <motion.p className='px-3 md:px-0'>
              {`
              I should probably introduce myself: I'm Gianmarco Rengucci, but I usually go 
              by "Freshgiammi" pretty much anywhere.`}
            </motion.p>
            <motion.p className='px-3 md:px-0'>
              {`Born in `}
              <Link href='https://en.wikipedia.org/wiki/Pesaro' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>Pesaro</a>
              </Link>
              {` but (self) made in Milan. I graduated with 102/110 in `}
              <Link href='https://www.unimi.it/en/education/computer-science-new-media-communications' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>
                  Computer Science for New Media Communications
                </a>
              </Link>
              {` at Università Degli Studi di Milano, with a thesis on `}
              <Link href='https://github.com/freshgiammi/tesi' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>
                  an Agent-based Epidemic Model based on Multilayer Networks
                </a>
              </Link>
              {`.`}
            </motion.p>
            <motion.p className='px-3 md:px-0 '>
              {`I am interested in technology, design, and everything
              that's digital. I may run on coffee, but my entire house runs on GNU/Linux:
              I’m usually contributing to OSS software or tweaking smart home automation in my spare time.
              `}
            </motion.p>
            <div
              className={`flex flex-row flex-wrap justify-center gap-2 
              `}
            >
              {[
                'Wordpress',
                'ReactJS',
                'Next.js',
                'Tailwind',
                'HTML/CSS',
                'Postgres',
                'Redis',
                'Linux',
                'Docker',
                'Git',
              ].map((t) => {
                return (
                  <div
                    key={t}
                    /* Keep an eye out: shadow-md has mobile lag. */
                    className='shadow-relaxed  rounded bg-sepia-200 py-1 px-2 font-ibm-mono 
                        text-xs transition-all duration-500 dark:bg-carbon-800'
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </LayoutBlock>
  );
};

export default About;
