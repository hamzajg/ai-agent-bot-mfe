import React, { useState } from 'react';
import {AuthService} from '..';

interface Props {
  onSuccess: () => void;
  onToggleMode: () => void;
}

const RegisterForm: React.FC<Props> = ({ onSuccess, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.register({ email, password, shopName });
      await AuthService.login({ email, password }); // Auto login after registration
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Shop Name</label>
          <div className="relative">
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              required
              placeholder="Your Shop Name"
              autoComplete="organization"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              required
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            focus:ring-4 focus:ring-blue-500/50 transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Already have an account?</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium
            hover:bg-gray-50 focus:ring-4 focus:ring-gray-200/50 transition-all duration-200"
        >
          Login to your account
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;