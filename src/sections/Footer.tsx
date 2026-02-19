import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer
      ref={ref}
      className="relative py-20 px-6 overflow-hidden"
    >
      {/* Curved Top Edge */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 L0,60 Q720,0 1440,60 L1440,120 Z"
            fill="rgba(255,255,255,0.02)"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto"
      >
        {/* Main Footer Content */}
        <div className="text-center mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            生命系统
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-white/50 max-w-md mx-auto"
          >
            一个不断进化的数字空间，记录着成长的轨迹与思考的光芒
          </motion.p>
        </div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { label: '表层认识', href: '#surface-section' },
            { label: '中层认识', href: '#middle-section' },
            { label: '深层认识', href: '#deep-section' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              {link.label}
            </a>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30"
        >
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>in the digital realm</span>
          </div>
          <div className="flex items-center gap-6">
            <span>© 2024 生命系统</span>
            <a href="#" className="hover:text-white/60 transition-colors">
              隐私政策
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              使用条款
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
}
