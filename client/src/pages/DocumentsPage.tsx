import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Trash2, Loader2,
  AlertCircle, Search, UploadCloud,
  Grid, List, File, LayoutDashboard
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const { orgId } = useParams<{ orgId: string }>();
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
    if (token && orgId) loadData();
  }, [token, orgId]);

  const loadData = async () => {
    if (!token || !orgId) return;
    setLoading(true);
    setError('');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch documents list
      const docsRes = await fetch(`${API_URL}/documents/${orgId}/list`, { headers });

      if (docsRes.status === 403) throw new Error('Access denied.');
      if (!docsRes.ok) throw new Error('Failed to load data');

      const docsData: Document[] = await docsRes.json();
      setDocuments(docsData);

      // Calculate stats locally
      const totalSize = docsData.reduce((acc, doc) => acc + (doc.size || 0), 0);
      setStats({
        total_documents: docsData.length,
        total_size_mb: parseFloat((totalSize / (1024 * 1024)).toFixed(2)),
        vector_store: "Connected"
      });

    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
    if (!orgId) return;

    setDeleting(filename);
    try {
      const response = await fetch(`${API_URL}/documents/${orgId}/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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
    <div className="space-y-6">

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-indigo-600" size={24} />
            Document Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage knowledge base assets.</p>
        </div>

        {stats && (
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase">Docs</div>
              <div className="text-lg font-bold text-slate-700">{stats.total_documents}</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase">Size</div>
              <div className="text-lg font-bold text-slate-700">{stats.total_size_mb} MB</div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
          <Search className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-slate-700 text-sm font-medium py-2.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}
            >
              <List size={18} />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <button
            onClick={() => navigate(`/app/${orgId}/upload`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm text-sm flex items-center gap-2"
          >
            <UploadCloud size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 font-medium text-sm">{error}</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white/40 rounded-3xl border border-slate-200 border-dashed">
          <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No documents found</h3>
          <p className="text-slate-500 text-sm mb-4">Upload queryable PDFs to get started.</p>
          <button
            onClick={() => navigate(`/app/${orgId}/upload`)}
            className="px-5 py-2 bg-white text-indigo-600 font-semibold rounded-xl border border-indigo-100 hover:bg-indigo-50 transition text-sm shadow-sm"
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
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
  );
};

const DocumentCard = ({ doc, viewMode, onDelete, isDeleting, formatBytes }: any) => {
  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-xl p-3 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden ml-1">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-700 text-sm truncate">{doc.filename}</h4>
            <div className="text-slate-400 text-xs flex gap-2">
              <span>{formatBytes(doc.size)}</span>
              <span>•</span>
              <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
        </button>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden">
      <div className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg shadow-sm transition-colors disabled:opacity-50 border border-slate-100"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
        </button>
      </div>

      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
        <FileText size={20} />
      </div>

      <h3 className="font-bold text-base text-slate-800 mb-3 truncate" title={doc.filename}>{doc.filename}</h3>

      <div className="space-y-1.5 border-t border-slate-50 pt-3">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Size</span>
          <span className="font-medium text-slate-700">{formatBytes(doc.size)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Uploaded</span>
          <span className="font-medium text-slate-700">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
