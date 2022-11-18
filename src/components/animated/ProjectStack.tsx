import React, { useRef } from 'react';
import { AnimatePresence, HTMLMotionProps, motion, MotionProps, Variants } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import AnimatedText from './AnimatedText';

export interface ProjectStackData {
  key: string;
  src: StaticImageData;
  alt: string;
  title: string;
  description: string;
  type: string;
  url: string;
  tags: string[];
}

interface ProjectStackProps extends HTMLMotionProps<'ul'> {
  data: ProjectStackData[];
}

const ProjectStack = ({ data }: ProjectStackProps) => {
  const constraintsRef = useRef(null);
  const [cards, setCards] = React.useState(data);

  const moveToEnd = (from: number) => {
    const newCards = [...cards];
    newCards.push(cards[from]);
    newCards.shift();
    setCards(newCards);
  };

  const projectVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const animation: MotionProps = {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true },
    exit: 'exit',
    variants: projectVariants,
  };

  return (
    <>
      <motion.div className='col-[1_/_13] lg:col-[1_/7]'>
        <motion.ul
          className='h-[200px] md:h-[400px]'
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
          ref={constraintsRef}
        >
          {cards.map((card, index) => {
            const canDrag = index === 0;

            return (
              <motion.li
                key={card.key}
                style={{
                  position: 'absolute',
                  transformOrigin: 'top center',
                  listStyle: 'none',
                  cursor: canDrag ? 'grab' : 'auto',
                }}
                animate={{
                  top: index * -15,
                  scale: 1 - index * 0.05,
                  zIndex: cards.length - index,
                }}
                drag={canDrag ? 'y' : false}
                dragConstraints={constraintsRef}
                dragSnapToOrigin={true}
                onDragEnd={() => moveToEnd(index)}
              >
                <Image
                  alt='p.alt'
                  src={card.src}
                  sizes='100vw'
                  placeholder='blur'
                  draggable={false}
                  className='img-squareshadow h-[200px] rounded-md 
              object-cover object-[50%_50%] md:h-[400px]'
                />
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>
      <motion.div
        className={`col-[1_/_13] space-y-4 text-lg text-carbon-800 dark:text-carbon-100 lg:col-[7_/_13]
`}
      >
        <motion.div {...animation} key={`${cards[0].key}-type`} className={` flex w-full flex-row flex-wrap gap-2`}>
          <p
            className='shadow-relaxed rounded bg-amber-600/30 py-1 px-2 font-ibm-mono 
            text-xs transition-colors duration-500 dark:bg-amber-300/30'
          >
            {cards[0].type}
          </p>
        </motion.div>
        <AnimatePresence mode='wait'>
          <motion.div {...animation} key={`${cards[0].key}-title`} className={`flex w-full flex-row flex-wrap gap-2`}>
            <AnimatedText
              stagger={0.05}
              key={`${cards[0].key}-titleinner`}
              text={cards[0].title}
              className='text-4xl font-bold md:text-5xl xl:text-6xl'
            />
          </motion.div>
          <motion.div
            key={`${cards[0].key}-description`}
            {...animation}
            className={` flex w-full flex-row flex-wrap gap-2`}
          >
            <p className='h-full w-5/6 text-base transition-colors duration-500'>{cards[0].description}</p>
          </motion.div>
          <motion.div
            {...animation}
            key={`${cards[0].key}-tags`}
            className={`flex flex-row flex-wrap gap-2 
`}
          >
            {cards[0].tags.map((t) => {
              return (
                <motion.div
                  key={`${cards[0].key}-${t}`}
                  className='shadow-relaxed rounded bg-sepia-200 py-1 px-2 font-ibm-mono 
            text-xs transition-colors duration-500 dark:bg-carbon-800'
                >
                  {t}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ProjectStack;
