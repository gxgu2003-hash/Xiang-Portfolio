import { motion } from 'framer-motion';
import { useEditMode } from '@/hooks/useEditMode';

export function EditEntry() {
  const { setShowPasswordModal, isEditMode } = useEditMode();

  if (isEditMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/70">Edit Mode Active</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.05 }}
      whileHover={{ opacity: 0.3, scale: 1.5 }}
      onClick={() => setShowPasswordModal(true)}
      className="fixed bottom-6 right-6 z-50 w-3 h-3 rounded-full bg-white cursor-pointer"
      title="Edit Entry"
    />
  );
}
