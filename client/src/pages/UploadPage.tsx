import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, Shield } from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    // Simulate API call
    setTimeout(() => {
        setUploading(false);
        setStatus('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
            >
                <ArrowLeft size={20} /> Back
            </button>
            <div className="flex items-center gap-2 font-bold text-indigo-600">
                <Shield size={24} />
                <span>DocGuard AI</span>
            </div>
        </div>

        <div className="p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Upload Document</h2>
          <p className="text-slate-500 mb-10">Make your PDFs searchable and interactive in seconds.</p>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); setFile(e.dataTransfer.files[0]); }}
            className={`
              relative group cursor-pointer border-3 border-dashed rounded-[32px] p-12 transition-all
              ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300'}
              ${file ? 'border-solid border-green-400 bg-green-50/30' : ''}
            `}
          >
            {!file ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Drag & Drop PDF</h3>
                <p className="text-slate-400 text-sm mb-6">or click to browse your files</p>
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                    Browse Files
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-6 text-left">
                <div className="bg-white p-4 rounded-2xl shadow-md text-indigo-500">
                    <FileText size={40} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 truncate max-w-[200px]">{file.name}</h4>
                    <p className="text-slate-400 text-sm">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                    className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                >
                    Remove
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && status === 'idle' && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {uploading ? 'Processing Document...' : 'Unlock Knowledge'}
            </button>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-[24px] flex items-center gap-4 text-left">
                <CheckCircle className="text-green-500 shrink-0" size={28} />
                <div>
                    <h4 className="font-bold text-green-900">Successfully Processed!</h4>
                    <p className="text-green-700 text-sm">Your document is now indexed and ready for questioning.</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;