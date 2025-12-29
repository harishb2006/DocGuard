import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookText, Upload, Search, ShieldCheck,
  Sparkles, Plus, LayoutGrid,
  History, Mic, Send, FileSearch
} from 'lucide-react';


import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loginWithGoogle, logout, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-2xl rounded-5xl shadow-2xl border border-white/50 flex overflow-hidden min-h-[85vh]">

        {/* Sidebar */}
        <aside className="w-20 bg-black/5 flex flex-col items-center py-8 gap-8 border-r border-white/20">
          <div className="p-3 bg-indigo-600 rounded-xl text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
            <Plus size={24} />
          </div>
          <div className="flex flex-col gap-6 text-slate-400">
            <Search className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <BookText className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <LayoutGrid className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <History className="cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-auto">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">HR</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative p-8 md:p-12">
          <nav className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2 text-slate-600 font-bold tracking-tight">
              <ShieldCheck size={20} className="text-indigo-600" />
              <span>RuleBook Enterprise</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/documents')}
                className="bg-white text-slate-700 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-50 transition-all shadow-md border border-slate-200"
              >
                Documents
              </button>

              {!user ? (
                <button
                  onClick={loginWithGoogle}
                  disabled={authLoading}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Sign In
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/chat')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Ask Questions
                  </button>
                  <button
                    onClick={logout}
                    className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition-all"
                  >
                    Sign Out
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/analytics')}
                className="bg-black text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
              >
                <Sparkles size={16} />
                Admin Console
              </button>
            </div>
          </nav>

          <div className="flex-1">
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-12">
                Your Policies, <br />
                <span className="text-indigo-600">Instantly Searchable.</span>
              </h1>

              {/* RAG Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <FeatureCard
                  icon={<div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Upload /></div>}
                  title="Upload Documents"
                  desc="Upload corporate PDFs. We chunk and embed data for 100% accuracy."
                  label="Data Pipeline"
                  onClick={() => navigate('/upload')}
                />
                <FeatureCard
                  icon={<div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FileSearch /></div>}
                  title="Ask Questions"
                  desc="AI answers strictly using your uploaded data—no hallucinations."
                  label="Grounded AI"
                  onClick={() => navigate('/chat')}
                />
                <FeatureCard
                  icon={<div className="bg-slate-100 p-3 rounded-xl text-slate-600"><ShieldCheck /></div>}
                  title="Manage Documents"
                  desc="View all uploaded documents with page numbers and direct quotes for audit."
                  label="Document Control"
                  onClick={() => navigate('/documents')}
                />
              </div>
            </div>

            {/* Mascot */}
            <div className="absolute right-12 top-40 hidden lg:block animate-float">
              <div className="relative">
                <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 border border-slate-100 font-semibold text-sm text-slate-600">
                  Ask me about <br /> <span className="text-indigo-600">Travel Policies</span>
                </div>
                <div className="w-28 h-28 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
                  <BookText size={48} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-auto max-w-3xl w-full mx-auto">
            <div className="bg-white rounded-3xl p-2 shadow-2xl border border-slate-100 flex items-center gap-4 px-6">
              <Search className="text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && navigate('/chat')}
                placeholder="Search company policies, manuals, or handbooks..."
                className="flex-1 bg-transparent outline-none py-4 text-slate-700 font-medium"
              />
              <div className="flex items-center gap-3">
                <Mic className="text-slate-400 cursor-pointer" />
                <button
                  onClick={() => searchQuery.trim() && navigate('/chat')}
                  className="bg-indigo-600 p-3 rounded-2xl text-white hover:scale-105 transition-transform"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <QuickAction label="Health Benefits" onClick={() => navigate('/chat')} />
              <QuickAction label="IT Security" onClick={() => navigate('/chat')} />
              <QuickAction label="Remote Work" onClick={() => navigate('/chat')} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  label: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon, title, desc, label, onClick }: FeatureCardProps) => (
  <div onClick={onClick} className="bg-white/50 border border-white p-8 rounded-4xl hover:bg-white transition-all cursor-pointer group hover:shadow-xl">
    <div className="mb-6 group-hover:scale-110 transition-transform duration-300 w-fit">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
  </div>
);

const QuickAction = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all border border-slate-200"
  >
    {label}
  </button>
)

export default LandingPage;