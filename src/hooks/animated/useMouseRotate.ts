import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// See: https://armandocanals.com/posts/CSS-transform-rotating-a-3D-object-perspective-based-on-mouse-position.html

/**
 * It returns an object with two values, `x` and `y`, which are the mouse position values
 * @param {NumberCallback} [op] - A function that takes a number and returns a number. This is used to
 * transform the mouse position before it's set on the motion value.
 * @returns An object with two properties, x and y, which are both MotionValues.
 */
export default function useMouseRotate(startPos?: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [elementCoord, setElementCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cursorX = useMotionValue(startPos || 0);
  const cursorY = useMotionValue(startPos || 0);

  const springConfig = { stiffness: 900, damping: 100 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  // Update rotation data
  // See: https://developer.mozilla.org/en-US/docs/Web/API/DOMRect?retiredLocale=it
  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      if (elementCoord) {
        // ! figure our scroll issue

        // scrollY/scrollX is needed to recalibrate element based on scroll position
        cursorY.set((event.clientX - elementCoord.y) / 20);
        cursorX.set(-(event.clientY - elementCoord.x) / 20);
      }
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY, elementCoord]);

  // Ref to the element
  useEffect(() => {
    const element = ref.current;

    const onResize = () => {
      if (element)
        // By adding scroll component we get the correct position of the element relative to the document, instead of the viewport.
        setElementCoord({
          y: element.getBoundingClientRect().left + window.scrollX - element.getBoundingClientRect().width / 2,
          x: element.getBoundingClientRect().top + window.scrollY - element.getBoundingClientRect().height / 2,
        });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ref]);

  return { ref, x, y };
}
