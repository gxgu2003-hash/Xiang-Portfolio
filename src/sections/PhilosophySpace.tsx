import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, Edit2, Plus, Check, Trash2, Sparkles } from 'lucide-react';
import type { PhilosophyThought } from '@/types';
import { useEditMode } from '@/hooks/useEditMode';

const initialThoughts: PhilosophyThought[] = [
  {
    id: '1',
    title: '什么是意识？',
    content: '意识是物质的产物，还是独立于物质的存在？当我们思考"我"的时候，这个"我"究竟在哪里？',
    x: 20,
    y: 25,
    connections: ['2', '4'],
  },
  {
    id: '2',
    title: '自由意志 vs 决定论',
    content: '我们的选择是真正自由的，还是由过去的经验和物理法则所决定的？如果一切都被决定，那么道德责任还存在吗？',
    x: 70,
    y: 20,
    connections: ['1', '3'],
  },
  {
    id: '3',
    title: '技术的未来',
    content: '当AI超越人类智能时，人类的价值将如何定义？技术应该服务于人，还是人与技术将融合为一体？',
    x: 45,
    y: 60,
    connections: ['2', '5'],
  },
  {
    id: '4',
    title: '存在的意义',
    content: '在没有预设目的的世界中，我们如何为自己创造意义？意义是主观的建构，还是有客观的标准？',
    x: 15,
    y: 70,
    connections: ['1', '5'],
  },
  {
    id: '5',
    title: '现实的本质',
    content: '我们感知到的现实是真实的吗？还是只是大脑对外部信号的解读？如果模拟足够真实，它与现实有何区别？',
    x: 80,
    y: 75,
    connections: ['3', '4'],
  },
];

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

export function PhilosophySpace() {
  const [thoughts, setThoughts] = useState<PhilosophyThought[]>(initialThoughts);
  const [selectedThought, setSelectedThought] = useState<PhilosophyThought | null>(null);
  const [editingThought, setEditingThought] = useState<PhilosophyThought | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredThought, setHoveredThought] = useState<string | null>(null);
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number | null>(null);

  // Generate background stars
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      newStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
      });
    }
    setStars(newStars);
  }, []);

  // Animate stars
  useEffect(() => {
    if (!canvasRef.current || !isInView) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(
          (star.x / 100) * canvas.width,
          (star.y / 100) * canvas.height,
          star.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      // Draw nebula effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, 'rgba(100, 100, 255, 0.03)');
      gradient.addColorStop(0.5, 'rgba(50, 50, 150, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, stars]);

  const handleSave = () => {
    if (editingThought) {
      if (isAdding) {
        const newThought = {
          ...editingThought,
          id: Date.now().toString(),
          x: 30 + Math.random() * 40,
          y: 30 + Math.random() * 40,
          connections: [],
        };
        setThoughts([...thoughts, newThought]);
        setIsAdding(false);
      } else {
        setThoughts(thoughts.map((t) => (t.id === editingThought.id ? editingThought : t)));
      }
      setEditingThought(null);
    }
  };

  const handleDelete = (id: string) => {
    setThoughts(thoughts.filter((t) => t.id !== id));
    setSelectedThought(null);
  };

  const handleAdd = () => {
    setEditingThought({
      id: '',
      title: '',
      content: '',
      x: 50,
      y: 50,
      connections: [],
    });
    setIsAdding(true);
  };

  return (
    <section
      id="deep-section"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-6 overflow-hidden"
    >
      {/* Starfield Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Fluid Texture Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(100, 100, 255, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(150, 100, 200, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(50, 100, 150, 0.05) 0%, transparent 70%)
            `,
          }}
        />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-6xl mx-auto mb-16"
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-sm mb-2 tracking-widest uppercase"
            >
              Deep Level
            </motion.p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">深层认识</h2>
            <p className="text-white/50 text-lg">哲学思考</p>
          </div>

          {isEditMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">添加思考</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Thought Constellation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="relative z-10 max-w-6xl mx-auto h-[600px] md:h-[700px]"
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {thoughts.map((thought) =>
            thought.connections.map((connectedId) => {
              const connected = thoughts.find((t) => t.id === connectedId);
              if (!connected || connectedId < thought.id) return null;
              const isHighlighted =
                hoveredThought === thought.id || hoveredThought === connectedId;
              return (
                <motion.line
                  key={`${thought.id}-${connectedId}`}
                  x1={`${thought.x}%`}
                  y1={`${thought.y}%`}
                  x2={`${connected.x}%`}
                  y2={`${connected.y}%`}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth={isHighlighted ? 2 : 1}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isHighlighted ? 0.8 : 0.3,
                  }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              );
            })
          )}
        </svg>

        {/* Thought Stars */}
        {thoughts.map((thought, index) => (
          <motion.div
            key={thought.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.3 + index * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              left: `${thought.x}%`,
              top: `${thought.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            onMouseEnter={() => setHoveredThought(thought.id)}
            onMouseLeave={() => setHoveredThought(null)}
          >
            <motion.button
              whileHover={{ scale: 1.5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedThought(thought)}
              className="relative group"
            >
              {/* Star Glow */}
              <motion.div
                animate={{
                  opacity: hoveredThought === thought.id ? 1 : 0.5,
                  scale: hoveredThought === thought.id ? 1.5 : 1,
                }}
                className="absolute inset-0 bg-white/20 rounded-full blur-xl"
              />
              {/* Star Core */}
              <div className="relative w-4 h-4 bg-white rounded-full shadow-lg shadow-white/50">
                <Sparkles className="absolute inset-0 w-full h-full p-0.5 text-white/80" />
              </div>
              {/* Label */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: hoveredThought === thought.id ? 1 : 0,
                  y: hoveredThought === thought.id ? 0 : 10,
                }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-white/70 whitespace-nowrap"
              >
                {thought.title}
              </motion.span>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Hint Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.5 }}
        className="relative z-10 text-center text-white/30 text-sm mt-8"
      >
        点击星星探索思想
      </motion.p>

      {/* Thought Detail Modal */}
      <AnimatePresence>
        {selectedThought && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => setSelectedThought(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-lg w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Supernova Effect */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white/80" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{selectedThought.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => setEditingThought(selectedThought)}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                          onClick={() => handleDelete(selectedThought.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedThought(null)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed text-lg">
                  {selectedThought.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Thought Modal */}
      <AnimatePresence>
        {editingThought && isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => {
              setEditingThought(null);
              setIsAdding(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {isAdding ? '添加思考' : '编辑思考'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">标题</label>
                  <input
                    type="text"
                    value={editingThought.title}
                    onChange={(e) =>
                      setEditingThought({ ...editingThought, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl password-input text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">内容</label>
                  <textarea
                    value={editingThought.content}
                    onChange={(e) =>
                      setEditingThought({ ...editingThought, content: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl password-input text-white resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditingThought(null);
                    setIsAdding(false);
                  }}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
