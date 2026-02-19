import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { useEditMode } from '@/hooks/useEditMode';

export function PasswordModal() {
  const { showPasswordModal, setShowPasswordModal, verifyPassword } = useEditMode();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = verifyPassword(password);
    if (!isValid) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } else {
      setPassword('');
    }
  };

  const handleClose = () => {
    setShowPasswordModal(false);
    setPassword('');
    setError(false);
  };

  return (
    <AnimatePresence>
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">编辑模式</h3>
                  <p className="text-sm text-white/50">请输入密码进入编辑模式</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码..."
                  className={`w-full px-4 py-3 rounded-xl password-input text-white placeholder:text-white/30 pr-12 ${
                    error ? 'border-red-500/50 animate-pulse' : ''
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/50" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/50" />
                  )}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mb-4"
                >
                  密码错误，请重试
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                进入编辑模式
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
