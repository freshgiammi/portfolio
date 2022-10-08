import { motion } from 'framer-motion';

export default function Tag({ text, badge }: { text: string; badge: 'success' | 'error' | undefined }) {
  return (
    <motion.div className={`flex w-full flex-row flex-wrap gap-2`}>
      <p
        className='shadow-relaxed flex-center-row rounded bg-amber-600/30 py-1 px-2 
        text-xs transition-colors duration-500 dark:bg-amber-300/30'
      >
        {badge && (
          <motion.span
            className={`mr-1 h-[0.5rem] w-[0.5rem] rounded-full ${
              badge === 'success' ? 'bg-green-500/70' : 'bg-red-600/70'
            }`}
          ></motion.span>
        )}
        {text}
      </p>
    </motion.div>
  );
}
