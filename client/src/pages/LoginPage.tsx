import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

const LoginPage = () => {
    const { loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            navigate('/orgs');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/orgs');
        } catch (err) {
            setError('Failed to log in. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#DDE2FF] flex items-center justify-center p-4">
            {/* Background Animated Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>

            <div className="max-w-md w-full bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10 transition-all hover:shadow-indigo-500/20">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-indigo-900/60 font-medium">
                        Sign in to access your secure documents
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border border-gray-200 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-6 h-6"
                        />
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-indigo-100">
                    <div className="flex justify-between text-xs text-indigo-900/50 uppercase tracking-wider font-semibold">
                        <div className="flex flex-col items-center gap-2">
                            <Lock className="w-5 h-5 opacity-70" />
                            <span>Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="w-5 h-5 opacity-70" />
                            <span>Smart RAG</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="w-5 h-5 opacity-70" />
                            <span>Reliable</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full">
                <p className="text-indigo-900/30 text-sm">© 2025 RuleBook AI. Enterprise Edition.</p>
            </div>
        </div>
    );
};

export default LoginPage;
