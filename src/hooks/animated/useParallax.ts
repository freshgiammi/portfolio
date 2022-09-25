import { useScroll, useSpring, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
/**
 * It returns a ref and a spring that can be used to create a parallax effect
 * @param [start=0] - the initial position of the element.
 * @param [offset=100] - the distance the element will move when scrolled from the initial position to
 * the final one.
 */

export default function useParallax({ start = 0, offset = 100 }) {
  const { scrollY } = useScroll();

  const [elementTop, setElementTop] = useState<number>(0);
  const [clientHeight, setClientHeight] = useState<number>(0);
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  // This is the element's top position relative to the windows' height.
  const initialPos = elementTop - clientHeight;

  // Animation will end when the element is 'offest' pixels below the initial position.
  const finalPos = elementTop + offset;

  // This is the actual animation: the element will move from 0 to offset when scroleld
  // vertically from the initial position to the final one.
  const yValue = useTransform(scrollY, [initialPos, finalPos], [start, -offset]);
  const yPos = useSpring(yValue, { stiffness: 1000, damping: 100 });

  /*
   * Why 'useEffect' instead of 'useLayoutEffect'?
   * Because the latter doesn't run on server, and might result in a mismatch between
   * the non-hydrated UI and the hydrated one.
   * See: https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85?permalink_comment_id=4248531#gistcomment-4248531
   */
  useEffect(() => {
    const element = parallaxRef.current;
    // Update the element's initial position upon resize (also initial render).
    const onResize = () => {
      // Use getBoundingClientRect instead of offsetTop in order to get the offset relative to the viewport
      if (element) setElementTop(element.getBoundingClientRect().top + window.scrollY || window.pageYOffset);
      setClientHeight(window.innerHeight);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [parallaxRef]);

  return {
    parallaxRef,
    yPos,
  };
}
