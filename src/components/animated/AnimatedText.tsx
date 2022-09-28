import React from 'react';
import { HTMLMotionProps, motion, MotionProps } from 'framer-motion';
import { CustomVariants } from '@/interfaces/animationHelpers';

// Adapted from: https://codesandbox.io/s/framer-motion-responsive-text-animation-forked-z71c0o?file=/src/App.js:795-837
// ! See if transition can be added to the props for a dynamic usage.

export interface AnimatedTextProps extends HTMLMotionProps<'div'> {
  text: string;
  key: string;
  duration?: number;
  stagger?: number;
  delay?: number;
  className?: string;
}

/**
 * It calculates the delay of an item in the list by multiplying the length of the previous item's text
 * by the previous item's stagger value
 * @param {AnimatedTextProps[]} itemlist - The list of items that you want to stagger
 * @param {number} index - The index of the item in the list
 * @returns The delay of the previous item in the list.
 */
export function calculateStaggeredDelay(itemlist: AnimatedTextProps[], index: number) {
  if (index === 0) {
    return itemlist[index].delay || 0; // Set the item's delay to 0 if it's not defined
  }
  const previousItemTextLength = itemlist[index - 1].text.length;
  const previousItemStagger = itemlist[index - 1].stagger || 0.05; // Set the item's stagger to the default value (0.05) if it's not defined
  return previousItemTextLength * previousItemStagger;
}

/**
 * Animates a given text based as drop in from below.
 * Split the text into words, then split each word into characters.
 * @returns A 'motion.div' element, where every word is wrapped in a span and every character is wrapped in a span as well.
 */
const AnimatedText = ({ text, duration = 0.75, stagger = 0.05, delay = 0, ...props }: AnimatedTextProps) => {
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

  // Add a whitespace ("\u00A0") to the start of each word (except the first one).
  // eslint-disable-next-line consistent-return
  words.forEach((word: string[], index: number) => {
    if (index !== 0) {
      return word.unshift('\u00A0');
    }
  });

  const animationConfig: MotionProps = {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: { once: true },
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
          <motion.span key={index} className='inline-block whitespace-nowrap'>
            {words[index].flat().map((element, windex) => {
              return (
                // Character
                // Careful to applied classes here: this can be heavy on mobiles. (i.e. see top overscroll with 'display: inline-block')
                <motion.span key={windex} className='inline-block' variants={defaultAnimation}>
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
