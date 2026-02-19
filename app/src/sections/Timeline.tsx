import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Edit2, Plus, Check, Trash2, FileText } from 'lucide-react';
import type { Event } from '@/lib/supabase';
import { useEditMode } from '@/hooks/useEditMode';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase';

const categoryColors: Record<string, string> = {
  exploration: '#a78bfa',
  connection: '#60a5fa',
  creative: '#f472b6',
};

const categoryLabels: Record<string, string> = {
  exploration: 'Exploration',
  connection: 'Connection',
  creative: 'Creative',
};

export function Timeline() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Load events from Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  // Group events by parent
  const mainEvents = events.filter(e => !e.parent_id);
  const getSubEvents = (parentId: string) => events.filter(e => e.parent_id === parentId);

  const toggleExpand = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const handleSave = async () => {
    if (!editingEvent) return;

    if (isAdding) {
      const newEvent = await createEvent({
        title: editingEvent.title,
        description: editingEvent.description,
        summary: editingEvent.summary,
        start_year: editingEvent.start_year,
        end_year: editingEvent.end_year,
        category: editingEvent.category,
        images: editingEvent.images,
        pdf_url: editingEvent.pdf_url,
        parent_id: editingEvent.parent_id,
      });
      if (newEvent) {
        setEvents([...events, newEvent]);
      }
      setIsAdding(false);
    } else {
      const success = await updateEvent(editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        summary: editingEvent.summary,
        start_year: editingEvent.start_year,
        end_year: editingEvent.end_year,
        category: editingEvent.category,
        images: editingEvent.images,
        pdf_url: editingEvent.pdf_url,
      });
      if (success) {
        setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
      }
    }
    setEditingEvent(null);
    setNewImageUrl('');
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEvent(id);
    if (success) {
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
    }
  };

  const handleAdd = (parentId?: string) => {
    setEditingEvent({
      id: '',
      title: '',
      description: '',
      summary: '',
      start_year: new Date().getFullYear(),
      end_year: undefined,
      category: 'exploration',
      images: [],
      pdf_url: '',
      parent_id: parentId || null,
    });
    setIsAdding(true);
    setNewImageUrl('');
  };

  const addImage = () => {
    if (newImageUrl && editingEvent) {
      setEditingEvent({
        ...editingEvent,
        images: [...(editingEvent.images || []), newImageUrl],
      });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        images: editingEvent.images?.filter((_, i) => i !== index) || [],
      });
    }
  };

  const formatYearRange = (start: number, end?: number) => {
    if (end && end !== start) {
      return `${start}-${end}`;
    }
    return `${start}`;
  };

  if (loading) {
    return (
      <section id="surface-section" className="min-h-screen py-32 flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </section>
    );
  }

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
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto mb-16"
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/50 text-sm mb-2 tracking-widest uppercase">Surface Level</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Timeline</h2>
            <p className="text-white/50">My journey through time</p>
          </div>
          {isEditMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleAdd()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Event</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto relative">
        {/* Central Line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5 }}
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent origin-top"
        />

        {/* Events */}
        <div className="space-y-8">
          {mainEvents.map((event, index) => {
            const subEvents = getSubEvents(event.id);
            const isExpanded = expandedEvents.has(event.id);
            const isLeft = index % 2 === 0;
            const color = categoryColors[event.category] || '#888';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative"
              >
                {/* Node */}
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => toggleExpand(event.id)}
                  className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{ borderColor: color, backgroundColor: isExpanded ? color : 'transparent' }}
                >
                  {subEvents.length > 0 && (
                    isExpanded ? <ChevronUp className="w-3 h-3 text-black" /> : <ChevronDown className="w-3 h-3" style={{ color }} />
                  )}
                </motion.button>

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-8 md:text-right md:mr-auto' : 'md:pl-8 md:ml-auto'}`}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedEvent(event)}
                    className="glass rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-lg"
                    style={{ boxShadow: `0 0 20px ${color}10` }}
                  >
                    <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                      <span
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {formatYearRange(event.start_year, event.end_year)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: `${color}40`, color: `${color}cc` }}
                      >
                        {categoryLabels[event.category]}
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
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
                      {event.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2">
                      {event.description}
                    </p>
                    {event.images && event.images.length > 0 && (
                      <div className={`flex gap-2 mt-3 ${isLeft ? 'md:justify-end' : ''}`}>
                        {event.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg overflow-hidden bg-white/5">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {event.images.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/50">
                            +{event.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Sub Events */}
                  <AnimatePresence>
                    {isExpanded && subEvents.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pl-4 space-y-3">
                          {subEvents.map((subEvent, subIndex) => (
                            <motion.div
                              key={subEvent.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.05 }}
                              whileHover={{ x: 5 }}
                              onClick={() => setSelectedEvent(subEvent)}
                              className="glass rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-white/40">{subEvent.start_year}</span>
                                <h4 className="text-white/80 font-medium">{subEvent.title}</h4>
                              </div>
                              <p className="text-white/50 text-sm line-clamp-1">{subEvent.description}</p>
                            </motion.div>
                          ))}
                          {isEditMode && (
                            <button
                              onClick={() => handleAdd(event.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Sub-event
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal (3/4 screen) */}
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
                          style={{ backgroundColor: `${categoryColors[selectedEvent.category]}20`, color: categoryColors[selectedEvent.category] }}
                        >
                          {formatYearRange(selectedEvent.start_year, selectedEvent.end_year)}
                        </span>
                        <span className="text-xs text-white/50">{categoryLabels[selectedEvent.category]}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{selectedEvent.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditMode && (
                        <>
                          <button
                            onClick={() => setEditingEvent(selectedEvent)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-5 h-5 text-white/60" />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedEvent.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X className="w-6 h-6 text-white/60" />
                      </button>
                    </div>
                  </div>

                  <p className="text-white/70 leading-relaxed text-lg mb-8">
                    {selectedEvent.description}
                  </p>

                  {selectedEvent.pdf_url && (
                    <div className="mb-6">
                      <h4 className="text-white/50 text-sm mb-3">Documents</h4>
                      <a
                        href={selectedEvent.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-white/60" />
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEvent && isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => {
              setEditingEvent(null);
              setIsAdding(false);
              setNewImageUrl('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {isAdding ? 'Add Event' : 'Edit Event'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/50 mb-2 block">Start Year</label>
                    <input
                      type="number"
                      value={editingEvent.start_year}
                      onChange={(e) => setEditingEvent({ ...editingEvent, start_year: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/50 mb-2 block">End Year (optional)</label>
                    <input
                      type="number"
                      value={editingEvent.end_year || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, end_year: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="exploration">Exploration</option>
                    <option value="connection">Connection</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Summary (one line)</label>
                  <input
                    type="text"
                    value={editingEvent.summary || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, summary: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Description</label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Images</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Image URL..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                    />
                    <button
                      onClick={addImage}
                      className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingEvent.images?.map((img, i) => (
                      <div key={i} className="relative group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">PDF URL</label>
                  <input
                    type="text"
                    value={editingEvent.pdf_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, pdf_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setIsAdding(false);
                    setNewImageUrl('');
                  }}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
