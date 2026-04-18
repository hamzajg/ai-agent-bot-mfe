import React, { useState, useEffect } from 'react';
import {AuthService} from '.';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useAuth } from './hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { handleAuthSuccess: authSuccessWithNavigation } = useAuth();

  useEffect(() => {
      const checkAuth = () => {
        setIsAuthenticated(AuthService.isLoggedIn());
        setIsLoading(false);
      };
      checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    authSuccessWithNavigation();
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-blue-600 px-6 pt-10 pb-8 shadow-lg sm:px-10">
              <div className="w-full flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white text-center">
                {isLoginMode ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="mt-2 text-blue-100 text-sm text-center">
                {isLoginMode 
                  ? 'Sign in to access your dashboard and manage your AI agent' 
                  : 'Get started with your own AI-powered customer service'}
              </p>
            </div>
          
            <div className="relative px-6 py-8 sm:px-10 bg-white">
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
          </div>
        </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;