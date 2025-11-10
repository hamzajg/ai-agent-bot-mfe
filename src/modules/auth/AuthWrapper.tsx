import React, { useState, useEffect } from 'react';
import {AuthService} from '.';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

interface Props {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(AuthService.isLoggedIn());
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        {isLoginMode ? (
          <LoginForm 
            onSuccess={handleAuthSuccess} 
            onToggleMode={() => setIsLoginMode(false)} 
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess} 
            onToggleMode={() => setIsLoginMode(true)} 
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;