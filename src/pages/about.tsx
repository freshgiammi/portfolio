import AnimatedText from '@/components/animated/AnimatedText';
import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Image from 'next/future/image';
import Link from 'next/link';
import img1 from '~/img/cardstack/img1.jpg';
import img2 from '~/img/cardstack/img2.jpg';
import img4 from '~/img/cardstack/img4.jpg';
import bannerpic from '~/img/bannerpic.jpg';
import CardStack from '@/components/animated/CardStack';

// ! Ooooouh something ugly is going on in the dLayoutBlock props...

const About: NextPage = () => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <LayoutBlock className='pt-[var(--navbar-height)]'>
      {/* Banner - Section */}
      <motion.section initial='hidden' animate='show' variants={container} className='flex-center-column mb-20'>
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
      {/* Hero - Section */}
      <motion.section className='flex-center-column mb-20'>
        <motion.div className='mx-4 grid grid-cols-1 gap-8 md:mx-20 lg:grid-cols-2 lg:text-left'>
          <motion.div className='lg:col-[1_/_2]'>
            <CardStack cardImages={[img1, img2, bannerpic, img4]} />
          </motion.div>
          <motion.div className='space-y-4 text-lg text-carbon-800 dark:text-carbon-100 lg:col-[2_/_3]'>
            <motion.p className='text-4xl font-bold md:text-4xl'>{`Hello there! 👋`}</motion.p>
            <motion.p>
              {`
              I should probably introduce myself: I'm `}
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
        </motion.div>
      </motion.section>
      {/* Skills - Section */}
    </LayoutBlock>
  );
};

export default About;
