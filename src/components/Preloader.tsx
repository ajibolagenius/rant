import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const preloaderVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.6 } },
};

const logoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.1, 1],
    opacity: [0, 1, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 1.6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

const gradientVariants = {
  animate: {
    background: [
      'linear-gradient(135deg, #00C2FF 0%, #904FFF 100%)',
      'linear-gradient(135deg, #904FFF 0%, #00C2FF 100%)',
      'linear-gradient(135deg, #00C2FF 0%, #904FFF 100%)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

const Preloader: React.FC<{ show?: boolean }> = ({ show = true }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#09090B] to-[#1A1A2E]"
        variants={preloaderVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="status"
        aria-live="polite"
      >
        <motion.div
          className="relative flex flex-col items-center"
          variants={gradientVariants}
          animate="animate"
        >
          <motion.div
            className="rounded-full shadow-2xl bg-white/10 p-8 mb-6"
            variants={logoVariants}
            initial="initial"
            animate="animate"
          >
            <img
              src="/assets/rant_logo.svg"
              alt="Rant Logo"
              className="w-20 h-20 drop-shadow-lg"
              draggable={false}
            />
          </motion.div>
          <motion.div
            className="text-3xl font-bold text-white text-center tracking-tight font-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Rant
          </motion.div>
          <motion.div
            className="mt-4 text-base text-cyan-200 font-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Anonymous Space for Unfiltered Thoughts
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Preloader;
