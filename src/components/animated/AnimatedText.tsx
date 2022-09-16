import React from 'react';
import { HTMLMotionProps, motion, AnimationProps, Variant } from 'framer-motion';

// Adapted from: https://codesandbox.io/s/framer-motion-responsive-text-animation-forked-z71c0o?file=/src/App.js:795-837
// ! See if transition can be added to the props for a dynamic usage.

type CustomVariants = {
  hidden: Variant;
  visible: Variant;
};

interface AnimatedTitleProps extends HTMLMotionProps<'div'> {
  text: string;
  key: string;
  animateBy?: 'word' | 'character';
  customVariants?: CustomVariants;
  duration?: number;
  stagger?: number;
  delay?: number;
  className?: string;
}

/**
 * Animates a given text based as drop in from below.
 * Split the text into words, then split each word into characters.
 * A custom Variants object containing the animation can be passed to the component, if provided.
 * If both 'duration' and 'customVariants' are provided, the latter will be used.
 * @returns A 'motion.div' element, where every word is wrapped in a span and every character is wrapped in a span as well.
 */
const AnimatedText = ({
  text,
  animateBy = 'character',
  customVariants,
  duration = 0.75,
  stagger = 0.05,
  delay = 0,
  ...props
}: AnimatedTitleProps) => {
  // Framer Motion variant object, for controlling character animation
  const defaultAnimation: CustomVariants = {
    hidden: {
      opacity: 0,
      y: '1em',
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration },
    },
    visible: {
      opacity: 1,
      y: '0em',
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration },
    },
  };

  // Create storage array
  const words: string[][] = [];

  // Create a bidimensional array. Each word is an array of characters.
  for (const word of text.split(' ')) {
    words.push(word.split(''));
  }

  // Add a whitespace ("\u00A0") to the end of each word (except the last one).
  // eslint-disable-next-line consistent-return
  words.forEach((word: string[], index: number) => {
    if (index !== words.length - 1) {
      return word.push('\u00A0');
    }
  });

  const animationConfig: AnimationProps = {
    initial: 'hidden',
    animate: 'visible',
    variants: {
      visible: {
        transition: {
          delayChildren: delay,
          staggerChildren: stagger,
        },
      },
    },
  };

  return (
    // This will stagger the animation of each character.
    <motion.h1 {...props} {...animationConfig}>
      {words.map((_word, index) => {
        return (
          // Word
          <motion.span
            key={index}
            className='inline-block whitespace-nowrap'
            variants={animateBy === 'word' ? customVariants || defaultAnimation : undefined}
          >
            {words[index].flat().map((element, windex) => {
              return (
                // Character
                <motion.span
                  key={windex}
                  className='inline-block h-full'
                  variants={animateBy === 'character' ? customVariants || defaultAnimation : undefined}
                >
                  {element}
                </motion.span>
              );
            })}
          </motion.span>
        );
      })}
    </motion.h1>
  );
};

export default AnimatedText;
