import React from 'react';
import { X } from 'lucide-react';
import LoginForm from '@modules/auth/components/LoginForm';
import RegisterForm from '@modules/auth/components/RegisterForm';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="relative bg-white rounded-xl shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            {mode === 'login' ? (
              <LoginForm onSuccess={handleSuccess} onToggleMode={onToggleMode} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} onToggleMode={onToggleMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;