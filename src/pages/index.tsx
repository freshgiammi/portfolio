import AnimatedText, { AnimatedTextProps, calculateStaggeredDelay } from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/LayoutBlock';
import { motion, Variants } from 'framer-motion';
import type { NextPage } from 'next';
import Image from 'next/future/image';
import Link from 'next/link';
import Escamadulimg from '~/img/escamadul.png';
import Jecommimg from '~/img/jecomm.png';
import Superchargednextimg from '~/img/superchargednext.png';
import propic from '~/img/propic.jpg';
import DownArrow from '@/components/animated/DownArrow';

const Home: NextPage = () => {
  const heroTitle: AnimatedTextProps[] = [
    {
      text: "Hi, I'm freshgiammi.",
      key: 'title1',
      className: 'text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100 md:text-6xl',
      duration: 0.5,
      stagger: 0.05,
    },
    {
      text: 'a fullstack developer, with a passion for web design.',
      key: 'title2',
      className: 'px-3 md:px-0 text-center text-base text-zinc-800 dark:text-zinc-100 md:text-xl',
      duration: 1.5,
      stagger: 0,
    },
  ];

  const projects = [
    {
      id: 'supercharged-next',
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
      id: 'escamadul',
      src: Escamadulimg,
      alt: "E' Scamàdul",
      title: "E' Scamàdul",
      description: 'Website design & development. Currently maintained and updated based on scheduled events.',
      type: 'Web Developement',
      url: 'https://escamadul.it',
      tags: ['Wordpress', 'Brizy', 'Web developement'],
    },
    {
      id: 'jecomm',
      src: Jecommimg,
      alt: 'JECoMM',
      title: 'JECoMM',
      description: 'Website re-design & development. Google Analytics tracking and SEO optimization.',
      type: 'Web Developement',
      url: 'https://jecomm.it',
      tags: ['Wordpress', 'Brizy', 'Web developement', 'Google Analytics'],
    },
  ];

  const aboutVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 1,
      },
    },
  };

  const aboutItemVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 1, ease: 'easeInOut' } },
    show: { opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
  };

  const projectVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 1,
      },
    },
  };

  const projectItemVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 1, ease: 'easeInOut' } },
    show: { opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
  };

  return (
    <LayoutBlock>
      {/* Hero - Section */}
      <motion.section className='flex-center-column h-full'>
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
        <DownArrow key='downarrow' className='z-10 stroke-zinc-500 dark:stroke-zinc-500' delay={2} />
      </motion.section>
      {/* About Me -  Section */}
      <motion.section
        className='flex-center-column mx-4 border-t-2 border-amber-800/30 py-12 
      dark:border-amber-300/30 md:mx-12'
      >
        <motion.div
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
          variants={aboutVariants}
          className='grid grid-cols-1 gap-4 self-center lg:grid-cols-2'
        >
          <div className='row-[1_/_1] lg:col-[1_/_2]'>
            <Image
              alt='p.alt'
              src={propic}
              sizes='100vw'
              className='mx-auto h-auto max-w-[200px] rounded-full border-4 
            border-amber-800/30 object-cover shadow brightness-90 dark:border-amber-300/30 
            md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]'
            />
          </div>
          <motion.div
            variants={aboutItemVariants}
            className='z-10 mx-auto space-y-4 self-center text-center text-base text-zinc-800 
          dark:text-zinc-100 md:text-lg lg:col-[2_/_3]'
          >
            <motion.p className='text-4xl font-bold md:text-4xl'>{`Hello there! 👋`}</motion.p>
            <motion.p className='px-3 md:px-0'>
              {`
              I should probably introduce myself: I'm Gianmarco Rengucci, but I usually go 
              by "Freshgiammi" pretty much anywhere.`}
            </motion.p>
            <motion.p className='px-3 md:px-0'>
              {`Born in `}
              <Link href='https://en.wikipedia.org/wiki/Pesaro'>
                <span className='text-amber-800/70 underline dark:text-amber-300/70'>Pesaro</span>
              </Link>
              {` but (self) made in Milan. I graduated with 102/110 in `}
              <Link href='https://www.unimi.it/en/education/computer-science-new-media-communications'>
                <span className='text-amber-800/70 underline dark:text-amber-300/70'>
                  Computer Science for New Media Communications
                </span>
              </Link>
              {` at Università Degli Studi di Milano, with a thesis on `}
              <Link href='https://github.com/freshgiammi/tesi'>
                <span className='text-amber-800/70 underline dark:text-amber-300/70'>
                  an Agent-based Epidemic Model based on Multilayer Networks
                </span>
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
                    className='rounded bg-sepia-200 py-1 px-2 font-ibm-mono text-xs 
                        shadow transition-all duration-500 dark:bg-zinc-800'
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
      {/* Projects -  Section */}
      <motion.section
        className='mx-4 space-y-40 border-t-2 border-amber-800/30 py-12 
      dark:border-amber-300/30 md:mx-12'
      >
        {projects.map((p, i) => {
          return (
            <motion.div
              key={p.id}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true }}
              variants={projectVariants}
              className='grid grid-cols-1 gap-4 text-zinc-800 transition-all duration-500 
              dark:text-zinc-100 lg:grid-cols-12'
            >
              <motion.div
                variants={projectItemVariants}
                className={`${i % 2 === 0 ? 'lg:col-[1_/_10]' : 'lg:col-[4_/_13]'} row-start-1 row-end-2 lg:row-end-1`}
              >
                <Link href={p.url}>
                  <Image
                    alt='p.alt'
                    src={p.src}
                    className='cursor-pointer shadow brightness-90 transition-all duration-500 hover:brightness-100 
                    dark:brightness-50 dark:hover:brightness-75'
                  ></Image>
                </Link>
              </motion.div>
              <motion.div
                variants={projectItemVariants}
                className={`${
                  i % 2 === 0 ? 'text-right lg:col-[9_/_13]' : 'text-left lg:col-[1_/_5]'
                } z-10 row-start-2 row-end-3 space-y-3 self-center lg:row-end-1 
              `}
              >
                <p className='font-ibm-mono text-xs text-amber-600 dark:text-amber-300'>{p.type}</p>
                <p className='text-xl font-bold md:text-4xl'>{p.title}</p>
                <p
                  className='h-full rounded bg-sepia-200 p-4 text-base shadow-xl transition-all duration-500 
                dark:bg-zinc-800 md:text-base'
                >
                  {p.description}
                </p>
                <div
                  className={`${i % 2 === 0 ? 'justify-end' : 'justify-start'} flex flex-row flex-wrap gap-2 
              `}
                >
                  {p.tags.map((t) => {
                    return (
                      <div
                        key={t}
                        /* Keep an eye out: shadow-md has mobile lag. */
                        className='rounded bg-sepia-200 py-1 px-2 font-ibm-mono text-xs 
                        shadow transition-all duration-500 dark:bg-zinc-800'
                      >
                        {t}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.section>
    </LayoutBlock>
  );
};

export default Home;
