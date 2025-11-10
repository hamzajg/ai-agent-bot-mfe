import React from 'react';
import { MessageSquare, Cog, Database, Rocket, Sparkles, Settings2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ReleaseNotes, { Release } from './components/ReleaseNotes';
import NavBar from './components/NavBar';
import AuthModal from './components/AuthModal';

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = '', children }) => (
  <section id={id} className={`max-w-6xl mx-auto px-6 ${className}`}>{children}</section>
);

const HeroIllustration: React.FC = () => (
  <div className="relative w-full h-64 md:h-80 lg:h-96">
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 rounded-3xl blur-2xl opacity-70 animate-fadeIn" />
    <svg className="relative w-full h-full" viewBox="0 0 600 300" role="img" aria-label="Chatbot illustration">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="40" y="60" rx="20" width="520" height="180" fill="url(#grad)" opacity="0.12" />
      <g transform="translate(80,90)">
        <rect rx="14" width="240" height="60" fill="#fff" opacity="0.9" />
        <circle cx="26" cy="30" r="10" fill="#2563eb" />
        <rect x="50" y="20" rx="6" width="160" height="20" fill="#e5e7eb" />
      </g>
      <g transform="translate(300,150)">
        <rect rx="14" width="240" height="60" fill="#fff" opacity="0.9" />
        <rect x="14" y="20" rx="6" width="210" height="20" fill="#e5e7eb" />
      </g>
      <g transform="translate(500,80)">
        <circle cx="0" cy="0" r="6" fill="#22c55e" />
        <circle cx="18" cy="0" r="6" fill="#f59e0b" />
        <circle cx="36" cy="0" r="6" fill="#ef4444" />
      </g>
    </svg>
  </div>
);

