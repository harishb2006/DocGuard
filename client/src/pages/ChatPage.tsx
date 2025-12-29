import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldCheck, Loader2, BookOpen, FileText, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Source {
  page: number;
  content: string;
  document_name: string;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface DocInfo {
  filename: string;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<DocInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/admin/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to load docs");
        })
        .then(data => setAvailableDocs(data))
        .catch(console.error);
    }
  }, [token]);

  const toggleDocFilter = (filename: string) => {
    setSelectedDocs(prev =>
      prev.includes(filename)
        ? prev.filter(d => d !== filename)
        : [...prev, filename]
    );
  };

  const handleAsk = async () => {
    if (!question.trim() || loading || !token) return;

    const userMessage: Message = { type: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/employee/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question,
          document_filter: selectedDocs.length > 0 ? selectedDocs : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      const assistantMessage: Message = {
        type: 'assistant',
        content: data.answer,
        sources: data.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        type: 'assistant',
        content: '❌ Error connecting to backend or Authentication failed.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-5xl shadow-2xl border border-white overflow-hidden flex flex-col" style={{ height: '85vh' }}>

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <ArrowLeft size={20} /> Back to Home
          </button>
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <ShieldCheck size={24} />
            <span>Employee Q&A</span>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${selectedDocs.length > 0 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
            >
              <Filter size={16} />
              {selectedDocs.length > 0 ? `${selectedDocs.length} Docs Selected` : 'Filter Sources'}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-700">Select Sources</span>
                  <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableDocs.map(doc => (
                    <label key={doc.filename} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.filename)}
                        onChange={() => toggleDocFilter(doc.filename)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-600 truncate">{doc.filename}</span>
                    </label>
                  ))}
                  {availableDocs.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No documents found.</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Ask About Company Policies</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                I can answer questions about HR policies, travel guidelines, remote work rules, and more using uploaded documents.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <SampleQuestion text="What's the remote work policy?" onClick={setQuestion} />
                <SampleQuestion text="Can I expense internet bills?" onClick={setQuestion} />
                <SampleQuestion text="What are the leave types?" onClick={setQuestion} />
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'} rounded-3xl p-6 shadow-lg`}>
                  <p className={`${msg.type === 'user' ? 'text-white' : 'text-slate-800'} leading-relaxed`}>
                    {msg.content}
                  </p>

                  {/* Source Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <FileText size={16} />
                        <span>Sources</span>
                      </div>
                      {msg.sources.map((source, sidx) => (
                        <div key={sidx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase">
                              {source.document_name}
                            </span>
                            <span className="text-xs bg-slate-200 px-3 py-1 rounded-full font-bold text-slate-600">
                              Page {source.page}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">"{source.content}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg flex items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={20} />
                <span className="text-slate-600">Searching knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/50 border-t border-slate-100">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 flex items-center gap-4 px-6 py-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={selectedDocs.length > 0 ? `Asking in ${selectedDocs.length} documents...` : "Ask about company policies..."}
              className="flex-1 bg-transparent outline-none py-4 text-slate-700 font-medium"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="bg-indigo-600 p-3 rounded-2xl text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            Powered by RAG • Answers are grounded in uploaded documents
          </p>
        </div>
      </div>
    </div>
  );
};

const SampleQuestion = ({ text, onClick }: { text: string; onClick: (text: string) => void }) => (
  <button
    onClick={() => onClick(text)}
    className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-all"
  >
    {text}
  </button>
);

export default ChatPage;
