import { ReactNode, useRef } from 'react';
import { HTMLMotionProps, motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface Props extends HTMLMotionProps<'h1'> {
  children?: ReactNode;
}
export function ScrollLinkedOpacityText({ children, ...props }: Props) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'start start'],
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 1, 1]), {
    stiffness: 400,
    damping: 90,
  });

  return (
    <motion.h1 ref={ref} style={{ opacity }} {...props}>
      {children}
    </motion.h1>
  );
}
