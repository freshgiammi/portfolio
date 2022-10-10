import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';

import bannerpic from '~/img/projects/bannerpic.webp';
import workingon from '~/img/projects/workingon.webp';
import escamadul from '~/img/escamadul.webp';
import superchargednext from '~/img/superchargednext.webp';
import jecomm from '~/img/jecomm.webp';
import CardHover from '@/components/animated/CardHover';
import Link from 'next/link';
import Tag from '@/components/Tag';
import Divider from '@/components/Divider';
import HeroProject, { HeroProjectProps } from '@/components/HeroProject';

const projects: HeroProjectProps[] = [
  {
    orientation: 'right',
    key: 'supercharged-next',
    src: superchargednext,
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
    src: escamadul,
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
    src: jecomm,
    alt: 'JECoMM',
    title: 'JECoMM',
    description: 'Website re-design & development. Google Analytics tracking and SEO optimization.',
    type: 'Web Developement',
    url: 'https://jecomm.it',
    tags: ['Wordpress', 'Brizy', 'Web developement', 'Google Analytics'],
  },
];

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

  const scrollInView: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
  };

  return (
    <LayoutBlock className='pt-[var(--navbar-height)]'>
      {/* Hero - Section */}
      <motion.section className='section-common' initial='hidden' animate='visible' variants={container}>
        <motion.div variants={scrollInView} className='my-20 w-full space-y-4'>
          <Tag text='Current project: Supercharged-Next' />
          <motion.p className='text-4xl font-bold md:w-5/6 md:text-6xl md:leading-[1.2]'>
            My next project is always around the corner.
          </motion.p>
          <motion.p className='text-lg font-light md:text-xl'>
            {'I like to build things for the web, but I guess you got that by now.'}
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Projects -  Section */}
      <motion.section className='section-common mb:my-20 mb-6 space-y-20'>
        {projects.map(({ key, ...p }, _i) => {
          return <HeroProject key={key} {...p} />;
        })}
      </motion.section>
      {/* Divider */}
      <Divider />
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
              {`I'm currently working on a `}
              <Link href='https://github.com/freshgiammi-lab/supercharged-next' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>
                  template for bootstrapping Next.js applications
                </a>
              </Link>
              {` with Tailwind CSS, TypeScript, and a lot of utilities like husky, commitlint and more.`}
            </motion.p>
            <motion.p>
              {`I maintain `}
              <Link href='https://github.com/freshgiammi-lab/connect-typeorm' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>connect-typeorm</a>
              </Link>
              {`, a TypeORM-based session store that integrates nicely with express-session.`}
            </motion.p>
            <motion.p>
              {`I also hack hardware when I get the chance, besides building web things. So far I've hacked
            a `}
              <strong>TP-Link TD-W8970 v1</strong>
              {`, which now runs OpenWRT and is used as a WiFi access point. I've also hacked a 
            `}
              <strong>Ikea VINDRIKTNING</strong>
              {`, which now feeds temperature and humidity values directly to my Raspberry Pi home server
            via a Wesmos D1 Mini.`}
            </motion.p>
            <motion.p>
              {`Now that I've mentioned, `}
              <Link href='https://github.com/freshgiammi/raspi-milan' scroll={false}>
                <a className='highlighted font-semibold text-amber-800/70 dark:text-amber-300/70'>
                  {"want to check out what I've done at home with a Raspberry Pi?"}
                </a>
              </Link>
            </motion.p>
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
            className='grid grid-cols-2 grid-rows-2 gap-8 text-center text-xl font-bold text-white 
            md:max-h-[60vw] lg:text-2xl xl:max-h-[30vw]'
          >
            <motion.div variants={scrollInView} className='col-[1_/_2] row-[1_/_3]'>
              <CardHover src={workingon}>
                <motion.p>{'Building the next big thing... or something like that.'}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[1_/_2]'>
              <CardHover src={superchargednext}>
                <motion.p>{'Giving back to the community, as well!'}</motion.p>
              </CardHover>
            </motion.div>
            <motion.div variants={scrollInView} className='col-[2_/_3] row-[2_/_3]'>
              <CardHover src={bannerpic}>
                <motion.p>{'I hack things, sometimes!'}</motion.p>
              </CardHover>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </LayoutBlock>
  );
};

export default Projects;
