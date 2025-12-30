import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgApi, Organization } from '../services/api';
import { Plus, Users, ArrowRight, Building, LogOut } from 'lucide-react';

const OrganizationSelectPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadOrgs();
        }
    }, [user]);

    const loadOrgs = async () => {
        try {
            const data = await orgApi.list();
            setOrgs(data);
        } catch (error) {
            console.error('Failed to load orgs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrgSelect = (orgId: string) => {
        navigate(`/app/${orgId}/dashboard`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="md:w-[600px] w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Your Organizations</h1>
                    <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="grid gap-4 mb-8">
                    {orgs.map((org) => (
                        <div
                            key={org.id}
                            onClick={() => handleOrgSelect(org.id)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-500 cursor-pointer transition-all flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${org.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{org.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                                        {org.role}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    ))}

                    {orgs.length === 0 && (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p>You haven't joined any organizations yet.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-all shadow-sm"
                    >
                        <Plus size={20} /> Create New
                    </button>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-all shadow-md"
                    >
                        <Users size={20} /> Join Existing
                    </button>
                </div>
            </div>

            {showCreateModal && (
                <CreateOrgModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(org) => {
                        setOrgs([...orgs, org]);
                        setShowCreateModal(false);
                    }}
                />
            )}

            {showJoinModal && (
                <JoinOrgModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={(org) => {
                        setOrgs([...orgs, org]);
                        setShowJoinModal(false);
                    }}
                />
            )}
        </div>
    );
};

const CreateOrgModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: (org: Organization) => void }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newOrg = await orgApi.create(name);
            onSuccess(newOrg);
        } catch (error) {
            alert('Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold mb-6">Create Organization</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Organization Name"
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg"
                        required
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const JoinOrgModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: (org: Organization) => void }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const newOrg = await orgApi.join(code);
            onSuccess(newOrg);
        } catch (err: any) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold mb-2">Join Organization</h2>
                <p className="text-slate-500 mb-6">Enter the 6-character code provided by your admin.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg uppercase tracking-widest text-center font-mono"
                        required
                        maxLength={6}
                    />
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? 'Joining...' : 'Join'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizationSelectPage;
