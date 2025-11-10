import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from '@modules/auth/components/LoginForm';
import RegisterForm from '@modules/auth/components/RegisterForm';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onToggleMode: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, mode, onToggleMode, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="relative bg-white rounded-xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 
                  id="modal-title" 
                  className="text-xl font-semibold text-gray-900"
                >
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <motion.div 
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {mode === 'login' ? (
                  <LoginForm onSuccess={handleSuccess} onToggleMode={onToggleMode} />
                ) : (
                  <RegisterForm onSuccess={handleSuccess} onToggleMode={onToggleMode} />
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;