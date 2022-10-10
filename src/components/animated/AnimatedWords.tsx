import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

interface AnimatedWordsProps extends HTMLMotionProps<'h1'> {
  text: string;
}

const AnimatedWords = ({ text, ...props }: AnimatedWordsProps) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      x: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1 variants={container} initial='hidden' whileInView='visible' viewport={{ once: true }} {...props}>
      {words.map((word, index) => (
        <motion.span className='inline-block' variants={child} style={{ marginRight: '7px' }} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default AnimatedWords;
