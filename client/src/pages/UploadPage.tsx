import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ArrowLeft, Loader2, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UploadPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleProcess = async () => {
    if (!file || !token) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('Upload success:', data);
      setStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload. Make sure backend is running on http://localhost:8000');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-5xl shadow-2xl border border-white overflow-hidden">

        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <ShieldCheck size={24} />
            <span>RuleBook Security</span>
          </div>
        </div>

        <div className="p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Ingest Policy Manual</h2>
          <p className="text-slate-500 mb-10">Upload corporate documents to be indexed into the Vector Database.</p>

          <div className={`relative border-3 border-dashed rounded-4xl p-12 transition-all ${file ? 'border-green-400 bg-green-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
            {!file ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-indigo-500 mb-6">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Select Corporate PDF</h3>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <span className="bg-black text-white px-8 py-3 rounded-2xl font-bold mt-4">Browse Files</span>
              </div>
            ) : (
              <div className="flex items-center gap-6 text-left">
                <FileText size={40} className="text-indigo-500" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{file.name}</h4>
                  <p className="text-slate-400 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button onClick={() => { setFile(null); setStatus('idle'); }} className="text-red-500 font-bold">Remove</button>
              </div>
            )}
          </div>

          {file && status === 'idle' && (
            <button onClick={handleProcess} disabled={uploading} className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-3xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {uploading ? <Loader2 className="animate-spin" /> : <Database size={20} />}
              {uploading ? 'Processing & Indexing Chunks...' : 'Ingest to RuleBook'}
            </button>
          )}

          {status === 'success' && (
            <>
              <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-4 text-left">
                <CheckCircle className="text-green-500 shrink-0" size={28} />
                <div>
                  <h4 className="font-bold text-green-900">Ingestion Complete!</h4>
                  <p className="text-green-700 text-sm">Document fragmented into semantic chunks and synced with Vector DB.</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Ask Questions Now
                </button>
                <button
                  onClick={() => { setFile(null); setStatus('idle'); }}
                  className="flex-1 bg-white text-slate-700 py-4 rounded-3xl font-bold hover:bg-slate-50 transition-all shadow-lg border-2 border-slate-200"
                >
                  Upload Another
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;