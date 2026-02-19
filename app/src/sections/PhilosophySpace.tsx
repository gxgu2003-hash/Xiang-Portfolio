import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, Send, Check, Trash2 } from 'lucide-react';
import type { Thought, Comment } from '@/lib/supabase';
import { useEditMode } from '@/hooks/useEditMode';
import { fetchThoughts, createThought, updateThought, deleteThought, fetchComments, fetchAllComments, createComment, approveComment, deleteComment } from '@/lib/supabase';

export function PhilosophySpace() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const { isEditMode } = useEditMode();
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Load thoughts and comments
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [thoughtsData] = await Promise.all([fetchThoughts()]);
    setThoughts(thoughtsData);
    setLoading(false);
  };

  const loadComments = async (thoughtId: string) => {
    const commentsData = isEditMode
      ? await fetchAllComments(thoughtId)
      : await fetchComments(thoughtId);
    setComments(commentsData);
  };

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
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.016;
      
      // Dark starfield background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebula
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, 'rgba(50, 50, 100, 0.1)');
      gradient.addColorStop(0.5, 'rgba(20, 20, 50, 0.05)');
      gradient.addColorStop(1, 'transparent');
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

  const handleThoughtClick = async (thought: Thought) => {
    setSelectedThought(thought);
    await loadComments(thought.id);
  };

  const handleSubmitComment = async () => {
    if (!selectedThought || !newComment.trim()) return;

    const comment = await createComment({
      thought_id: selectedThought.id,
      content: newComment.trim(),
      author: commentAuthor.trim() || 'Anonymous',
      is_public: false, // Requires approval
    });

    if (comment) {
      setNewComment('');
      await loadComments(selectedThought.id);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    const success = await approveComment(commentId);
    if (success && selectedThought) {
      await loadComments(selectedThought.id);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success && selectedThought) {
      await loadComments(selectedThought.id);
    }
  };

  const handleSaveThought = async () => {
    if (!editingThought) return;

    if (!editingThought.id) {
      const newThought = await createThought({
        title: editingThought.title,
        content: editingThought.content,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      });
      if (newThought) {
        setThoughts([...thoughts, newThought]);
      }
    } else {
      const success = await updateThought(editingThought.id, {
        title: editingThought.title,
        content: editingThought.content,
      });
      if (success) {
        setThoughts(thoughts.map(t => t.id === editingThought.id ? editingThought : t));
      }
    }
    setEditingThought(null);
  };

  const handleDeleteThought = async (id: string) => {
    const success = await deleteThought(id);
    if (success) {
      setThoughts(thoughts.filter(t => t.id !== id));
      setSelectedThought(null);
    }
  };

  if (loading) {
    return (
      <section id="deep-section" className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </section>
    );
  }

  return (
    <section
      id="deep-section"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Thought Stars */}
      <div className="relative z-10 h-screen">
        {thoughts.map((thought, index) => (
          <motion.button
            key={thought.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="absolute"
            style={{
              left: `${thought.x || 20 + Math.random() * 60}%`,
              top: `${thought.y || 20 + Math.random() * 60}%`,
            }}
            onMouseEnter={() => setHoveredStar(thought.id)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => handleThoughtClick(thought)}
          >
            {/* Star with diffraction effect on hover */}
            <motion.div
              animate={{
                scale: hoveredStar === thought.id ? 1.5 : 1,
                rotate: hoveredStar === thought.id ? 45 : 0,
              }}
              className="relative"
            >
              {/* Diffraction spikes */}
              {hoveredStar === thought.id && (
                <>
                  <div className="absolute inset-0 w-4 h-px bg-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute inset-0 w-px h-4 bg-white/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute inset-0 w-3 h-px bg-white/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                  <div className="absolute inset-0 w-px h-3 bg-white/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                </>
              )}
              {/* Star core */}
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  hoveredStar === thought.id ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/40'
                }`}
              />
              {/* Glow on hover */}
              {hoveredStar === thought.id && (
                <div className="absolute inset-0 w-8 h-8 -m-3 bg-white/10 rounded-full blur-md" />
              )}
            </motion.div>
          </motion.button>
        ))}

        {/* Add Thought Button */}
        {isEditMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setEditingThought({ id: '', title: '', content: '', x: 50, y: 50 })}
            className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-xl text-white/60">+</span>
          </motion.button>
        )}
      </div>

      {/* Thought Detail Modal with Comments */}
      <AnimatePresence>
        {selectedThought && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedThought(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedThought.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => setEditingThought(selectedThought)}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <span className="text-white/60">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteThought(selectedThought.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedThought(null)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-6 h-6 text-white/60" />
                    </button>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed">{selectedThought.content}</p>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-8 py-4 border-b border-white/10">
                  <h3 className="text-white/50 text-sm">
                    Thoughts & Discussions ({comments.filter(c => c.is_public).length})
                  </h3>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-white/30 text-center py-8">No discussions yet. Be the first to share your thoughts.</p>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative ${!comment.is_public ? 'opacity-50' : ''}`}
                      >
                        <div className="glass rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-sm font-medium">
                              {comment.author || 'Anonymous'}
                            </span>
                            <span className="text-white/30 text-xs">
                              {new Date(comment.created_at || '').toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white/80">{comment.content}</p>

                          {/* Admin controls for pending comments */}
                          {isEditMode && !comment.is_public && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleApproveComment(comment.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/30 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Your name (optional)"
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none w-40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                      placeholder="Share your thoughts..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 text-white/60" />
                    </button>
                  </div>
                  <p className="text-white/30 text-xs mt-2">
                    Comments require approval before being publicly visible.
                  </p>
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setEditingThought(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-2xl p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {editingThought.id ? 'Edit Thought' : 'New Thought'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={editingThought.title}
                    onChange={(e) => setEditingThought({ ...editingThought, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Content</label>
                  <textarea
                    value={editingThought.content}
                    onChange={(e) => setEditingThought({ ...editingThought, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveThought}
                  className="flex-1 py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingThought(null)}
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
