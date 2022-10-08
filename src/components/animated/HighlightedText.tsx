import { ReactNode } from 'react';
import { HTMLMotionProps, motion, Variants } from 'framer-motion';

interface Props extends HTMLMotionProps<'span'> {
  children?: ReactNode;
}
export function HighlightedText({ children }: Props) {
  const highlightedSlideIn: Variants = {
    hidden: { backgroundSize: '0% 50%' },
    visible: { backgroundSize: '100% 50%', transition: { delay: 1, duration: 1.5, ease: 'easeInOut' } },
  };

  return (
    <motion.span
      className='highlighted font-bold text-amber-800/70 dark:text-amber-300/70'
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true }}
      variants={highlightedSlideIn}
    >
      {children}
    </motion.span>
  );
}
