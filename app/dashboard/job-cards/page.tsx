'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Plus,
  Loader2,
  Search,
  X,
  Edit,
  Trash2,
  User as UserIcon,
  CheckCircle2,
  Circle,
  ImageIcon,
  FileText,
  Clock
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import SignaturePad from '@/components/SignaturePad';

interface JobCard {
  _id: string;
  date: string;
  clientCompany: string;
  clientName: string;
  faultDescription: string;
  scopeOfWork: string;
  workCarriedOut: string;
  timeIn: string;
  timeOut: string;
  comments?: string;
  image?: string;
  clientSignature?: string;
  signedAt?: string;
  complete: boolean;
  technician: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface JobCardFormData {
  date: string;
  clientCompany: string;
  clientName: string;
  faultDescription: string;
  scopeOfWork: string;
  workCarriedOut: string;
  timeIn: string;
  timeOut: string;
  comments: string;
  image: string;
  clientSignature: string;
  signedAt?: string;
  complete: boolean;
  technician: string;
}

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

  const isAdmin = user?.role === 'admin';

  const [newJobCard, setNewJobCard] = useState<JobCardFormData>({
    date: '',
    clientCompany: '',
    clientName: '',
    faultDescription: '',
    scopeOfWork: '',
    workCarriedOut: '',
    timeIn: '',
    timeOut: '',
    comments: '',
    image: '',
    clientSignature: '',
    complete: false,
    technician: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchJobCards();
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchJobCards = async () => {
    try {
      const res = await fetch('/api/jobCards');
      const data = await res.json();
      if (data.success) {
        setJobCards(data.data);
      }
    } catch (error) {
      console.error('Error fetching job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body = {
        date: newJobCard.date,
        clientCompany: newJobCard.clientCompany,
        clientName: newJobCard.clientName,
        faultDescription: newJobCard.faultDescription,
        scopeOfWork: newJobCard.scopeOfWork,
        workCarriedOut: newJobCard.workCarriedOut,
        timeIn: newJobCard.timeIn,
        timeOut: newJobCard.timeOut,
        comments: newJobCard.comments,
        image: newJobCard.image,
        clientSignature: newJobCard.clientSignature,
        complete: newJobCard.complete,
        ...(isAdmin && newJobCard.technician ? { technician: newJobCard.technician } : {})
      };

      const res = await fetch('/api/jobCards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewJobCard({
          date: '',
          clientCompany: '',
          clientName: '',
          faultDescription: '',
          scopeOfWork: '',
          workCarriedOut: '',
          timeIn: '',
          timeOut: '',
          comments: '',
          image: '',
          clientSignature: '',
          complete: false,
          technician: ''
        });
        fetchJobCards();
      } else {
        alert(data.error || 'Failed to create job card');
      }
    } catch (error) {
      console.error('Error creating job card:', error);
    }
  };

