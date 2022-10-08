import { motion } from 'framer-motion';

export default function Divider() {
  return (
    <motion.div className='px-4 py-6 transition-all duration-500 sm:px-20'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, width: 0 },
          visible: { opacity: 1, width: '100%', transition: { duration: 2, ease: 'easeInOut' } },
        }}
        className='paragraph-divider flex-center-row after:m-0
       after:bg-amber-800/30 after:px-2 dark:after:bg-amber-300/30'
      />
    </motion.div>
  );
}
