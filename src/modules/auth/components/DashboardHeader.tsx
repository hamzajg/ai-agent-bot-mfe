import React from 'react';
import {AuthService} from '..';

const DashboardHeader: React.FC = () => {
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-semibold">{user?.shopName}</span>
        <span className="text-gray-500 text-sm">{user?.email}</span>
      </div>
      <button 
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardHeader;