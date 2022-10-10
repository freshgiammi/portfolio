/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useLockedBody } from 'usehooks-ts';
import { motion, Variants } from 'framer-motion';

interface ThemeSwitcherProps extends React.HTMLProps<HTMLDivElement> {
  btnProps?: string;
}

export default function Navbar() {
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handles Hamburger Menu state
  const [burgerState, setBurgerState] = useState(false);

  const navbarVariant: Variants = {
    hidden: {
      y: -100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: 'easeInOut' },
    },
  };

  // Block page scrolling
  const [locked, setLocked] = useLockedBody();

  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = {
    open: { right: 0, transition: { duration: 0.6 }, easing: 'easeInOut' },
    closed: { right: '-100%', transition: { duration: 0.6 }, easing: 'easeInOut' },
  };

  const PagesList = (props: React.HTMLProps<HTMLDivElement>) => (
    <div {...props}>
      <Link href='/about' scroll={false}>
        <a
          onClick={() => {
            if (burgerState) {
              setBurgerState(false);
              setLocked(false);
            }
          }}
          className={`underline-custom tracking-wide text-carbon-800 dark:text-carbon-100 ${
            router.asPath === '/about' ? 'active font-bold' : 'font-medium'
          }`}
        >
          About
        </a>
      </Link>
      <Link href='/projects' scroll={false}>
        <a
          onClick={() => {
            if (burgerState) {
              setBurgerState(false);
              setLocked(false);
            }
          }}
          className={`underline-custom tracking-wide text-carbon-800 dark:text-carbon-100 ${
            router.asPath === '/contact' ? 'active font-bold' : 'font-medium'
          }`}
        >
          Projects
        </a>
      </Link>
    </div>
  );

  const ThemeSwitcher = ({ btnProps, ...props }: ThemeSwitcherProps) => (
    <div {...props}>
      <button
        aria-label='Dark/Light Mode'
        type='button'
        className={`h-10 w-10 rounded border-0 p-3 focus:outline-none ${btnProps}`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {mounted && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            stroke='currentColor'
            className='h-4 w-4 text-amber-500 grayscale dark:text-amber-500'
          >
            {theme === 'dark' ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
              />
            )}
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <motion.nav initial='hidden' animate='visible' variants={navbarVariant} className={`sticky-navbar`}>
      <div
        className={`flex items-center justify-between bg-sepia-300 
        p-5 transition-colors duration-500 dark:bg-carbon-900 md:flex-row md:px-28`}
      >
        {/* Logo / Home / Text */}
        <div className='flex-center-row z-10' style={{}}>
          <Link href='/' scroll={false}>
            <a
              onClick={() => {
                if (burgerState) {
                  setBurgerState(false);
                  setLocked(false);
                }
              }}
            >
              <h1 className='text-xl font-semibold text-carbon-800 dark:text-carbon-100'>freshgiammi</h1>
              <p className='text-base font-light text-carbon-800 dark:text-carbon-100'>Gianmarco Rengucci</p>
            </a>
          </Link>
        </div>

        {/* Mobile Menu */}
        {/* SVG Animation credits: Mikael Ainalem - https://codepen.io/ainalem/pen/LJYRxz  */}
        <div className={`ham z-10 block md:hidden ${burgerState ? 'active' : ''}`}>
          <svg
            viewBox='0 0 100 100'
            width='50'
            onClick={() => {
              setBurgerState(!burgerState);
              setLocked(!locked);
            }}
          >
            <path
              className='top stroke-carbon-800 dark:stroke-carbon-100'
              d='m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40'
            />
            <path className='middle stroke-carbon-800 dark:stroke-carbon-100' d='m 30,50 h 40' />
            <path
              className='bottom stroke-carbon-800 dark:stroke-carbon-100'
              d='m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40'
            />
          </svg>
        </div>
        <motion.aside
          initial={{ right: '-100%' }}
          animate={burgerState ? 'open' : 'closed'}
          variants={variants}
          className={`ham-sider flex flex-col items-center justify-center bg-sepia-200 transition-colors duration-500 dark:bg-carbon-800 md:hidden`}
        >
          <PagesList className='page-item flex w-full flex-col items-center justify-center space-y-8 pb-12 text-5xl' />
          <div className='space-y-8 '>
            <ThemeSwitcher
              className='flex flex-col items-center justify-center'
              btnProps='rounded-full dark:bg-carbon-200/[.15] bg-carbon-800/[.15]'
            />
          </div>
        </motion.aside>

        <div className='hidden items-center space-x-12 md:flex md:flex-row'>
          {/* Desktop Menu */}
          <PagesList className='hidden space-x-12 text-lg md:block' />
          <ThemeSwitcher
            className='flex flex-col items-center justify-center'
            btnProps='rounded-full dark:bg-carbon-200/[.05] bg-carbon-800/[.05]'
          />
        </div>
      </div>
    </motion.nav>
  );
}
