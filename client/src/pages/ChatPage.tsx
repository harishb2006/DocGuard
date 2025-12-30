import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ShieldCheck, Loader2, BookOpen, FileText, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const { orgId } = useParams<{ orgId: string }>();
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<DocInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (token && orgId) {
      fetch(`${API_URL}/documents/${orgId}/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to load docs");
        })
        .then(data => setAvailableDocs(data))
        .catch(console.error);
    }
  }, [token, orgId]);

  const toggleDocFilter = (filename: string) => {
    setSelectedDocs(prev =>
      prev.includes(filename)
        ? prev.filter(d => d !== filename)
        : [...prev, filename]
    );
  };

  const handleAsk = async () => {
    if (!question.trim() || loading || !token || !orgId) return;

    const userMessage: Message = { type: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/documents/${orgId}/chat`, {
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
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <ShieldCheck size={20} />
          <span>Q&A Assistant</span>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${selectedDocs.length > 0 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
          >
            <Filter size={14} />
            {selectedDocs.length > 0 ? `${selectedDocs.length} Selected` : 'Filter Sources'}
          </button>

          {showFilter && (
            <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-700 text-sm">Select Sources</span>
                <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {availableDocs.map(doc => (
                  <label key={doc.filename} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.filename)}
                      onChange={() => toggleDocFilter(doc.filename)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 truncate">{doc.filename}</span>
                  </label>
                ))}
                {availableDocs.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No documents found.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="text-center py-12 md:py-20 h-full flex flex-col justify-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ask About Company Policies</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm mb-8">
              I can answer questions about HR policies, travel guidelines, remote work rules, and more using uploaded documents.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              <SampleQuestion text="What's the remote work policy?" onClick={setQuestion} />
              <SampleQuestion text="Can I expense internet bills?" onClick={setQuestion} />
              <SampleQuestion text="What are the leave types?" onClick={setQuestion} />
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'} rounded-2xl p-5 shadow-sm`}>
                <p className={`${msg.type === 'user' ? 'text-white' : 'text-slate-800'} leading-relaxed whitespace-pre-wrap text-sm`}>
                  {msg.content}
                </p>

                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                      <FileText size={14} />
                      <span>Sources</span>
                    </div>
                    {msg.sources.map((source, sidx) => (
                      <div key={sidx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase truncate max-w-[150px]">
                            {source.document_name}
                          </span>
                          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-600">
                            Page {source.page}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">"{source.content}"</p>
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
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={18} />
              <span className="text-slate-600 text-sm">Analyzing policies...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={selectedDocs.length > 0 ? `Asking in ${selectedDocs.length} documents...` : "Type your question..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-4 pr-12 text-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="absolute right-2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Answers are generated from uploaded documents only.
        </p>
      </div>
    </div>
  );
};

const SampleQuestion = ({ text, onClick }: { text: string; onClick: (text: string) => void }) => (
  <button
    onClick={() => onClick(text)}
    className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-all"
  >
    {text}
  </button>
);

export default ChatPage;
