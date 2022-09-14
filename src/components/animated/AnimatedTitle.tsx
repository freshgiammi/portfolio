import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';

// Adapted from: https://codesandbox.io/s/framer-motion-responsive-text-animation-forked-z71c0o?file=/src/App.js:795-837
// ! See if transition can be added to the props for a dynamic usage.

interface AnimatedTitleProps extends HTMLMotionProps<'div'> {
  text: string;
  key: string;
  className?: string;
}

/**
 * Animates a given text based as drop in from below.
 * Split the text into words, then split each word into characters.
 * @returns A 'motion.div' element, where every word is wrapped in a span and every character is wrapped in a span as well.
 */
const AnimatedTitle = ({ text, ...props }: AnimatedTitleProps) => {
  // Framer Motion variant object, for controlling character animation
  const characterAnimation = {
    hidden: {
      y: '200%',
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 },
    },
    visible: {
      y: 0,
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75 },
    },
  };

  //  Split each word of props.text into an array
  const splitWords = text.split(' ');

  // Create storage array
  const words: string[][] = [];

  // Push each word into words array
  for (const [, item] of splitWords.entries()) {
    words.push(item.split(''));
  }

  // Add a space ("\u00A0") to the end of each word
  words.map((word: string[]) => {
    return word.push('\u00A0');
  });

  const staggerer = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    // This will stagger the animation of each character.
    <motion.div initial='hidden' animate='visible' variants={staggerer} {...props}>
      {words.map((_word, index) => {
        return (
          // Wrap each word in the span component to prevent wrapping of words using CSS
          <span className='word-wrapper' key={index}>
            {words[index].flat().map((element, windex) => {
              return (
                <span className='inline-block overflow-hidden' key={windex}>
                  <motion.span className='inline-block' variants={characterAnimation}>
                    {element}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </motion.div>
  );
};

export default AnimatedTitle;

/*
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Word = styled(motion.span)`
  display: inline-block;
  margin-right: 0.25em;
  white-space: nowrap;
`;

const Character = styled(motion.span)`
  display: inline-block;
  margin-right: -0.05em;
`;

interface Props extends React.HTMLProps<HTMLDivElement> {
  text: string;
  className?: string;
}

export default function AnimatedTitle({ text, ...props }: Props) {
  const wordAnimation = {
    hidden: {},
    visible: {},
  };

  const characterAnimation = {
    hidden: {
      opacity: 0,
      y: `0.25em`,
    },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: {
        duration: 1,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <h2 aria-label={text} role='heading' {...props}>
      {text.split(' ').map((word, index) => {
        return (
          <Word
            aria-hidden='true'
            key={index}
            initial='hidden'
            animate='visible'
            variants={wordAnimation}
            transition={{
              delayChildren: index * 0.25,
              staggerChildren: 0.05,
            }}
          >
            {word.split('').map((character, windex) => {
              return (
                <Character aria-hidden='true' key={windex} variants={characterAnimation}>
                  {character}
                </Character>
              );
            })}
          </Word>
        );
      })}
    </h2>
  );
}
 */
