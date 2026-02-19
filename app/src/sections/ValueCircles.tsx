import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, Edit2, Plus } from 'lucide-react';
import type { Event } from '@/lib/supabase';
import { useEditMode } from '@/hooks/useEditMode';
import { fetchEvents } from '@/lib/supabase';

interface ValueCategory {
  id: string;
  name: string;
  color: string;
  description: string;
}

const categories: ValueCategory[] = [
  { id: 'exploration', name: 'Exploration', color: '#a78bfa', description: 'Journeys & Discoveries' },
  { id: 'connection', name: 'Connection', color: '#60a5fa', description: 'People & Communities' },
  { id: 'creative', name: 'Creative', color: '#f472b6', description: 'Projects & Creations' },
];

export function ValueCircles() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [, setEditingCategory] = useState<ValueCategory | null>(null);
  const [, setIsAddingCategory] = useState(false);
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  const getEventsByCategory = (categoryId: string) => {
    return events.filter(e => e.category === categoryId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const getBubblePosition = (categoryId: string, index: number): { x: string; y: string; scale?: number } => {
    if (!selectedCategory) {
      // Default layout - three bubbles in a row
      const positions = [
        { x: '15%', y: '50%', scale: 1 },
        { x: '50%', y: '50%', scale: 1 },
        { x: '85%', y: '50%', scale: 1 },
      ];
      return positions[index];
    }

    if (selectedCategory === categoryId) {
      // Selected bubble - centered, larger
      return { x: '30%', y: '50%', scale: 1.5 };
    } else {
      // Other bubbles - pushed to edges
      const otherIndex = categories.filter(c => c.id !== selectedCategory).findIndex(c => c.id === categoryId);
      return {
        x: otherIndex === 0 ? '85%' : '92%',
        y: `${30 + otherIndex * 40}%`,
        scale: 0.4,
      };
    }
  };

  if (loading) {
    return (
      <section id="middle-section" className="min-h-screen py-32 flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </section>
    );
  }

  return (
    <section
      id="middle-section"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-6 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <p className="text-white/50 text-sm mb-2 tracking-widest uppercase">Middle Level</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Values</h2>
        <p className="text-white/50">What drives my journey</p>
      </motion.div>

      {/* Bubble Container */}
      <div className="relative h-[600px] max-w-6xl mx-auto">
        {categories.map((category, index) => {
          const position = getBubblePosition(category.id, index);
          const categoryEvents = getEventsByCategory(category.id);
          const isSelected = selectedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? {
                opacity: 1,
                scale: position.scale || 1,
                x: position.x,
                y: position.y,
              } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: position.x, top: position.y }}
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Main Bubble */}
              <motion.div
                whileHover={{ scale: isSelected ? 1.02 : 1.05 }}
                className="relative"
              >
                <div
                  className="w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center transition-all"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${category.color}30, ${category.color}10)`,
                    border: `2px solid ${category.color}40`,
                    boxShadow: isSelected
                      ? `0 0 60px ${category.color}40, inset 0 0 40px ${category.color}20`
                      : `0 0 30px ${category.color}20`,
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                  <p className="text-xs text-white/50 text-center px-4">{category.description}</p>
                  <span className="text-sm mt-2" style={{ color: category.color }}>
                    {categoryEvents.length} items
                  </span>
                </div>

                {/* Edit button for category */}
                {isEditMode && !isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                    }}
                    className="absolute -top-2 -right-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </motion.div>

              {/* Sub-bubbles (events) - only show when selected */}
              <AnimatePresence>
                {isSelected && (
                  <>
                    {categoryEvents.map((event, eventIndex) => {
                      const angle = (eventIndex * 2 * Math.PI) / Math.max(categoryEvents.length, 1) - Math.PI / 2;
                      const radius = 180;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      return (
                        <motion.button
                          key={event.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ delay: eventIndex * 0.05 }}
                          whileHover={{ scale: 1.15 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                          className="absolute w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle at 30% 30%, ${category.color}40, ${category.color}20)`,
                            border: `1px solid ${category.color}60`,
                            boxShadow: `0 0 20px ${category.color}30`,
                          }}
                        >
                          <span className="text-xs font-medium text-white/90 text-center px-1 line-clamp-2">
                            {event.start_year}
                          </span>

                          {/* Tooltip */}
                          <AnimatePresence>
                            {hoveredEvent === event.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 glass-strong rounded-xl whitespace-nowrap z-20"
                              >
                                <p className="text-white text-sm font-medium">{event.title}</p>
                                {event.summary && (
                                  <p className="text-white/50 text-xs mt-1">{event.summary}</p>
                                )}
                                <div
                                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                                  style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}

                    {/* Add event button */}
                    {isEditMode && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open edit modal to add new event with this category
                        }}
                        className="absolute w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                        style={{
                          left: '50%',
                          top: 'calc(50% - 200px)',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Plus className="w-5 h-5 text-white/60" />
                      </motion.button>
                    )}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Add Category Button */}
        {isEditMode && !selectedCategory && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsAddingCategory(true)}
            className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Plus className="w-6 h-6 text-white/60" />
          </motion.button>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl w-full max-w-[75vw] max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                {/* Images Section */}
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <div className="md:w-1/2 bg-black/30 p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {selectedEvent.images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className={`flex-1 p-8 overflow-y-auto ${!selectedEvent.images?.length ? 'md:w-full' : ''}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="text-sm font-medium px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: `${categories.find(c => c.id === selectedEvent.category)?.color}20`,
                            color: categories.find(c => c.id === selectedEvent.category)?.color,
                          }}
                        >
                          {selectedEvent.start_year}{selectedEvent.end_year && selectedEvent.end_year !== selectedEvent.start_year ? `-${selectedEvent.end_year}` : ''}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{selectedEvent.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-6 h-6 text-white/60" />
                    </button>
                  </div>

                  <p className="text-white/70 leading-relaxed text-lg mb-8">
                    {selectedEvent.description}
                  </p>

                  {selectedEvent.pdf_url && (
                    <div>
                      <h4 className="text-white/50 text-sm mb-3">Documents</h4>
                      <a
                        href={selectedEvent.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                      >
                        <span className="text-white/80">View PDF</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
