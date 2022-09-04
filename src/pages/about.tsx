import LayoutBlock from '@/components/LayoutBlock';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Lightning from '~/assets/lightning.svg';

const Home: NextPage = () => {
  const [bolts, setBolts] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Doing this prevents hydration issues.
    // See: https://nextjs.org/docs/messages/react-hydration-error

    // This is a bit wack. Canvas would be far superior to SVG, but it'll be enough for now.
    setBolts(
      Array.from({ length: 20 }).map((_, i) => (
        <Lightning
          key={i}
          className='bolt fill-amber-500'
          style={{
            top: `${Math.floor(Math.random() * 100)}vh`,
            left: `${Math.floor(Math.random() * 100)}vw`,
            animationDelay: `${Math.floor(Math.random() * 5)}s`,
            overflow: 'hidden',
          }}
        />
      ))
    );
  }, []);

  return (
    <LayoutBlock>
      {/* Background bolts. Isn't this fun?
       * Also we should probably move this to the HOC <LayoutBlock>
       */}
      <div
        className='fade-div-out absolute inset-0 min-h-full min-w-full cursor-default select-none overflow-hidden
      bg-zinc-100 dark:bg-zinc-900'
        style={{ zIndex: '-1' }}
      >
        {bolts}
      </div>
      <section className='flex-center-column h-full p-6'>
        <h1 className='text-center text-5xl font-bold md:text-6xl'>
          About me!
          <br />
        </h1>
      </section>
    </LayoutBlock>
  );
};

export default Home;
