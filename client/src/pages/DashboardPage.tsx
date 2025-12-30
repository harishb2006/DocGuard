import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgApi } from '../services/api';
import {
    LayoutDashboard, MessageSquare, Upload, FileText,
    LogOut, ChevronRight, Menu, Shield
} from 'lucide-react';

const DashboardPage = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [org, setOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (orgId) {
            loadOrgDetails();
        }
    }, [orgId]);

    const loadOrgDetails = async () => {
        try {
            console.log("Fetching orgs for ID:", orgId);
            const orgs = await orgApi.list();
            console.log("Fetched orgs:", orgs);
            const currentOrg = orgs.find(o => o.id === orgId);
            if (currentOrg) {
                setOrg(currentOrg);
            } else {
                console.error("Org not found in list. Available:", orgs.map(o => o.id));
                // navigate('/orgs'); // DISABLED FOR DEBUGGING
            }
        } catch (error) {
            console.error("Failed to load org", error);
            // navigate('/orgs'); // DISABLED FOR DEBUGGING
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Organization {orgId}...</div>;
    if (!org) return <div className="p-10 text-red-500"><h1>Error: Organization Not Found</h1><p>Expected ID: {orgId}</p><p>Check Console for details.</p><button onClick={() => navigate('/orgs')}>Back to Orgs</button></div>;

    const isAdmin = org.role === 'ADMIN';

    const navItems = [
        { label: 'Chat & Q&A', path: `/app/${orgId}/chat`, icon: MessageSquare, allowed: true },
        { label: 'Documents', path: `/app/${orgId}/documents`, icon: FileText, allowed: isAdmin },
        { label: 'Upload', path: `/app/${orgId}/upload`, icon: Upload, allowed: isAdmin },
    ];

    return (
        <div className="flex min-h-screen bg-[#F0F2FF] font-sans">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-indigo-100 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col shadow-2xl md:shadow-none`}>
                <div className="p-8 border-b border-indigo-50">
                    <div className="flex items-center gap-3 text-slate-800 font-bold text-xl tracking-tight">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Shield size={20} />
                        </div>
                        RuleBook AI
                    </div>
                    <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Organization</div>
                        <div className="font-bold text-slate-800 truncate">{org.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                {org.role}
                            </span>
                            {isAdmin && org.code && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                                    Code: {org.code}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {navItems.filter(i => i.allowed).map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                                    }`}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                                {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-indigo-50 space-y-2">
                    <button
                        onClick={() => navigate('/orgs')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors font-medium text-sm"
                    >
                        <LayoutDashboard size={18} /> Switch Org
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-indigo-50 flex items-center justify-between px-8 sticky top-0 z-30">
                    <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="text-slate-400 text-sm font-medium hidden md:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-700">{user?.displayName || user?.email}</div>
                            <div className="text-xs text-slate-400">{user?.email}</div>
                        </div>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <Outlet context={{ org }} />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
