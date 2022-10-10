import LayoutBlock from '@/components/layouts/LayoutBlock';
import { motion, useScroll, useSpring, useTransform, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Escamadulimg from '~/img/escamadul.webp';
import Jecommimg from '~/img/jecomm.webp';
import Superchargednextimg from '~/img/superchargednext.webp';

import DownArrow from '@/components/animated/DownArrow';
import useMousePosition from '@/hooks/animated/useMousePosition';
import Image from 'next/future/image';
import heroPropic from '~/img/hero_propic.webp';
import bannerpic from '~/img/bannerpic.webp';
import friendspic from '~/img/friendspic.webp';
import familypic from '~/img/familypic.webp';
import Button from '@/components/Button';
import Link from 'next/link';
import { HighlightedText } from '@/components/animated/HighlightedText';
import ProjectStack, { ProjectStackData } from '@/components/animated/ProjectStack';
import CardHover from '@/components/animated/CardHover';
import Divider from '@/components/Divider';
import Tag from '@/components/Tag';

const projects: ProjectStackData[] = [
  {
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

const Home: NextPage = () => {
  const { x, y } = useMousePosition(0, (a: number) => a / 50);
  const { scrollY: y2 } = useScroll();

  const springConfig = { stiffness: 900, damping: 100 };
  const yPic = useSpring(useTransform(y2, [0, 1000], [0, 100]), springConfig);

  const heroTopAnim: Variants = {
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const scrollInView: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeInOut' } },
  };

  return (
    <LayoutBlock className='overflow-hidden'>
      {/* Hero - Section */}
      <motion.section className='section-common flex-center-column hero-full'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={heroTopAnim}
          className='grid h-full grid-cols-12 text-4xl
        text-carbon-800 dark:text-zinc-100 md:text-7xl md:leading-[5rem]'
        >
          <motion.div
            variants={heroTopAnim}
            className='z-10 col-[1_/_13] row-end-1 space-y-3 self-center px-4 md:px-0 lg:col-[1_/_8]'
            style={{ y, x }}
          >
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={scrollInView} className='text-center font-bold'>
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
              <motion.p variants={scrollInView} className='text-center text-2xl font-light md:text-5xl'>
                {"I'm a fullstack developer & web designer based in "}
                <HighlightedText>{'Milan, Italy'}</HighlightedText>
                {'. '}
              </motion.p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, width: 0 },
                visible: { opacity: 1, width: '100%', transition: { duration: 2, ease: 'easeInOut' } },
              }}
              className='paragraph-divider  
            after:m-0 after:bg-amber-800/30 dark:after:bg-amber-300/30'
            />
            <motion.div className='flex-center-row overflow-hidden'>
              <motion.p variants={scrollInView} className='text-center text-sm font-light md:text-base'>
                {"* Technically speaking I'm just a website, but that's who built me."}
              </motion.p>
            </motion.div>
          </motion.div>
          <motion.div
            variants={scrollInView}
            className='col-[1_/_13] row-end-1 space-y-3 lg:col-[9_/_13]'
            style={{ y: yPic }}
          >
            <Image
              alt='p.alt'
              src={heroPropic}
              sizes='100vw'
              placeholder='blur'
              className='img-squareshadow mx-auto w-1/2 rounded object-cover opacity-10 shadow lg:w-5/6 lg:opacity-100'
            />
          </motion.div>
        </motion.div>
        <DownArrow key='downarrow' className='absolute bottom-8 stroke-carbon-500 dark:stroke-carbon-500' delay={2} />
      </motion.section>
      {/* Divider */}
      <Divider />
      {/* Projects -  Section */}
      <motion.section className='section-common my-12 md:my-20 lg:my-44'>
        <motion.div className='grid grid-cols-1 gap-8 lg:grid-cols-12 lg:text-left'>
          <ProjectStack data={projects} />
        </motion.div>
      </motion.section>
      {/* Divider */}
      <Divider />
      {/* About -  Section */}
      <motion.section className='section-common my-12 md:my-20 lg:my-44'>
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
            className='space-y-4 self-center text-3xl font-medium
          text-carbon-800 dark:text-zinc-100 md:text-5xl md:font-bold'
          >
            <Tag text='Available for hire!' badge='success' />
            <motion.h1 className='w-full'>
              {'I develop digital products, create '}
              <HighlightedText>{'experiences'}</HighlightedText>
              {' and I have a thing for intuitively implemented UX.'}
            </motion.h1>
            <Link href='/about' passHref scroll={false}>
              <a>
                <Button>About me</Button>
              </a>
            </Link>
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
            className='grid grid-cols-2 grid-rows-2 gap-8 text-center text-xl font-bold text-white lg:text-2xl'
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
    </LayoutBlock>
  );
};

export default Home;
