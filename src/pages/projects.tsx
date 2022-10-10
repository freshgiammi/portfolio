import AnimatedText from '@/components/animated/AnimatedText';
import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Image from 'next/future/image';

import bannerpic from '~/img/projects/bannerpic.jpg';
import workingon from '~/img/projects/workingon.png';
import escamadul from '~/img/escamadul.png';
import CardHover from '@/components/animated/CardHover';
import Link from 'next/link';

const Projects: NextPage = () => {
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
            key='projects-hero'
            text='Projects'
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
            <motion.p className='flex text-4xl font-bold'>{`I do a bunch of stuff.`}</motion.p>
            <motion.p>
              {`I'm mainly interested in building things for the web. I'm currently working on a `}
              <Link href='https://github.com/freshgiammi-lab/supercharged-next' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>
                  template for bootstrapping Next.js applications
                </a>
              </Link>
              {` with Tailwind CSS, TypeScript, and a lot of utilities like husky, commitlint and more.`}
            </motion.p>
            <motion.p>{`I also hack hardware when I get the chance, besides building web things.`}</motion.p>
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
            className='grid grid-cols-2 grid-rows-2 gap-8 text-center text-2xl font-bold text-white 
            md:max-h-[60vw] lg:text-4xl xl:max-h-[30vw]'
          >
            <motion.div variants={scrollInView} className='col-[1_/_2] row-[1_/_3]'>
              <CardHover src={workingon}>
                <motion.p>{"What I'm working on."}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[1_/_2]'>
              <CardHover src={escamadul}>
                <motion.p>{"What I've built."}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[2_/_3]'>
              <CardHover src={bannerpic}>
                <motion.p>{"What I've hacked."}</motion.p>
              </CardHover>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Projects;
