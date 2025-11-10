import React, { useState } from 'react';
import DashboardHeader from '@modules/auth/components/DashboardHeader';
import UsagePanel from '../components/UsagePanel';
import OwnerGate from '../components/OwnerGate';
import ConfigurationPanel from '../components/ConfigurationPanel';

type Tab = 'configuration' | 'usage' | 'ownergate';

const HomePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('configuration');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
          <div className="bg-white rounded-md">
            <nav className="border-b border-gray-200">
              <ul role="tablist" className="flex -mb-px">
                <li role="presentation">
                  <button
                    role="tab"
                    aria-selected={tab === 'configuration'}
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'configuration' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('configuration')}
                  >
                    Configuration
                  </button>
                </li>
                <li role="presentation">
                  <button
                    role="tab"
                    aria-selected={tab === 'usage'}
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'usage' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('usage')}
                  >
                    Usage
                  </button>
                </li>
                <li role="presentation">
                  <button
                    role="tab"
                    aria-selected={tab === 'ownergate'}
                    className={`px-4 py-2 -mb-px border-b-2 ${tab === 'ownergate' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-600'}`}
                    onClick={() => setTab('ownergate')}
                  >
                    Owner Gate
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          {tab === 'configuration' && <ConfigurationPanel />}
          {tab === 'usage' && <UsagePanel />}
          {tab === 'ownergate' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Owner Gate</h2>
              <OwnerGate>
                <div className="p-4 bg-gray-50 border rounded">Owner-only controls appear here after unlock.</div>
              </OwnerGate>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;