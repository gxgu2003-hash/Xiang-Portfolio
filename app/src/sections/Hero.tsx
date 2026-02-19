import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Planet {
  id: string;
  name: string;
  color: string;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  sectionId: string;
}

const planets: Planet[] = [
  { id: 'timeline', name: 'Timeline', color: '#60a5fa', orbitRadius: 140, orbitDuration: 25, size: 24, sectionId: 'surface-section' },
  { id: 'values', name: 'Values', color: '#c084fc', orbitRadius: 200, orbitDuration: 35, size: 20, sectionId: 'middle-section' },
  { id: 'philosophy', name: 'Philosophy', color: '#fbbf24', orbitRadius: 260, orbitDuration: 45, size: 16, sectionId: 'deep-section' },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.016;
      
      // Create gradient background - warm silver to dark
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#e8e8e8');
      gradient.addColorStop(0.3, '#d0d0d0');
      gradient.addColorStop(0.6, '#1a1a2e');
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed * 100) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Avatar with Orbits */}
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          {/* Orbit Rings */}
          {planets.map((planet) => (
            <div
              key={`orbit-${planet.id}`}
              className="absolute rounded-full border border-white/10"
              style={{
                width: planet.orbitRadius * 2,
                height: planet.orbitRadius * 2,
              }}
            />
          ))}

          {/* Orbiting Planets */}
          {planets.map((planet) => (
            <motion.div
              key={planet.id}
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: planet.orbitDuration,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                width: planet.orbitRadius * 2,
                height: planet.orbitRadius * 2,
              }}
            >
              <motion.button
                className="absolute rounded-full cursor-pointer transition-all"
                style={{
                  width: planet.size,
                  height: planet.size,
                  backgroundColor: planet.color,
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: hoveredPlanet === planet.id 
                    ? `0 0 30px ${planet.color}, 0 0 60px ${planet.color}50`
                    : `0 0 15px ${planet.color}80`,
                }}
                onMouseEnter={() => setHoveredPlanet(planet.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onClick={() => scrollToSection(planet.sectionId)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Counter-rotate to keep tooltip upright */}
                <motion.div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: planet.orbitDuration,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <span 
                    className={`text-sm font-medium transition-opacity duration-300 ${
                      hoveredPlanet === planet.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ color: planet.color }}
                  >
                    {planet.name}
                  </span>
                </motion.div>
              </motion.button>
            </motion.div>
          ))}

          {/* Center Avatar */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                alt="Xiang Gu"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl -z-10" />
          </motion.div>
        </div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white/90 mb-2">
            顾湘
          </h1>
          <p className="text-xl text-white/60 tracking-widest">
            Xiang Gu
          </p>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 text-white/30 text-sm"
        >
          Click the orbiting planets to navigate
        </motion.p>
      </motion.div>
    </section>
  );
}
