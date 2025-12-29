import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Trash2, Download, Loader2,
  AlertCircle, CheckCircle, Search, UploadCloud,
  Grid, List, File, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Document {
  filename: string;
  size: number;
  uploaded_at: string;
}

interface Stats {
  total_documents: number;
  total_size_mb: number;
  vector_store: string;
}

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [docsRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/admin/documents', { headers }),
        fetch('http://localhost:8000/admin/stats', { headers })
      ]);

      if (docsRes.status === 403 || statsRes.status === 403) {
        throw new Error('Access denied. Admin rights required.');
      }

      if (!docsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load data');
      }

      const docsData = await docsRes.json();
      const statsData = await statsRes.json();

      setDocuments(docsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeleting(filename);
    try {
      const response = await fetch(`http://localhost:8000/admin/documents/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      await loadData();
    } catch {
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#DDE2FF] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-2 transition-colors"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <LayoutDashboard className="text-indigo-600" />
              Document Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Manage your knowledge base and track system status.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/50 backdrop-blur-md rounded-xl p-1 flex border border-white/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <UploadCloud size={20} />
              Upload New
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Documents"
              value={stats.total_documents}
              icon={<FileText />}
              color="indigo"
            />
            <StatCard
              title="Knowledge Base Size"
              value={`${stats.total_size_mb} MB`}
              icon={<Download />}
              color="purple"
            />
            <StatCard
              title="Vector Store Status"
              value={stats.vector_store.includes('Pinecone') ? 'Healthy' : 'Unknown'}
              subValue="Pinecone Connected"
              icon={<CheckCircle />}
              color="emerald"
            />
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-white/50">
          <Search className="text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Document List/Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 border-dashed">
            <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No documents found</h3>
            <p className="text-slate-500 mb-6">Upload queryable PDFs to get started.</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition"
            >
              Upload PDF
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.filename}
                doc={doc}
                viewMode={viewMode}
                onDelete={() => handleDelete(doc.filename)}
                isDeleting={deleting === doc.filename}
                formatBytes={formatBytes}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {subValue && <p className="text-slate-400 text-xs mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ doc, viewMode, onDelete, isDeleting, formatBytes }: any) => {
  if (viewMode === 'list') {
    return (
      <div className="group bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{doc.filename}</h4>
            <p className="text-slate-500 text-xs flex gap-2">
              {formatBytes(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="group bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 bg-white/80 backdrop-blur text-rose-500 hover:bg-rose-50 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
        </button>
      </div>

      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
        <FileText />
      </div>

      <h3 className="font-bold text-lg text-slate-800 mb-2 truncate" title={doc.filename}>{doc.filename}</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500 border-b border-slate-100 pb-2">
          <span>Size</span>
          <span className="font-medium">{formatBytes(doc.size)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Uploaded</span>
          <span className="font-medium">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Indexed</span>
        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md">PDF</span>
      </div>
    </div>
  );
};

export default DocumentsPage;
