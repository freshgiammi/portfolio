import { motion, MotionProps, Variants } from 'framer-motion';
import Image, { StaticImageData } from 'next/future/image';
import Link from 'next/link';

import { useParallax } from 'react-scroll-parallax';
import { UrlObject } from 'url';
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

  return (
    <motion.div
      className='grid grid-cols-12 gap-4 text-carbon-800 transition-all duration-500 
    dark:text-carbon-100 xl:px-20'
    >
      <motion.div
        className={`${orientation === 'right' ? 'lg:col-[1_/_10]' : 'lg:col-[4_/_13]'} 
        relative col-[1_/_13] lg:row-end-1`}
      >
        {/* An anchor element is needed to pass href to Link element. */}
        <Link href={props.url} passHref scroll={false}>
          <a>
            <Image alt='p.alt' src={props.src} className='shadow-relaxed cursor-pointer'></Image>
          </a>
        </Link>
        <div className='vignette absolute inset-0'></div>
      </motion.div>
      <motion.div
        ref={parallax.ref}
        className={`${
          orientation === 'right' ? 'text-right lg:col-[8_/_13]' : 'text-left lg:col-[1_/_5]'
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
          className='text-4xl font-bold md:text-6xl'
        />

        <motion.div
          {...animation}
          className={`${
            orientation === 'right' ? 'justify-end' : 'justify-start'
          } flex w-full flex-row flex-wrap gap-2`}
        >
          <p
            className='shadow-relaxed h-full w-5/6 rounded
          bg-sepia-200 p-4 text-base transition-colors duration-500 dark:bg-carbon-800 sm:text-lg md:text-xl lg:w-full'
          >
            {props.description}
          </p>
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
                /* Keep an eye out: shadow-relaxed  can trigger mobile lag. */
                className='shadow-relaxed  rounded bg-sepia-200 py-1 px-2 font-ibm-mono 
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
