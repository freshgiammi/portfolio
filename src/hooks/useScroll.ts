/**
 * useScroll React custom hook
 * Usage:
 *    const { scrollX, scrollY, scrollDirection } = useScroll(throttled?: number);
 */
import lodash from 'lodash';
import { useState, useEffect } from 'react';

type ScrollDirectionType = 'up' | 'down' | undefined;

export default function useScroll(throttled?: number) {
  // the vertical direction
  const [scrollY, setScrollY] = useState<number>(0);
  // the horizontal direction
  const [scrollX, setScrollX] = useState<number>(0);
  // scroll direction would be either up or down
  const [scrollDirection, setScrollDirection] = useState<ScrollDirectionType>();

  // Wait until document is loaded to get the body offset
  useEffect(() => {
    function listener() {
      const bodyOffset = document.body.getBoundingClientRect();
      setScrollY(-bodyOffset.top);
      setScrollX(bodyOffset.left);
      setScrollDirection(scrollY > -bodyOffset.top ? 'up' : 'down');
    }

    const throttledFn = lodash.throttle(listener, throttled, { leading: false, trailing: true });

    window.addEventListener('scroll', throttled ? throttledFn : listener);
    return () => {
      window.removeEventListener('scroll', throttled ? throttledFn : listener);
    };
  });

  return {
    scrollY,
    scrollX,
    scrollDirection,
  };
}
