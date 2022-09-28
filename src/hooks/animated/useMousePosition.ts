import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

type NumberCallback = (a: number) => number;

/**
 * It returns an object with two values, `x` and `y`, which are the mouse position values
 * @param {NumberCallback} [op] - A function that takes a number and returns a number. This is used to
 * transform the mouse position before it's set on the motion value.
 * @returns An object with two properties, x and y, which are both MotionValues.
 */
export default function useMousePosition(startPos?: number, op?: NumberCallback) {
  const cursorX = useMotionValue(startPos || 0);
  const cursorY = useMotionValue(startPos || 0);

  const springConfig = { stiffness: 900, damping: 100 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const operation = op || ((a: number) => a);

    const moveCursor = (event: MouseEvent) => {
      cursorX.set(operation(event.clientX));
      cursorY.set(operation(event.clientY));
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY, op]);

  return { x, y };
}
