import useParallax from '@/hooks/animated/useParallax';
import { motion, Variants } from 'framer-motion';
import Image, { StaticImageData } from 'next/future/image';
import Link from 'next/link';

import { UrlObject } from 'url';

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
  const { parallaxRef, yPos } = useParallax({ offset: 75 });

  const projectVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 1, ease: 'easeInOut' } },
    show: { opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
  };

  const animation = {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true },
    variants: projectVariants,
  };

  return (
    <motion.div className='grid grid-cols-12 gap-4 text-zinc-800 transition-all duration-500 dark:text-zinc-100'>
      <motion.div
        className={`${orientation === 'right' ? 'lg:col-[1_/_10]' : 'lg:col-[4_/_13]'} 
        col-[1_/_13] lg:row-end-1`}
      >
        {/* An anchor element is needed to pass href to Link element. */}
        <Link href={props.url} passHref>
          <a>
            <Image
              alt='p.alt'
              src={props.src}
              className='cursor-pointer shadow brightness-75 grayscale dark:brightness-50'
            ></Image>
          </a>
        </Link>
      </motion.div>
      <motion.div
        ref={parallaxRef}
        style={{ y: yPos }}
        {...animation}
        className={`${
          orientation === 'right' ? 'text-right lg:col-[9_/_13]' : 'text-left lg:col-[1_/_5]'
        } z-10 col-[1_/_13] space-y-3 self-center lg:row-end-1
`}
      >
        <div
          className={`${
            orientation === 'right' ? 'justify-end' : 'justify-start'
          } flex w-full flex-row flex-wrap gap-2`}
        >
          <p
            className='rounded bg-amber-600/30 py-1 px-2 font-ibm-mono text-xs 
            shadow transition-colors duration-500 dark:bg-amber-300/30'
          >
            {props.type}
          </p>
        </div>
        <p className='text-2xl font-bold md:text-4xl'>{props.title}</p>

        <div
          className={`${
            orientation === 'right' ? 'justify-end' : 'justify-start'
          } flex w-full flex-row flex-wrap gap-2`}
        >
          <p
            className='h-full w-5/6 rounded bg-sepia-200
          p-4 text-base shadow transition-colors duration-500 dark:bg-zinc-800 md:text-base lg:w-full'
          >
            {props.description}
          </p>
        </div>
        <div
          className={`${orientation === 'right' ? 'justify-end' : 'justify-start'} flex flex-row flex-wrap gap-2 
`}
        >
          {tags.map((t) => {
            return (
              <div
                key={t}
                /* Keep an eye out: shadow can trigger mobile lag. */
                className='rounded bg-sepia-200 py-1 px-2 font-ibm-mono text-xs 
            shadow transition-colors duration-500 dark:bg-zinc-800'
              >
                {t}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