const Feature: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition animate-fadeIn">
    <div className="flex items-center gap-3 mb-2 text-blue-600">{icon}<span className="font-semibold text-gray-900">{title}</span></div>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ValueCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 animate-fadeIn">
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const LandingApp: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const releases: Release[] = [
    {
      version: '1.2.0',
      date: 'November 10, 2025',
      description: 'Major update introducing user authentication and improved dashboard features.',
      changes: [
        {
          type: 'feature',
          description: 'Added user authentication system with registration and login for shop owners.',
        },
        {
          type: 'feature',
          description: 'New dashboard header with user info and logout functionality.',
        },
        {
          type: 'improvement',
          description: 'Enhanced widget actions with complete cart management and order processing.',
        },
        {
          type: 'improvement',
          description: 'Updated configuration interface with better organization and validation.',
        },
        {
          type: 'fix',
          description: 'Fixed cross-origin issues with static assets loading.',
        }
      ],
    },
    {
      version: '1.1.0',
      date: 'October 15, 2025',
      description: 'Enhanced AI capabilities and improved user interface.',
      changes: [
        {
          type: 'feature',
          description: 'Integration with Gemini and Ollama AI providers.',
        },
        {
          type: 'feature',
          description: 'New usage analytics dashboard with detailed metrics.',
        },
        {
          type: 'improvement',
          description: 'Optimized chat interface with better response handling.',
        },
        {
          type: 'fix',
          description: 'Resolved memory leaks in chat component.',
        }
      ],
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar 
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(mode => mode === 'login' ? 'register' : 'login')}
        onSuccess={handleAuthSuccess}
      />

      {/* HERO */}
      <Section className="py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight animate-fadeIn">
            Add an AI Assistant to any site in minutes
          </h1>
          <p className="mt-3 text-gray-600 animate-fadeIn">
            A lightweight, embeddable ChatBot that you can configure with your own provider, actions, and data sources. No backend required for local mock data.
          </p>
          <div className="mt-5 flex gap-3 animate-fadeIn">
            <a href="#features" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">See Features</a>
            <a href="/dashboard" className="px-4 py-2 rounded-lg border hover:bg-gray-50">Open Dashboard</a>
          </div>
        </div>
        <HeroIllustration />
      </Section>

      {/* FEATURES */}
      <Section id="features" className="py-6">
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature icon={<MessageSquare className="w-5 h-5" />} title="Drop-in Widget" desc="Add to any site with a single script tag. Fixed floating UI with high z-index ensures visibility." />
          <Feature icon={<Cog className="w-5 h-5" />} title="Configurable Agent" desc="Set role, mission, responsibilities, and actions via the dashboard or env." />
          <Feature icon={<Database className="w-5 h-5" />} title="Static Data Ready" desc="Ship mock JSON assets for instant demos; switch to APIs later without code changes." />
          <Feature icon={<Settings2 className="w-5 h-5" />} title="Action Execution" desc="Assistant outputs a strict JSON command that the client executes to fetch data." />
          <Feature icon={<ShieldCheck className="w-5 h-5" />} title="Isolated Bundles" desc="Client bundle contains no admin logic. Admin ships as a separate bundle and route." />
          <Feature icon={<Rocket className="w-5 h-5" />} title="Fast & Modern" desc="Vite + React, minimal footprint, Tailwind animations, works in any app stack." />
        </div>
      </Section>

      {/* BUSINESS VALUE */}
      <Section className="py-6">
        <h2 className="text-xl font-semibold mb-4">Business Value</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ValueCard title="Reduce Integration Time" desc="Embed in minutes rather than weeks. Iterate configuration without redeploys." />
          <ValueCard title="Unlock Self-Serve" desc="Customers can discover, search, and navigate to details without human assistance." />
          <ValueCard title="Scale Safely" desc="Constrain the assistant with explicit responsibilities and action endpoints." />
        </div>
      </Section>

      {/* SECURITY & PRIVACY */}
      <Section className="py-6 bg-gradient-to-b from-gray-50 to-white">        
        <h2 className="text-xl font-semibold mb-4">Security & Data Privacy</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid gap-6">
            {/* Security by Design */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-blue-700 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Security by Design
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>Isolated widget architecture ensures no access to sensitive shop data or backend systems</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>Secure authentication system for shop owners with encrypted sessions</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>CORS-protected endpoints and strict content security policies</p>
                </li>
              </ul>
            </div>

            {/* Data Privacy */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-green-700 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Privacy Commitment
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <p>No data sharing with external services - all data stays within your control</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <p>Customer conversations and interactions remain private and encrypted</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <p>Local storage of configurations with optional cloud backup</p>
                </li>
              </ul>
            </div>

            {/* Owner Control */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-purple-700 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Complete Owner Control
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <p>Fine-grained control over AI actions and API endpoint definitions</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <p>Limited API invocations with rate limiting and usage monitoring</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <p>Customizable response templates and action constraints</p>
                </li>
              </ul>
            </div>

            {/* Certification Note */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Our security measures are regularly audited and updated to maintain the highest standards of data protection and privacy.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="py-6">
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <p className="text-gray-700 mb-4">This project can be run two ways — using the hosted/cloud distribution or fully locally on your infrastructure. Both options give you the same embeddable widget and admin dashboard, with tradeoffs noted below.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">Hosted / Cloud</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">WIP Coming Soon</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Use the hosted build (CDN or a managed service) to drop the widget into any site with minimal setup — ideal for quick demos and managed deployments.</p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
              <li>Add the hosted script tag (for example: <code className="bg-gray-100 px-1 rounded">/chatbot-widget.iife.js</code>) to your site and call <code className="bg-gray-100 px-1 rounded">ChatBot.init()</code>.</li>
              <li>Open <a className="text-blue-600 underline" href="/dashboard">/dashboard</a> to configure provider keys, actions, and assets, or provide these via environment variables.</li>
              <li>Host static assets (example JSON under <code className="bg-gray-100 px-1 rounded">/assets</code>) on the same origin or a CORS-enabled endpoint so the widget can fetch them.</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">Good when you want fast rollout and managed updates; ensure you control which actions/endpoints are exposed in the dashboard.</p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">Fully Local / Self-hosted</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Run everything on your own infrastructure — the dashboard, widget assets, and optional backend — using Docker Compose. This gives you full custody of data and configuration.</p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
              <li>Clone the repository to your server: <code className="bg-gray-100 px-1 rounded">git clone https://github.com/hamzajg/ai-agent-bot-mfe.git</code>.</li>
              <li>Change into the project directory: <code className="bg-gray-100 px-1 rounded">cd ai-agent-bot-mfe-complete</code>.</li>
              <li>Start the app with Docker Compose: <code className="bg-gray-100 px-1 rounded">docker compose up --build -d</code>. This builds the app and serves the static bundles from Nginx on port 8081 by default.</li>
              <li>Open <code className="bg-gray-100 px-1 rounded">http://&lt;your-host&gt;:8081</code> and navigate to <code className="bg-gray-100 px-1 rounded">/dashboard</code> to configure the agent. Place any local mock assets under <code className="bg-gray-100 px-1 rounded">public/assets</code>.</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">Self-hosting is recommended when you require strict data residency, advanced network controls (VPCs, private subnets), or full isolation from external services.</p>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          <h4 className="font-medium">Security & Action Exposure</h4>
          <p className="mt-2">Regardless of deployment mode, shop owners retain control over which actions are exposed to the widget. Actions are configured in the dashboard (or via <code className="bg-gray-100 px-1 rounded">VITE_AGENT_ACTIONS_JSON</code> environment variable). Limit API endpoints and apply CORS/CSP rules as needed.</p>
        </div>
      </Section>

      {/* RELEASES */}
      <Section className="py-6">
        <h2 className="text-xl font-semibold mb-4">Latest Updates</h2>
          <ReleaseNotes releases={releases} />
      </Section>

      <footer className="text-center text-xs text-gray-500 py-10">© {new Date().getFullYear()} AI Agent ChatBot</footer>
    </div>
  );
};

export default LandingApp;