import AnimatedText from '@/components/animated/AnimatedText';
import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Image from 'next/future/image';
import Link from 'next/link';
import HandWave from '~/assets/handwave.svg';

import friendspic from '~/img/friendspic.jpg';
import familypic from '~/img/familypic.jpg';
import bannerpic from '~/img/bannerpic.jpg';
import CardHover from '@/components/animated/CardHover';
import Divider from '@/components/Divider';

// ! Ooooouh something ugly is going on in the dLayoutBlock props...

const About: NextPage = () => {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const scrollInView: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
  };

  return (
    <LayoutBlock className='pt-[var(--navbar-height)]'>
      {/* Banner - Section */}
      <motion.section initial='hidden' animate='visible' variants={container} className='flex-center-column'>
        <motion.div variants={item} className='relative w-full'>
          <Image
            alt='p.alt'
            src={bannerpic}
            sizes='100vw'
            className='mx-auto h-[150px] w-full object-cover object-[15%_50%] brightness-50 md:h-[200px]'
          />
        </motion.div>
        <motion.div variants={item} className='absolute self-center'>
          <AnimatedText
            key='aboutme-hero'
            text='About me'
            className='text-center text-4xl font-bold text-carbon-100 dark:text-carbon-100 md:text-6xl'
          />
        </motion.div>
      </motion.section>
      {/* Story - Section */}
      <motion.section className='section-common my-12 md:my-20' initial='hidden' animate='visible' variants={container}>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={{
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 1,
              },
            },
          }}
          className=' grid grid-cols-1 grid-rows-1 gap-8 lg:grid-cols-[3fr_2fr]'
        >
          <motion.div
            variants={scrollInView}
            className='space-y-4 self-center text-lg text-carbon-800 dark:text-carbon-100'
          >
            <motion.p className='flex text-4xl font-bold md:text-4xl'>
              {`Hello there!`} <HandWave className='wave ml-4' />
            </motion.p>
            <motion.p>
              {`I'm `}
              <strong>Gianmarco Rengucci</strong>
              {`, but I usually go 
              by "Freshgiammi" pretty much anywhere.`}
            </motion.p>
            <motion.p>
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
            <motion.p>
              {`I am interested in technology, design, and everything
              that's digital. I may run on coffee, but my entire house runs on GNU/Linux:
              I’m usually contributing to OSS software or tweaking smart home automation in my spare time.
              `}
            </motion.p>
            <div className={`flex flex-row flex-wrap gap-2 `}>
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
                    className='shadow-relaxed rounded bg-sepia-200 py-1 px-2 font-ibm-mono 
                        text-xs transition-all duration-500 dark:bg-carbon-800'
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className='grid grid-cols-2 grid-rows-2 gap-8 text-center text-2xl font-bold text-white lg:text-4xl'
          >
            <motion.div variants={scrollInView} className='col-[1_/_2] row-[1_/_3]'>
              <CardHover src={bannerpic}>
                <motion.p>{"That's me!"}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[1_/_2]'>
              <CardHover src={friendspic}>
                <motion.p>{'These are my friends.'}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[2_/_3]'>
              <CardHover src={familypic}>
                <motion.p>{'And this is my family.'}</motion.p>
              </CardHover>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
      {/* Divider */}
      <Divider />
      {/* Skills - Section */}
      <motion.section className='section-common my-12 md:my-20' initial='hidden' animate='visible' variants={container}>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={{
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.5,
              },
            },
          }}
          className=' grid grid-cols-1 grid-rows-1 gap-20 lg:grid-cols-[1fr_1fr]'
        >
          <motion.div variants={scrollInView} className='space-y-4 text-lg text-carbon-800 dark:text-carbon-100'>
            <motion.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
              }}
              className='mb-10 flex flex-row items-center justify-start space-x-2 
        font-ibm-mono text-base font-semibold after:bg-amber-800/30 dark:after:bg-amber-300/30 md:mb-20 md:text-2xl
        '
            >
              <h2 className='text-amber-800/60 dark:text-amber-300/60'>01.</h2>
              <h2 className='highlighted'>Education</h2>
            </motion.div>
            <motion.ul
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut', staggerChildren: 0.5 } },
              }}
              className='w-5/6 list-none space-y-14'
            >
              <motion.li
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
                }}
              >
                <h2 className='text-lg font-light'>2021</h2>
                <p className='text-2xl font-semibold'> BSc Computer Science / Università degli Studi di Milano</p>
              </motion.li>
              <motion.li
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
                }}
              >
                <h2 className='text-lg font-light'>2017</h2>
                <p className='text-2xl font-semibold'>High School Diploma / Liceo Linguistico “T. Mamiani”, Pesaro</p>
              </motion.li>
            </motion.ul>
          </motion.div>
          <motion.div variants={scrollInView} className='space-y-4 text-lg text-carbon-800 dark:text-carbon-100'>
            <motion.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
              }}
              className='mb-10 flex flex-row items-center justify-start space-x-2 
        font-ibm-mono text-base font-semibold after:bg-amber-800/30 dark:after:bg-amber-300/30 md:mb-20 md:text-2xl
        '
            >
              <h2 className='text-amber-800/60 dark:text-amber-300/60'>02.</h2>
              <h2 className='highlighted'>Work Experience</h2>
            </motion.div>
            <motion.ul
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut', staggerChildren: 0.5 } },
              }}
              className='w-5/6 list-none space-y-14'
            >
              <motion.li
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
                }}
              >
                <h2 className='text-lg font-light'>April 2021 - Current</h2>
                <p className='text-2xl font-semibold'>
                  {' '}
                  Fullstack developer (Consultant) /{' '}
                  <Link href='https://www2.deloitte.com/it/it/services/risk.html?icid=top_risk' scroll={false}>
                    <a className='highlighted text-amber-800/70 dark:text-amber-300/70'>Deloitte Risk Advisory</a>
                  </Link>
                </p>
              </motion.li>
              <motion.li
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 2, ease: 'easeInOut' } },
                }}
              >
                <h2 className='text-lg font-light'>May 2019 - March 2021</h2>
                <p className='text-2xl font-semibold'>
                  Associate (Communication team) /{' '}
                  <Link href='https://jecomm.it/' scroll={false}>
                    <a className='highlighted text-amber-800/70 dark:text-amber-300/70'>JECoMM</a>
                  </Link>
                </p>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </motion.section>
      {/* Divider */}
      <Divider />
    </LayoutBlock>
  );
};

export default About;
