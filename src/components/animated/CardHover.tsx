import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import Image, { StaticImageData } from 'next/future/image';

interface CardHoverProps extends HTMLMotionProps<'div'> {
  src: StaticImageData;
  children: React.ReactNode;
}

const CardHover = ({ children, src, ...props }: CardHoverProps) => {
  const textVariants = {
    beforeHover: { opacity: 0 },
    onHover: { opacity: 0.95 },
  };

  return (
    <motion.div
      {...props}
      initial='beforeHover'
      whileHover='onHover'
      whileTap='onHover'
      style={{ position: 'relative', userSelect: 'none', height: '100%' }}
    >
      <motion.div className='h-full'>
        <Image alt='p.alt' src={src} sizes='100vw' className='img-squareshadow h-full rounded object-cover shadow' />
      </motion.div>
      <motion.div
        variants={textVariants}
        className='flex-center-row absolute inset-0 h-full w-full rounded bg-amber-300/90 p-2'
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default CardHover;
