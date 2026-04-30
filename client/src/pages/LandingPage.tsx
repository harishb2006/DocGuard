import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, FileSearch, Lock, 
  ArrowRight, Zap, CheckCircle2, MessageSquare, 
  Search, Database, Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/40 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-200/30 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">RuleBook<span className="text-indigo-600">.ai</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="hidden md:block font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Login
          </button>
          <button 
            onClick={() => navigate(user ? '/orgs' : '/login')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          v2.0: Now with Gemini 1.5 Pro Support
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight">
          Your company’s knowledge, <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            delivered in seconds.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop wasting hours searching through outdated PDFs. RuleBook AI creates a private, hallucination-free expert that answers employee questions instantly using your actual policies.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Deploy RuleBook Free <Zap size={20} className="fill-white" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
            Talk to Sales
          </button>
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-20 pt-10 border-t border-slate-200/60">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by Modern Engineering Teams</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="text-2xl font-bold text-slate-800">ACME CORP</span>
            <span className="text-2xl font-bold text-slate-800">GLOBEX</span>
            <span className="text-2xl font-bold text-slate-800">SOYLENT</span>
            <span className="text-2xl font-bold text-slate-800">INITECH</span>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="bg-white py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Engineered for Accuracy</h2>
            <p className="text-slate-500">Unlike generic LLMs, we prioritize source-grounded truth above all else.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={<Database className="text-blue-600" />}
              title="Semantic Chunking"
              description="We don't just read text. We understand context, ensuring your policy's nuance is never lost in translation."
            />
            <FeatureItem 
              icon={<Shield className="text-green-600" />}
              description="Zero-retention data privacy. Your company secrets stay yours—we never train models on your data."
              title="Enterprise Grade Security"
            />
            <FeatureItem 
              icon={<CheckCircle2 className="text-purple-600" />}
              description="Every response includes a direct link to the source document and page number for 100% verifiability."
              title="Verified Citations"
            />
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                From PDF to <br/> Chat in under 60s.
              </h2>
              <ul className="space-y-4">
                {[
                  "Bulk upload 100+ page handbooks",
                  "Auto-generated embeddings (Gemini 1.5)",
                  "Vector-optimized search (Pinecone)",
                  "Seamless React-based chat UI"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-inner">
               {/* Mock UI Representation */}
               <div className="space-y-3">
                  <div className="h-8 w-2/3 bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-20 w-full bg-indigo-600/20 rounded-lg border border-indigo-500/30 p-4">
                    <p className="text-xs text-indigo-300 font-mono">system@rulebook: ~$ semantic_search --query "remote work"</p>
                    <p className="text-sm text-white mt-2">Found: Section 4.2 - "Hybrid Eligibility"</p>
                  </div>
                  <div className="h-8 w-1/2 bg-slate-700 rounded-lg animate-pulse" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 text-center border-t border-slate-200">
        <h2 className="text-3xl font-bold mb-6">Ready to fix your internal support?</h2>
        <button 
          onClick={() => navigate('/login')}
          className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          Get Started for Free
        </button>
        <p className="mt-8 text-slate-400 text-sm">
          © {new Date().getFullYear()} RuleBook AI. Built for the future of work.
        </p>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
    <div className="mb-4 p-3 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;