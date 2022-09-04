/**
 * useScroll React custom hook
 * Usage:
 *    const { scrollX, scrollY, scrollDirection } = useScroll();
 */
import { useState, useEffect } from 'react';

type ScrollDirectionType = 'up' | 'down' | undefined;

export default function useScroll() {
  // storing this to get the scroll direction
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  // the vertical direction
  const [scrollY, setScrollY] = useState<number>(0);
  // the horizontal direction
  const [scrollX, setScrollX] = useState<number>(0);
  // scroll direction would be either up or down
  const [scrollDirection, setScrollDirection] = useState<ScrollDirectionType>();

  const listener = () => {
    const bodyOffset = document.body.getBoundingClientRect();
    setScrollY(-bodyOffset.top);
    setScrollX(bodyOffset.left);
    setScrollDirection(lastScrollTop > -bodyOffset.top ? 'down' : 'up');
    setLastScrollTop(-bodyOffset.top);
  };

  // Wait until document is loaded to get the body offset
  useEffect(() => {
    window.addEventListener('scroll', listener);
    return () => {
      window.removeEventListener('scroll', listener);
    };
  });

  return {
    scrollY,
    scrollX,
    scrollDirection,
  };
}
