import { useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Search, Sparkles, ArrowRight, Shield, Plus, Compass, LayoutGrid, History, Mic, Send, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-4 md:p-8 font-sans">
      {/* Main Container - The White Glass Card */}
      <div className="w-full max-w-7xl bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 flex overflow-hidden min-h-[85vh]">
        
        {/* Sidebar - Inspired by your screenshot */}
        <aside className="w-20 bg-black/5 flex flex-col items-center py-8 gap-8 border-r border-white/20">
          <div className="p-3 bg-black rounded-xl text-white cursor-pointer hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <div className="flex flex-col gap-6 text-slate-500">
            <Search className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <Compass className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <LayoutGrid className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <History className="cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-auto">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">N</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative p-8 md:p-12">
          {/* Top Nav */}
          <nav className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Sparkles size={18} className="text-indigo-500" />
              <span>Assistant v2.6</span>
            </div>
            <button className="bg-black text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              <Sparkles size={16} />
              Upgrade
            </button>
          </nav>

          {/* Hero Section */}
          <div className="flex-1">
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-12">
                Hi Nixtio, Ready to <br />
                <span className="text-indigo-600">Achieve Great Things?</span>
              </h1>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                <FeatureCard 
                  icon={<div className="bg-orange-100 p-3 rounded-xl text-orange-600"><LayoutGrid /></div>}
                  title="Upload & Sync"
                  desc="Contribute ideas, offer feedback, and manage tasks — all in sync."
                  label="Fast Start"
                  onClick={() => navigate('/upload')}
                />
                <FeatureCard 
                  icon={<div className="bg-green-100 p-3 rounded-xl text-green-600"><MessageSquare /></div>}
                  title="Collaborate"
                  desc="Stay connected, share ideas, and align goals effortlessly with AI."
                  label="Team Flow"
                />
                <FeatureCard 
                  icon={<div className="bg-blue-100 p-3 rounded-xl text-blue-600"><BookOpen /></div>}
                  title="Organize"
                  desc="Organize your time efficiently, set clear priorities, and stay focused."
                  label="Planning"
                />
              </div>
            </div>

            {/* Mascot - Positioned like the screenshot */}
            <div className="absolute right-12 top-40 hidden lg:block animate-float">
                <div className="relative">
                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 border border-slate-100 font-semibold text-sm">
                        Hey there! 👋 <br /> Need a boost?
                    </div>
                    <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-indigo-200 shadow-2xl">
                        <Sparkles size={60} className="text-white" />
                    </div>
                </div>
            </div>
          </div>

          {/* Bottom Action Bar - Inspired by the search bar in screenshot */}
          <div className="mt-auto max-w-3xl w-full mx-auto">
            <div className="bg-white rounded-3xl p-2 shadow-xl border border-slate-100 flex items-center gap-4 px-6">
                <Plus className="text-slate-400 cursor-pointer" />
                <input 
                    type="text" 
                    placeholder="Ask DocGuard anything..." 
                    className="flex-1 bg-transparent outline-none py-4 text-slate-700"
                />
                <div className="flex items-center gap-3">
                    <Mic className="text-slate-400 cursor-pointer" />
                    <button className="bg-black p-3 rounded-2xl text-white hover:scale-105 transition-transform">
                        <Send size={18} />
                    </button>
                </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
                <QuickAction label="Deep Research" />
                <QuickAction label="Make an Image" />
                <QuickAction label="Search" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components
const FeatureCard = ({ icon, title, desc, label, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white/50 border border-white p-8 rounded-[32px] hover:bg-white transition-all cursor-pointer group hover:shadow-xl"
  >
    <div className="mb-6 group-hover:scale-110 transition-transform duration-300 w-fit">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
  </div>
);

const QuickAction = ({ label }: { label: string }) => (
    <button className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all border border-slate-200">
        {label}
    </button>
)

export default LandingPage;