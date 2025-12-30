import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Upload, FileSearch, Globe,
  ArrowRight, LayoutDashboard, Lock, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const handleEnterApp = () => {
    navigate('/orgs');
  };

  return (
    <div className="min-h-screen bg-[#DDE2FF] font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">

      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col min-h-screen">

        {/* Navigation */}
        <nav className="flex justify-between items-center py-8">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xl tracking-tight">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck size={20} strokeWidth={3} />
            </div>
            <span>RuleBook Enterprise</span>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-600 font-semibold hover:text-indigo-600 transition-colors hidden md:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  disabled={authLoading}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                  Get Started <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={handleEnterApp}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                Launch Console
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-10 md:mt-20 mb-20">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/50 backdrop-blur-md shadow-sm text-sm font-semibold text-indigo-700 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            New: Multi-Document RAG Engine v2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8 max-w-5xl mx-auto drop-shadow-sm">
            Make your company data <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Instantly Searchable.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Stop digging through folders. DocGuard ingests your PDFs, policies, and handbooks to create a private, hallucination-free AI expert for your organization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={user ? handleEnterApp : () => navigate('/login')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              Start Free Trial <Zap size={20} className="text-yellow-300 fill-yellow-300" />
            </button>
            <button
              onClick={() => { }} // Placeholder for demo
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg shadow-lg border border-slate-100 transition-all hover:-translate-y-1 active:scale-95"
            >
              View Live Demo
            </button>
          </div>

          {/* Stats / Trust */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-slate-200/50 pt-12 opacity-80">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">99.9%</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">AES-256</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">&lt;50ms</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">10k+</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Docs Processed</div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <FeatureCard
            icon={<Upload size={28} />}
            title="Smart Ingestion"
            desc="Drag & drop massive PDF libraries. We auto-chunk, embed, and index everything in seconds."
            color="bg-blue-500"
          />
          <FeatureCard
            icon={<FileSearch size={28} />}
            title="Semantic Search"
            desc="Don't match keywords. Match meaning. Ask natural questions and get precise pages back."
            color="bg-indigo-500"
          />
          <FeatureCard
            icon={<Lock size={28} />}
            title="Enterprise Security"
            desc="Role-based access control (RBAC), end-to-end encryption, and strict data isolation."
            color="bg-purple-500"
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/50 py-8 text-center text-slate-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe size={16} />
            <span>San Francisco, CA</span>
          </div>
          &copy; {new Date().getFullYear()} RuleBook AI Inc. All rights reserved.
        </footer>

      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

const FeatureCard = ({ icon, title, desc, color }: FeatureCardProps) => (
  <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group cursor-default">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default LandingPage;