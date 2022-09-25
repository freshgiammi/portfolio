import LayoutBlock from '@/components/LayoutBlock';
import Link from 'next/link';

export default function Custom404() {
  return (
    <LayoutBlock>
      <section className='flex-center-column h-full space-y-4 bg-carbon-100 dark:bg-carbon-900'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='animate-pulse'
          viewBox='0 0 491.52 491.52'
          width='5rem'
          height='5rem'
        >
          <path
            className='fill-carbon-800 dark:fill-carbon-300'
            d='M0 0v491.52h491.52V0H0zm471.04 471.04H20.48V102.4h450.56v368.64zm0-389.12H20.48V20.48h450.56v61.44z'
          ></path>
          <path
            className='fill-carbon-800 dark:fill-carbon-300'
            d='M40.96 40.96h20.48v20.48H40.96zM81.92 40.96h20.48v20.48H81.92zM122.88 40.96h20.48v20.48h-20.48zM194.56 
            40.96h245.76v20.48H194.56zM143.36 245.76v30.72h-51.2v-81.92H71.68v102.4h71.68v71.68h20.48V245.76zM389.12 
            245.76v30.72h-51.2v-81.92h-20.48v102.4h71.68v71.68h20.48V245.76zM240.64 194.56c-31.055 0-56.32 25.27-56.32
            56.32v61.44c0 31.05 25.265 56.32 56.32 56.32s56.32-25.27
            56.32-56.32v-61.44c0-31.05-25.265-56.32-56.32-56.32zm35.84 117.76c0 19.76-16.08 35.84-35.84
            35.84s-35.84-16.08-35.84-35.84v-61.44c0-19.76 16.08-35.84 35.84-35.84s35.84 16.08 35.84 35.84v61.44zM143.36
            133.12h204.8v20.48h-204.8zM143.36 419.84h204.8v20.48h-204.8z'
          ></path>
        </svg>
        <h1 className='text-center text-3xl font-bold text-carbon-800 dark:text-carbon-100 md:text-4xl'>
          {"Whoops, it looks like there's nothing here."}
          <br />
        </h1>
        <h1 className='text-center text-xl text-carbon-800 dark:text-carbon-300 md:text-2xl'>
          {'Want to go back to the homepage?'}
        </h1>
        <button
          type='button'
          className=' focus:shadow-outline m-2 select-none rounded-lg border border-amber-500 bg-amber-500 px-4 
        py-2 text-white transition duration-500 ease-in-out hover:bg-amber-600 focus:outline-none'
        >
          <Link href='/'>
            <a>
              <span>Go back!</span>
            </a>
          </Link>
        </button>
      </section>
    </LayoutBlock>
  );
}
