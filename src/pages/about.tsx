import AnimatedText from '@/components/animated/AnimatedText';
import AnimatedWave from '@/components/animated/AnimatedWave';
import LayoutBlock from '@/components/LayoutBlock';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

const About: NextPage = () => {
  return (
    <LayoutBlock>
      <motion.section className='flex-center-column h-full'>
        <div className='grid-row-1 grid grid-cols-1 '>
          <div className='col-end-2 row-end-2 space-y-3 self-center'>
            <AnimatedText
              key='title'
              text='About me.'
              className="md:text-6xl' text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <AnimatedWave
            key='wave'
            loop={true}
            className='col-end-2 row-end-2 w-full self-center overflow-hidden opacity-20' // width: fit-content is not working on chrome mobile.
            strokeStyle='stroke-amber-800 dark:stroke-amber-300'
          />
        </div>
      </motion.section>
    </LayoutBlock>
  );
};

export default About;
