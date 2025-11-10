import React from 'react';
import { Sparkles } from 'lucide-react';
import { AuthService } from '@modules/auth';

interface Props {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavBar: React.FC<Props> = ({ onLoginClick, onRegisterClick }) => {
  const user = AuthService.getCurrentUser();
  const isLoggedIn = AuthService.isLoggedIn();

  const handleLogout = () => {
    AuthService.logout();
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 backdrop-blur bg-white/70 border-b border-gray-100 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-600" />
          <span className="font-semibold">AI Agent ChatBot</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-600">{user?.shopName}</span>
              <a 
                href="/dashboard" 
                className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                Dashboard
              </a>
              <button 
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign Up
              </button>
            </>
          )}
          <a 
            href="/demo.html" 
            className={`text-sm px-3 py-1.5 rounded-lg ${
              isLoggedIn 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'border hover:bg-gray-50'
            }`}
          >
            Demo
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;