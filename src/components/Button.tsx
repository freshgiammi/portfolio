import { HTMLMotionProps, motion } from 'framer-motion';

// TODO: This should be a component.

export default function Button({ children, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      {...props}
      type='button'
      className='img-squareshadow btn btn-animatefill after:bg-amber-800/30 dark:after:bg-amber-300/30'
    >
      {children}
    </motion.button>
  );
}
