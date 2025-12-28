import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Trash2, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/admin/documents'),
        fetch('http://localhost:8000/admin/stats')
      ]);

      if (!docsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load data');
      }

      const docsData = await docsRes.json();
      const statsData = await statsRes.json();

      setDocuments(docsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to connect to backend. Make sure the server is running.');
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
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Reload data after successful deletion
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

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2 text-indigo-600">
              <FileText className="w-6 h-6" />
              <h1 className="text-xl font-bold">Document Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.total_documents}</p>
                </div>
                <FileText className="w-12 h-12 text-indigo-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Size</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.total_size_mb} MB</p>
                </div>
                <Download className="w-12 h-12 text-purple-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vector Store</p>
                  <p className="text-lg font-semibold text-green-600 mt-1">{stats.vector_store}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-300" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Documents List */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Uploaded Documents</h2>
            </div>

            {documents.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No documents uploaded yet</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <div
                    key={doc.filename}
                    className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                        <p className="text-sm text-gray-500">
                          {formatBytes(doc.size)} • Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.filename)}
                      disabled={deleting === doc.filename}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete document"
                    >
                      {deleting === doc.filename ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!loading && documents.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              Upload More Documents
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
            >
              Ask Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
