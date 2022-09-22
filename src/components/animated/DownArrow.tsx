import React, { useEffect } from 'react';
import { motion, SVGMotionProps, useAnimationControls } from 'framer-motion';
import { CustomVariants } from '@/interfaces/animationHelpers';

// SVG Credits: https://iconic.app

export interface DownArrowProps extends SVGMotionProps<SVGSVGElement> {
  key: string;
  delay?: number;
  className?: string;
}

/**
 * Animates a bouncing arrow SVG element.
 * @param {string} key - The key of the element.
 * @param {number} delay - The delay before the animation starts.
 * @param {string} className - Classes of the SVG element.
 * @returns A 'motion.svg' element.
 */
const DownArrow = ({ delay = 3, ...props }: DownArrowProps) => {
  const controls = useAnimationControls();

  useEffect(() => {
    (async () => {
      controls.set('hidden');
      await controls.start('visible');
      controls.start('loop');
    })();
  }, [controls]);

  // Default path variant animations. These will be used if no custom 'pathVariant' is provided.
  const defaultPathVariant: CustomVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay, ease: 'easeInOut' },
    },
    loop: {
      y: -10,
      transition: { duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
    },
  };

  return (
    // This will stagger the animation of each character.
    <motion.svg
      width='48'
      height='48'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
      variants={defaultPathVariant}
      animate={controls}
    >
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.25 13.75L12 19.25L6.75 13.75'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M12 18.25V4.75'
      ></path>
    </motion.svg>
  );
};

export default DownArrow;
