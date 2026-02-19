import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { GraduationCap, Briefcase, Lightbulb, Heart, X, Edit2, Check, Plus, Trash2 } from 'lucide-react';
import type { TimelineEvent, TimelineCategory } from '@/types';
import { useEditMode } from '@/hooks/useEditMode';

const categoryConfig: Record<TimelineCategory, { label: string; color: string; icon: React.ElementType }> = {
  education: { label: '学校', color: '#60a5fa', icon: GraduationCap },
  project: { label: '项目', color: '#c084fc', icon: Lightbulb },
  career: { label: '工作', color: '#4ade80', icon: Briefcase },
  life: { label: '生活', color: '#fbbf24', icon: Heart },
};

const initialEvents: TimelineEvent[] = [
  {
    id: '1',
    year: 2015,
    title: '高中毕业',
    description: '完成了基础教育阶段，开始探索人生的新方向',
    category: 'education',
    details: '这一年我经历了人生中第一次重要的转折点，从熟悉的环境走向未知的大学生活。',
  },
  {
    id: '2',
    year: 2017,
    title: '第一个设计项目',
    description: '独立完成个人品牌设计，开启创意之路',
    category: 'project',
    details: '通过这个项目，我发现了自己对视觉传达的热情，也确立了未来的职业方向。',
  },
  {
    id: '3',
    year: 2018,
    title: '暑期实习',
    description: '在科技公司担任产品设计师实习生',
    category: 'career',
    details: '第一次进入真实的职场环境，学会了如何将设计理念转化为实际产品。',
  },
  {
    id: '4',
    year: 2019,
    title: '大学毕业',
    description: '获得设计学学士学位，正式踏入社会',
    category: 'education',
    details: '四年的大学生活让我从一个懵懂的学生成长为有独立思考能力的创作者。',
  },
  {
    id: '5',
    year: 2021,
    title: '独立创业',
    description: '创立个人设计工作室，服务多个品牌客户',
    category: 'career',
    details: '创业的过程充满挑战，但每一次与客户的合作都让我收获成长。',
  },
  {
    id: '6',
    year: 2022,
    title: '环球旅行',
    description: '独自背包游历东南亚和欧洲',
    category: 'life',
    details: '旅行让我看到了不同的生活方式，也让我更加珍惜当下的每一刻。',
  },
  {
    id: '7',
    year: 2023,
    title: '开源项目',
    description: '发布个人开源设计工具，获得社区认可',
    category: 'project',
    details: '将自己的经验回馈给社区，帮助更多设计师提升工作效率。',
  },
];

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter((e) => e.category === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => a.year - b.year);

  const handleSave = () => {
    if (editingEvent) {
      if (isAdding) {
        setEvents([...events, { ...editingEvent, id: Date.now().toString() }]);
        setIsAdding(false);
      } else {
        setEvents(events.map((e) => (e.id === editingEvent.id ? editingEvent : e)));
      }
      setEditingEvent(null);
    }
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    setSelectedEvent(null);
  };

  const handleAdd = () => {
    setEditingEvent({
      id: '',
      year: new Date().getFullYear(),
      title: '',
      description: '',
      category: 'life',
      details: '',
    });
    setIsAdding(true);
  };

  return (
    <section
      id="surface-section"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-6"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto mb-20"
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-sm mb-2 tracking-widest uppercase"
            >
              Surface Level
            </motion.p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">表层认识</h2>
            <p className="text-white/50 text-lg">时间线</p>
          </div>

          {isEditMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">添加事件</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-6xl mx-auto mb-16"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            全部
          </button>
          {(Object.keys(categoryConfig) as TimelineCategory[]).map((cat) => {
            const Icon = categoryConfig[cat].icon;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? categoryConfig[cat].color : undefined,
                }}
              >
                <Icon className="w-4 h-4" />
                {categoryConfig[cat].label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto relative">
        {/* Central Line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px timeline-line origin-top"
        />

        {/* Events */}
        <div className="space-y-12">
          {sortedEvents.map((event, index) => {
            const Icon = categoryConfig[event.category].icon;
            const color = categoryConfig[event.category].color;
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50, rotateX: 45 }}
                animate={isInView ? { opacity: 1, x: 0, rotateX: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.5 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative flex items-start gap-8 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Node */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center glow-subtle"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-4 h-4 text-black" />
                  </div>
                </motion.div>

                {/* Content Card */}
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-3rem)] ${
                    isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8'
                  }`}
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedEvent(event)}
                    className="glass rounded-2xl p-6 cursor-pointer group transition-all hover:glow-subtle"
                  >
                    <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                      <span
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {event.year}
                      </span>
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(event);
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-white/50" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90">
                      {event.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full inline-block mb-3"
                    style={{
                      backgroundColor: `${categoryConfig[selectedEvent.category].color}20`,
                      color: categoryConfig[selectedEvent.category].color,
                    }}
                  >
                    {selectedEvent.year}
                  </span>
                  <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <button
                      onClick={() => handleDelete(selectedEvent.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                {selectedEvent.description}
              </p>
              {selectedEvent.details && (
                <p className="text-white/50 leading-relaxed text-sm">
                  {selectedEvent.details}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEvent && isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
            onClick={() => {
              setEditingEvent(null);
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
                {isAdding ? '添加事件' : '编辑事件'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">年份</label>
                  <input
                    type="number"
                    value={editingEvent.year}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, year: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl password-input text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">标题</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl password-input text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">分类</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        category: e.target.value as TimelineCategory,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl password-input text-white bg-transparent"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key} className="bg-black">
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">描述</label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl password-input text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">详情</label>
                  <textarea
                    value={editingEvent.details || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, details: e.target.value })
                    }
                    rows={4}
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
                    setEditingEvent(null);
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
