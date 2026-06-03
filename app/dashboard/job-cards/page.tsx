'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package, Plus, Loader2, Clock, CheckCircle2, Search, X, Edit, Trash2, User as UserIcon, ImageIcon, FileText, Circle } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import SignaturePad from '@/components/SignaturePad';

interface JobCard { _id: string; date: string; clientCompany: string; clientName: string; faultDescription: string; scopeOfWork: string; workCarriedOut: string; timeIn: string; timeOut: string; comments?: string; image?: string; clientSignature?: string; signedAt?: string; technician: { _id: string; name: string; email: string }; complete: boolean; createdAt: string; }

interface UserData { _id: string; name: string; email: string; role: string; }

interface JobCardFormData { date: string; clientCompany: string; clientName: string; faultDescription: string; scopeOfWork: string; workCarriedOut: string; timeIn: string; timeOut: string; comments: string; image: string; clientSignature: string; signedAt?: string; complete: boolean; technician: string; }

export default function JobCardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJobCard, setViewingJobCard] = useState<JobCard | null>(null);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newJobCard, setNewJobCard] = useState<JobCardFormData>({ date: '', clientCompany: '', clientName: '', faultDescription: '', scopeOfWork: '', workCarriedOut: '', timeIn: '', timeOut: '', comments: '', image: '', clientSignature: '', complete: false, technician: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) { fetchJobCards(); fetchUsers(); }
  }, [user, authLoading, router]);

  const fetchJobCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobCards', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      if (data.success) setJobCards(data.data);
    } catch (error) { console.error('Error fetching job cards:', error); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) { console.error('Error fetching users:', error); }
  };

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { date: newJobCard.date, clientCompany: newJobCard.clientCompany, clientName: newJobCard.clientName, faultDescription: newJobCard.faultDescription, scopeOfWork: newJobCard.scopeOfWork, workCarriedOut: newJobCard.workCarriedOut, timeIn: newJobCard.timeIn, timeOut: newJobCard.timeOut, comments: newJobCard.comments, image: newJobCard.image, clientSignature: newJobCard.clientSignature, complete: newJobCard.complete };
      if (newJobCard.technician) body.technician = newJobCard.technician;
      const res = await fetch('/api/jobCards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewJobCard({ date: '', clientCompany: '', clientName: '', faultDescription: '', scopeOfWork: '', workCarriedOut: '', timeIn: '', timeOut: '', comments: '', image: '', clientSignature: '', complete: false, technician: '' });
        fetchJobCards();
      } else {
        alert(data.error || 'Failed to create job card');
      }
    } catch (error) { console.error('Error creating job card:', error); alert('Failed to create job card'); }
  };

  const handleEditJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobCard) return;
    try {
      const body: any = {
        date: editingJobCard.date,
        clientCompany: editingJobCard.clientCompany,
        clientName: editingJobCard.clientName,
        faultDescription: editingJobCard.faultDescription,
        scopeOfWork: editingJobCard.scopeOfWork,
        workCarriedOut: editingJobCard.workCarriedOut,
        timeIn: editingJobCard.timeIn,
        timeOut: editingJobCard.timeOut,
        comments: editingJobCard.comments,
        image: editingJobCard.image,
        clientSignature: editingJobCard.clientSignature,
        complete: editingJobCard.complete,
        technician: editingJobCard.technician?._id || user?._id
      };
      const res = await fetch(`/api/jobCards/${editingJobCard._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingJobCard(null);
        fetchJobCards();
      } else {
        alert(data.error || 'Failed to update job card');
      }
    } catch (error) { console.error('Error updating job card:', error); alert('Failed to update job card'); }
  };

  const handleDeleteJobCard = async (jobCardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job card?')) return;
    try {
      const res = await fetch(`/api/jobCards/${jobCardId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { try { const err = await res.json(); alert(err.error || 'Failed to delete'); } catch { alert('Failed to delete'); } return; }
      fetchJobCards();
    } catch (error) { console.error('Error deleting job card:', error); }
  };

  const openEditModal = (jobCard: JobCard, e: React.MouseEvent) => { e.stopPropagation(); setEditingJobCard(jobCard); setShowEditModal(true); };
  const openViewModal = (jobCard: JobCard, e?: React.MouseEvent) => { if (e) e.stopPropagation(); setViewingJobCard(jobCard); setShowViewModal(true); };

  const filteredJobCards = jobCards
    .filter(jc => filter === 'all' || (filter === 'complete' ? jc.complete : !jc.complete))
    .filter(jc => searchTerm === '' || jc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || jc.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) || jc.faultDescription.toLowerCase().includes(searchTerm.toLowerCase()) || jc.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Job Cards</h1>
            <p className="text-slate-400 mt-1">Track and manage client job cards</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all">
            <Plus className="w-5 h-5" />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search job cards..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'complete', label: 'Completed' }].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value as typeof filter)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f.value ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' : 'glass text-slate-300 hover:bg-slate-800/50 border border-slate-700/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredJobCards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobCards.map((jobCard) => (
            <div key={jobCard._id} onClick={() => openViewModal(jobCard)} className="glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 truncate max-w-[140px]">{jobCard.clientName}</h3>
                    <p className="text-xs text-slate-400">{new Date(jobCard.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => openEditModal(jobCard, e)} className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDeleteJobCard(jobCard._id, e)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300"><UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="truncate">{jobCard.clientCompany}</span></div>
                <div className="flex items-center gap-2 text-slate-300"><Clock className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{jobCard.timeIn} – {jobCard.timeOut}</span></div>
                <div className="flex items-center gap-2 text-slate-300"><UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{jobCard.technician?.name || 'Unassigned'}</span></div>
                <div className="flex items-center gap-2 text-slate-300"><FileText className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="truncate">{jobCard.faultDescription}</span></div>
                {jobCard.image && <div className="flex items-center gap-2 text-slate-300"><ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="text-xs text-slate-400">Photo attached</span></div>}
              </div>
              <div className="mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${jobCard.complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {jobCard.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  {jobCard.complete ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">No job cards found</h3>
          <p className="text-slate-400 mb-4">{searchTerm ? 'Try a different search term' : 'Create your first job card to get started'}</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all">Create Job Card</button>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Create New Job Card</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateJobCard} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                  <input type="date" value={newJobCard.date} onChange={(e) => setNewJobCard({ ...newJobCard, date: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Technician</label>
                  <select value={newJobCard.technician} onChange={(e) => setNewJobCard({ ...newJobCard, technician: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100">
                    <option value="">Assign to me ({user?.name})</option>
                    {users.filter(u => u.role === 'technician').map((u) => (<option key={u._id} value={u._id}>{u.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time In *</label>
                  <input type="time" value={newJobCard.timeIn} onChange={(e) => setNewJobCard({ ...newJobCard, timeIn: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time Out *</label>
                  <input type="time" value={newJobCard.timeOut} onChange={(e) => setNewJobCard({ ...newJobCard, timeOut: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client Company *</label>
                <input type="text" value={newJobCard.clientCompany} onChange={(e) => setNewJobCard({ ...newJobCard, clientCompany: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Client company name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client Name *</label>
                <input type="text" value={newJobCard.clientName} onChange={(e) => setNewJobCard({ ...newJobCard, clientName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Client contact name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fault Description *</label>
                <textarea value={newJobCard.faultDescription} onChange={(e) => setNewJobCard({ ...newJobCard, faultDescription: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Describe the fault" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Scope of Work *</label>
                <textarea value={newJobCard.scopeOfWork} onChange={(e) => setNewJobCard({ ...newJobCard, scopeOfWork: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Describe the scope of work" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Work Carried Out *</label>
                <textarea value={newJobCard.workCarriedOut} onChange={(e) => setNewJobCard({ ...newJobCard, workCarriedOut: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Describe work carried out" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Comments</label>
                <textarea value={newJobCard.comments} onChange={(e) => setNewJobCard({ ...newJobCard, comments: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" placeholder="Additional comments (optional)" rows={2} />
              </div>
              <div>
                <ImageUpload value={newJobCard.image} onChange={(image) => setNewJobCard({ ...newJobCard, image })} label="Image (Optional)" />
              </div>
              <div>
                <SignaturePad value={newJobCard.clientSignature} onChange={(clientSignature) => setNewJobCard({ ...newJobCard, clientSignature })} label="Client Signature (Optional)" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="complete" checked={newJobCard.complete} onChange={(e) => setNewJobCard({ ...newJobCard, complete: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500" />
                <label htmlFor="complete" className="text-sm font-medium text-slate-300">Mark as Complete</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all">Create Job Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingJobCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Edit Job Card</h2>
              <button onClick={() => { setShowEditModal(false); setEditingJobCard(null); }} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleEditJobCard} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                  <input type="date" value={editingJobCard.date?.slice(0, 10) || ''} onChange={(e) => setEditingJobCard({ ...editingJobCard, date: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Technician</label>
                  <select value={editingJobCard.technician?._id || ''} onChange={(e) => {
                    if (e.target.value) {
                      const tech = users.find(u => u._id === e.target.value);
                      if (tech) setEditingJobCard({ ...editingJobCard, technician: { _id: tech._id, name: tech.name, email: tech.email } });
                    } else {
                      setEditingJobCard({ ...editingJobCard, technician: { _id: user?._id || '', name: user?.name || 'Me', email: user?.email || '' } });
                    }
                  }} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100">
                    <option value="">Assign to me ({user?.name || 'current user'})</option>
                    {users.filter(u => u.role === 'technician').map((u) => (<option key={u._id} value={u._id}>{u.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time In *</label>
                  <input type="time" value={editingJobCard.timeIn} onChange={(e) => setEditingJobCard({ ...editingJobCard, timeIn: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time Out *</label>
                  <input type="time" value={editingJobCard.timeOut} onChange={(e) => setEditingJobCard({ ...editingJobCard, timeOut: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client Company *</label>
                <input type="text" value={editingJobCard.clientCompany} onChange={(e) => setEditingJobCard({ ...editingJobCard, clientCompany: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client Name *</label>
                <input type="text" value={editingJobCard.clientName} onChange={(e) => setEditingJobCard({ ...editingJobCard, clientName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fault Description *</label>
                <textarea value={editingJobCard.faultDescription} onChange={(e) => setEditingJobCard({ ...editingJobCard, faultDescription: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Scope of Work *</label>
                <textarea value={editingJobCard.scopeOfWork} onChange={(e) => setEditingJobCard({ ...editingJobCard, scopeOfWork: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Work Carried Out *</label>
                <textarea value={editingJobCard.workCarriedOut} onChange={(e) => setEditingJobCard({ ...editingJobCard, workCarriedOut: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Comments</label>
                <textarea value={editingJobCard.comments || ''} onChange={(e) => setEditingJobCard({ ...editingJobCard, comments: e.target.value })} className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100" rows={2} />
              </div>
              <div>
                <ImageUpload value={editingJobCard.image || ''} onChange={(image) => setEditingJobCard({ ...editingJobCard, image })} label="Image (Optional)" />
              </div>
              <div>
                <SignaturePad value={editingJobCard.clientSignature || ''} onChange={(sig) => setEditingJobCard({ ...editingJobCard, clientSignature: sig })} label="Client Signature (Optional)" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-complete" checked={editingJobCard.complete} onChange={(e) => setEditingJobCard({ ...editingJobCard, complete: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500" />
                <label htmlFor="edit-complete" className="text-sm font-medium text-slate-300">Mark as Complete</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingJobCard(null); }} className="flex-1 px-4 py-2.5 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingJobCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Job Card Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewingJobCard(null); }} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-slate-500">Date</span><p className="font-medium text-slate-100">{new Date(viewingJobCard.date).toLocaleDateString()}</p></div>
                <div><span className="text-sm text-slate-500">Time</span><p className="font-medium text-slate-100">{viewingJobCard.timeIn} – {viewingJobCard.timeOut}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-slate-500">Client Company</span><p className="font-medium text-slate-100">{viewingJobCard.clientCompany}</p></div>
                <div><span className="text-sm text-slate-500">Client Name</span><p className="font-medium text-slate-100">{viewingJobCard.clientName}</p></div>
              </div>
              <div><span className="text-sm text-slate-500">Technician</span><p className="font-medium text-slate-100">{viewingJobCard.technician?.name || 'Unassigned'}</p></div>
              <div><span className="text-sm text-slate-500">Fault Description</span><p className="font-medium text-slate-100 mt-1">{viewingJobCard.faultDescription}</p></div>
              <div><span className="text-sm text-slate-500">Scope of Work</span><p className="font-medium text-slate-100 mt-1">{viewingJobCard.scopeOfWork}</p></div>
              <div><span className="text-sm text-slate-500">Work Carried Out</span><p className="font-medium text-slate-100 mt-1">{viewingJobCard.workCarriedOut}</p></div>
              {viewingJobCard.comments && <div><span className="text-sm text-slate-500">Comments</span><p className="font-medium text-slate-100 mt-1">{viewingJobCard.comments}</p></div>}
              {viewingJobCard.image && <div><span className="text-sm text-slate-500">Image</span><div className="mt-2"><img src={viewingJobCard.image} alt="Job card" className="max-w-full h-auto rounded-lg border border-slate-700" /></div></div>}
              {viewingJobCard.clientSignature && <div><span className="text-sm text-slate-500">Client Signature</span><img src={viewingJobCard.clientSignature} alt="Signature" className="mt-2 max-w-full h-32 object-contain border border-slate-700 rounded-lg bg-white p-2" /></div>}
              <div><span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${viewingJobCard.complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{viewingJobCard.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}{viewingJobCard.complete ? 'Completed' : 'Pending'}</span></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowViewModal(false); setViewingJobCard(null); }} className="flex-1 px-4 py-2.5 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-all">Close</button>
                <button type="button" onClick={(e) => { setShowViewModal(false); openEditModal(viewingJobCard, e); }} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all">Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}