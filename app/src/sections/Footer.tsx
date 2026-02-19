import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer
      ref={ref}
      className="relative py-12 px-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />
        <p className="text-white/30 text-sm">
          Me System — A living digital space
        </p>
      </motion.div>
    </footer>
  );
}
