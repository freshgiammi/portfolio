import React, { useEffect } from 'react';
import { motion, SVGMotionProps, useAnimationControls } from 'framer-motion';
import { CustomVariants } from '@/interfaces/animationHelpers';

export interface AnimatedWaveProps extends SVGMotionProps<SVGSVGElement> {
  key: string;
  strokeStyle?: string;
  duration?: number;
  stagger?: number;
  loop?: boolean;
  className?: string;
}

/**
 * Animates a wave SVG element.
 * A custom Variants object containing the animation can be passed to the component, if provided.
 * If custom Variants have been passed, they must contain a 'loop' property, it must be activated with the loop parameter..
 * @returns A 'motion.svg' element, where every wave is a 'motion.path' element.
 */
const AnimatedWave = ({ strokeStyle, duration = 3, stagger = 0.1, loop = false, ...props }: AnimatedWaveProps) => {
  const controls = useAnimationControls();

  useEffect(() => {
    (async () => {
      controls.set('hidden');
      await controls.start('visible');
      if (loop) controls.start('loop');
    })();
  }, [controls, loop]);

  // Default path variant animations. These will be used if no custom 'pathVariant' is provided.
  const defaultPathVariant: CustomVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      transition: { duration, ease: 'easeInOut' },
    },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: { duration, delay: i * stagger, ease: 'easeInOut' },
    }),
    loop: (i) => ({
      opacity: 0.0,
      transition: { duration: 2, delay: i * stagger, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
    }),
  };

  return (
    // This will stagger the animation of each character.
    <motion.svg
      {...props}
      width='790'
      height='217'
      viewBox='0 0 790 217'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <motion.g className={strokeStyle || 'stroke-zinc-500 dark:stroke-zinc-500'} strokeWidth='2' strokeLinecap='round'>
        <motion.path
          d='M0 32.0074C25.6944 34.0907 69.8611 48.674 123.333 42.0074C176.806 35.3407 201.111 0.632355 256.667 0.00735471C312.222 -0.617645 334.444 38.799 390 39.0074C445.556 39.2157 467.778 -0.867645 523.333 1.00735C578.889 2.88235 601.111 44.674 656.667 48.0074C712.222 51.3407 762.222 23.4657 790 17.0074'
          variants={defaultPathVariant}
          animate={controls}
          custom={0}
        />
        <motion.path
          d='M0 56.0074C25.6944 58.0907 69.8611 72.674 123.333 66.0074C176.806 59.3407 201.111 24.6324 256.667 24.0074C312.222 23.3824 334.444 62.799 390 63.0074C445.556 63.2157 467.778 23.1324 523.333 25.0074C578.889 26.8824 601.111 68.674 656.667 72.0074C712.222 75.3407 762.222 47.4657 790 41.0074'
          variants={defaultPathVariant}
          animate={controls}
          custom={1}
        />
        <motion.path
          d='M0 80.0074C25.6944 82.0907 69.8611 96.674 123.333 90.0074C176.806 83.3407 201.111 48.6324 256.667 48.0074C312.222 47.3824 334.444 86.799 390 87.0074C445.556 87.2157 467.778 47.1324 523.333 49.0074C578.889 50.8824 601.111 92.674 656.667 96.0074C712.222 99.3407 762.222 71.4657 790 65.0074'
          variants={defaultPathVariant}
          animate={controls}
          custom={2}
        />
        <motion.path
          d='M0 104.007C25.6944 106.091 69.8611 120.674 123.333 114.007C176.806 107.341 201.111 72.6324 256.667 72.0074C312.222 71.3824 334.444 110.799 390 111.007C445.556 111.216 467.778 71.1324 523.333 73.0074C578.889 74.8824 601.111 116.674 656.667 120.007C712.222 123.341 762.222 95.4657 790 89.0074'
          variants={defaultPathVariant}
          animate={controls}
          custom={3}
        />
        <motion.path
          d='M0 128.007C25.6944 130.091 69.8611 144.674 123.333 138.007C176.806 131.341 201.111 96.6324 256.667 96.0074C312.222 95.3824 334.444 134.799 390 135.007C445.556 135.216 467.778 95.1324 523.333 97.0074C578.889 98.8824 601.111 140.674 656.667 144.007C712.222 147.341 762.222 119.466 790 113.007'
          variants={defaultPathVariant}
          animate={controls}
          custom={4}
        />
        <motion.path
          d='M0 152.007C25.6944 154.091 69.8611 168.674 123.333 162.007C176.806 155.341 201.111 120.632 256.667 120.007C312.222 119.382 334.444 158.799 390 159.007C445.556 159.216 467.778 119.132 523.333 121.007C578.889 122.882 601.111 164.674 656.667 168.007C712.222 171.341 762.222 143.466 790 137.007'
          variants={defaultPathVariant}
          animate={controls}
          custom={5}
        />
        <motion.path
          d='M0 176.007C25.6944 178.091 69.8611 192.674 123.333 186.007C176.806 179.341 201.111 144.632 256.667 144.007C312.222 143.382 334.444 182.799 390 183.007C445.556 183.216 467.778 143.132 523.333 145.007C578.889 146.882 601.111 188.674 656.667 192.007C712.222 195.341 762.222 167.466 790 161.007'
          variants={defaultPathVariant}
          animate={controls}
          custom={6}
        />
        <motion.path
          d='M0 200.007C25.6944 202.091 69.8611 216.674 123.333 210.007C176.806 203.341 201.111 168.632 256.667 168.007C312.222 167.382 334.444 206.799 390 207.007C445.556 207.216 467.778 167.132 523.333 169.007C578.889 170.882 601.111 212.674 656.667 216.007C712.222 219.341 762.222 191.466 790 185.007'
          variants={defaultPathVariant}
          animate={controls}
          custom={7}
        />
      </motion.g>
    </motion.svg>
  );
};

export default AnimatedWave;