  const handleEditJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobCard) return;

    try {
      const body = {
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
        ...(isAdmin && editingJobCard.technician?._id ? { technician: editingJobCard.technician._id } : {})
      };

      const res = await fetch(`/api/jobCards/${editingJobCard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingJobCard(null);
        fetchJobCards();
      } else {
        alert(data.error || 'Failed to update job card');
      }
    } catch (error) {
      console.error('Error updating job card:', error);
    }
  };

  const handleDeleteJobCard = async (jobCardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job card?')) return;

    try {
      const res = await fetch(`/api/jobCards/${jobCardId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete job card');
        } catch {
          alert('Failed to delete job card');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        fetchJobCards();
      } else {
        alert(data.error || 'Failed to delete job card');
      }
    } catch (error) {
      console.error('Error deleting job card:', error);
    }
  };

  const openEditModal = (jobCard: JobCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJobCard(jobCard);
    setShowEditModal(true);
  };

  const openViewModal = (jobCard: JobCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingJobCard(jobCard);
    setShowViewModal(true);
  };

  const filteredJobCards = jobCards
    .filter(jc => filter === 'all' || (filter === 'complete' ? jc.complete : !jc.complete))
    .filter(jc =>
      searchTerm === '' ||
      jc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.faultDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Job Cards</h1>
            <p className="text-gray-500 mt-1">Track and manage client job cards</p>
          </div>

          {(isAdmin || user?.role === 'technician') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Job Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search job cards by client, company, fault, or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'complete', label: 'Completed' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      {filteredJobCards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobCards.map((jobCard) => (
            <div
              key={jobCard._id}
              onClick={() => openViewModal(jobCard)}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-[140px]">{jobCard.clientName}</h3>
                    <p className="text-xs text-gray-500">{new Date(jobCard.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(isAdmin || user?._id === jobCard.technician?._id) && (
                    <>
                      <button
                        onClick={(e) => openEditModal(jobCard, e)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteJobCard(jobCard._id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${jobCard.complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {jobCard.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {jobCard.complete ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{jobCard.clientCompany}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{jobCard.timeIn} – {jobCard.timeOut}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>{jobCard.technician?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{jobCard.faultDescription}</span>
                </div>
                {jobCard.image && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Photo attached</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No job cards found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first job card to get started'}
          </p>
          {(isAdmin || user?.role === 'technician') && !searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Job Card
            </button>
          )}
        </div>
      )}

      {/* Create Job Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Job Card</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateJobCard} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newJobCard.date}
                    onChange={(e) => setNewJobCard({ ...newJobCard, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                  <input
                    type="time"
                    value={newJobCard.timeIn}
                    onChange={(e) => setNewJobCard({ ...newJobCard, timeIn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                  <input
                    type="time"
                    value={newJobCard.timeOut}
                    onChange={(e) => setNewJobCard({ ...newJobCard, timeOut: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                    <select
                      value={newJobCard.technician}
                      onChange={(e) => setNewJobCard({ ...newJobCard, technician: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Technician</option>
                      {users.filter(u => u.role === 'technician').map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Company</label>
                <input
                  type="text"
                  value={newJobCard.clientCompany}
                  onChange={(e) => setNewJobCard({ ...newJobCard, clientCompany: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Client company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newJobCard.clientName}
                  onChange={(e) => setNewJobCard({ ...newJobCard, clientName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Client contact name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fault Description</label>
                <textarea
                  value={newJobCard.faultDescription}
                  onChange={(e) => setNewJobCard({ ...newJobCard, faultDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the fault"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Work</label>
                <textarea
                  value={newJobCard.scopeOfWork}
                  onChange={(e) => setNewJobCard({ ...newJobCard, scopeOfWork: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the scope of work"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Carried Out</label>
                <textarea
                  value={newJobCard.workCarriedOut}
                  onChange={(e) => setNewJobCard({ ...newJobCard, workCarriedOut: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe work carried out"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={newJobCard.comments}
                  onChange={(e) => setNewJobCard({ ...newJobCard, comments: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional comments (optional)"
                  rows={2}
                />
              </div>

              <div>
                <ImageUpload
                  value={newJobCard.image}
                  onChange={(image) => setNewJobCard({ ...newJobCard, image })}
                  label="Image (Optional)"
                />
              </div>

               <div>
                 <SignaturePad
                   value={newJobCard.clientSignature}
                   onChange={(clientSignature) => setNewJobCard({ ...newJobCard, clientSignature })}
                   label="Client Signature (Optional)"
                 />
               </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="complete"
                  checked={newJobCard.complete}
                  onChange={(e) => setNewJobCard({ ...newJobCard, complete: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="complete" className="text-sm font-medium text-gray-700">
                  Mark as Complete
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Create Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Card Modal */}
      {showEditModal && editingJobCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Job Card</h2>
              <button onClick={() => { setShowEditModal(false); setEditingJobCard(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditJobCard} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingJobCard.date?.slice(0, 10) || ''}
                    onChange={(e) => setEditingJobCard({ ...editingJobCard, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                  <input
                    type="time"
                    value={editingJobCard.timeIn}
                    onChange={(e) => setEditingJobCard({ ...editingJobCard, timeIn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                  <input
                    type="time"
                    value={editingJobCard.timeOut}
                    onChange={(e) => setEditingJobCard({ ...editingJobCard, timeOut: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                    <select
                      value={editingJobCard.technician?._id || ''}
                      onChange={(e) => {
                        const tech = users.find(u => u._id === e.target.value);
                        if (tech) {
                          setEditingJobCard({ ...editingJobCard, technician: { _id: tech._id, name: tech.name, email: tech.email } });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Technician</option>
                      {users.filter(u => u.role === 'technician').map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Company</label>
                <input
                  type="text"
                  value={editingJobCard.clientCompany}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, clientCompany: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={editingJobCard.clientName}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, clientName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fault Description</label>
                <textarea
                  value={editingJobCard.faultDescription}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, faultDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Work</label>
                <textarea
                  value={editingJobCard.scopeOfWork}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, scopeOfWork: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Carried Out</label>
                <textarea
                  value={editingJobCard.workCarriedOut}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, workCarriedOut: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={editingJobCard.comments || ''}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, comments: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>

              <div>
                <ImageUpload
                  value={editingJobCard.image || ''}
                  onChange={(image) => setEditingJobCard({ ...editingJobCard, image })}
                  label="Image (Optional)"
                />
              </div>

               <div>
                 <SignaturePad
                   value={editingJobCard.clientSignature || ''}
                   onChange={(clientSignature) => setEditingJobCard({ ...editingJobCard, clientSignature })}
                   label="Client Signature (Optional)"
                 />
               </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-complete"
                  checked={editingJobCard.complete}
                  onChange={(e) => setEditingJobCard({ ...editingJobCard, complete: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="edit-complete" className="text-sm font-medium text-gray-700">
                  Mark as Complete
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingJobCard(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Card Modal */}
      {showViewModal && viewingJobCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Job Card Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewingJobCard(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="font-medium text-gray-900">{new Date(viewingJobCard.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Time</span>
                  <p className="font-medium text-gray-900">{viewingJobCard.timeIn} – {viewingJobCard.timeOut}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Client Company</span>
                  <p className="font-medium text-gray-900">{viewingJobCard.clientCompany}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Client Name</span>
                  <p className="font-medium text-gray-900">{viewingJobCard.clientName}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Fault Description</span>
                <p className="font-medium text-gray-900 mt-1">{viewingJobCard.faultDescription}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Scope of Work</span>
                <p className="font-medium text-gray-900 mt-1">{viewingJobCard.scopeOfWork}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Work Carried Out</span>
                <p className="font-medium text-gray-900 mt-1">{viewingJobCard.workCarriedOut}</p>
              </div>

              {viewingJobCard.comments && (
                <div>
                  <span className="text-sm text-gray-500">Comments</span>
                  <p className="font-medium text-gray-900 mt-1">{viewingJobCard.comments}</p>
                </div>
              )}

              {viewingJobCard.image && (
                <div>
                  <span className="text-sm text-gray-500">Image</span>
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewingJobCard.image}
                      alt="Job card image"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

               {viewingJobCard.clientSignature && (
                 <div>
                   <span className="text-sm text-gray-500">Client Signature</span>
                   <div className="mt-2">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                       src={viewingJobCard.clientSignature}
                       alt="Client signature"
                       className="max-w-full h-32 object-contain border border-gray-200 rounded-lg bg-white p-2"
                     />
                     {viewingJobCard.signedAt && (
                       <p className="text-xs text-gray-500 mt-1">
                         Signed on {new Date(viewingJobCard.signedAt).toLocaleDateString()}
                       </p>
                     )}
                   </div>
                 </div>
               )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Technician</span>
                  <p className="font-medium text-gray-900">{viewingJobCard.technician?.name || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${viewingJobCard.complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewingJobCard.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {viewingJobCard.complete ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); setViewingJobCard(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                {(isAdmin || user?._id === viewingJobCard.technician?._id) && (
                  <button
                    type="button"
                    onClick={(e) => { setShowViewModal(false); openEditModal(viewingJobCard, e); }}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
