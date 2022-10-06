import { motion, MotionProps, useScroll, useTransform, Variants } from 'framer-motion';
import Image, { StaticImageData } from 'next/future/image';
import Link from 'next/link';

import { useParallax } from 'react-scroll-parallax';
import { UrlObject } from 'url';
import Tilt from 'react-parallax-tilt';
import { useRef } from 'react';
import AnimatedText from './animated/AnimatedText';

export interface HeroProjectProps {
  orientation: 'left' | 'right';
  key: string;
  src: string | StaticImageData;
  alt: string;
  title: string;
  description: string;
  type: string;
  url: string | UrlObject;
  tags?: string[];
}

export default function HeroProject({ orientation, tags = [], ...props }: HeroProjectProps) {
  const parallax = useParallax<HTMLDivElement>({
    translateY: [+20, -20],
    easing: 'easeInOut',
    shouldAlwaysCompleteAnimation: true,
  });

  const projectVariants: Variants = {
    hidden: { opacity: 0, transition: { delay: 0.5, duration: 1, ease: 'easeInOut' } },
    show: { opacity: 1, transition: { delay: 0.5, duration: 1, ease: 'easeInOut' } },
  };

  const animation: MotionProps = {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true },
    variants: projectVariants,
  };

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <motion.div
      ref={ref}
      className='grid grid-cols-12 gap-4 px-4 text-carbon-800 transition-all 
    duration-500 dark:text-carbon-100 lg:px-20 xl:px-44 '
      style={{ opacity }}
    >
      <motion.div
        className={`${orientation === 'right' ? 'lg:col-[1_/_8]' : 'lg:col-[6_/_13]'} 
        relative col-[1_/_13] lg:row-end-1`}
      >
        <Tilt reset={false} tiltMaxAngleX={15} tiltMaxAngleY={15} transitionSpeed={2000} gyroscope={true}>
          {/* An anchor element is needed to pass href to Link element. */}
          <Link href={props.url} passHref scroll={false}>
            <motion.div>
              <Image
                alt='p.alt'
                src={props.src}
                className='img-squareshadow cursor-pointer brightness-75 hover:brightness-100'
              ></Image>
            </motion.div>
          </Link>
        </Tilt>
      </motion.div>
      <motion.div
        ref={parallax.ref}
        className={`${
          orientation === 'right' ? 'text-right lg:col-[8_/_13]' : 'text-left lg:col-[1_/_6]'
        } z-10 col-[1_/_13] space-y-3 self-center lg:row-end-1
`}
      >
        <motion.div
          {...animation}
          className={`${
            orientation === 'right' ? 'justify-end' : 'justify-start'
          } flex w-full flex-row flex-wrap gap-2`}
        >
          <p
            className='shadow-relaxed rounded bg-amber-600/30 py-1 px-2 font-ibm-mono 
            text-xs transition-colors duration-500 dark:bg-amber-300/30'
          >
            {props.type}
          </p>
        </motion.div>
        <AnimatedText
          stagger={0.05}
          key={`${props.key}-title`}
          text={props.title}
          className='text-4xl font-bold md:text-5xl xl:text-6xl'
        />

        <motion.div
          {...animation}
          className={`${
            orientation === 'right' ? 'justify-end' : 'justify-start'
          } flex w-full flex-row flex-wrap gap-2`}
        >
          <p className='h-full w-5/6 text-base transition-colors duration-500'>{props.description}</p>
        </motion.div>
        <div
          className={`${orientation === 'right' ? 'justify-end' : 'justify-start'} flex flex-row flex-wrap gap-2 
`}
        >
          {tags.map((t) => {
            return (
              <motion.div
                {...animation}
                key={t}
                className='shadow-relaxed rounded bg-sepia-200 py-1 px-2 font-ibm-mono 
            text-xs transition-colors duration-500 dark:bg-carbon-800'
              >
                {t}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
