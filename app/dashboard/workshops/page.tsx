'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Wrench,
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
  FileText
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Workshop {
  _id: string;
  client: string;
  itemBookedIn: string;
  specs: string;
  faultOfItem: string;
  workScope: string;
  image?: string;
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

interface WorkshopFormData {
  client: string;
  itemBookedIn: string;
  specs: string;
  faultOfItem: string;
  workScope: string;
  image: string;
  complete: boolean;
  technician: string;
}

export default function WorkshopsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingWorkshop, setViewingWorkshop] = useState<Workshop | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';

  const [newWorkshop, setNewWorkshop] = useState<WorkshopFormData>({
    client: '',
    itemBookedIn: '',
    specs: '',
    faultOfItem: '',
    workScope: '',
    image: '',
    complete: false,
    technician: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchWorkshops();
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/workshops');
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.data);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
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

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body = {
        client: newWorkshop.client,
        itemBookedIn: newWorkshop.itemBookedIn,
        specs: newWorkshop.specs,
        faultOfItem: newWorkshop.faultOfItem,
        workScope: newWorkshop.workScope,
        image: newWorkshop.image,
        complete: newWorkshop.complete,
        ...(isAdmin && newWorkshop.technician ? { technician: newWorkshop.technician } : {})
      };

      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewWorkshop({
          client: '',
          itemBookedIn: '',
          specs: '',
          faultOfItem: '',
          workScope: '',
          image: '',
          complete: false,
          technician: ''
        });
        fetchWorkshops();
      } else {
        alert(data.error || 'Failed to create workshop item');
      }
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  };

  const handleEditWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;

    try {
      const body = {
        client: editingWorkshop.client,
        itemBookedIn: editingWorkshop.itemBookedIn,
        specs: editingWorkshop.specs,
        faultOfItem: editingWorkshop.faultOfItem,
        workScope: editingWorkshop.workScope,
        image: editingWorkshop.image,
        complete: editingWorkshop.complete,
        ...(isAdmin && editingWorkshop.technician?._id ? { technician: editingWorkshop.technician._id } : {})
      };

      const res = await fetch(`/api/workshops/${editingWorkshop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingWorkshop(null);
        fetchWorkshops();
      } else {
        alert(data.error || 'Failed to update workshop item');
      }
    } catch (error) {
      console.error('Error updating workshop:', error);
    }
  };

  const handleDeleteWorkshop = async (workshopId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workshop item?')) return;

    try {
      const res = await fetch(`/api/workshops/${workshopId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete workshop item');
        } catch {
          alert('Failed to delete workshop item');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        fetchWorkshops();
      } else {
        alert(data.error || 'Failed to delete workshop item');
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
    }
  };

  const openEditModal = (workshop: Workshop, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkshop(workshop);
    setShowEditModal(true);
  };

  const openViewModal = (workshop: Workshop, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingWorkshop(workshop);
    setShowViewModal(true);
  };

  const filteredWorkshops = workshops
    .filter(w => filter === 'all' || (filter === 'complete' ? w.complete : !w.complete))
    .filter(w =>
      searchTerm === '' ||
      w.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.itemBookedIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.faultOfItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

   if (loading || !user) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950">
         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
       </div>
     );
   }

  return (
    <>
       {/* Header */}
       <div className="mb-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Workshop</h1>
             <p className="text-slate-400 mt-1">Track and manage workshop repair items</p>
           </div>

           {(isAdmin || user?.role === 'technician') && (
             <button
               onClick={() => setShowModal(true)}
               className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
             >
               <Plus className="w-5 h-5" />
               <span>New Workshop Item</span>
             </button>
           )}
         </div>
       </div>

       {/* Search and Filters */}
       <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input
             type="text"
             placeholder="Search by client, item, fault, or technician..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500"
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
               className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                 filter === f.value
                   ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'
                   : 'glass text-slate-300 hover:bg-slate-800/50 border border-slate-700/50'
               }`}
             >
               {f.label}
             </button>
           ))}
         </div>
       </div>

      {/* Workshops Grid */}
      {filteredWorkshops.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredWorkshops.map((workshop) => (
             <div
               key={workshop._id}
               onClick={() => openViewModal(workshop)}
               className="glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all cursor-pointer"
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                     <Wrench className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-100 truncate max-w-[140px]">{workshop.itemBookedIn}</h3>
                     <p className="text-xs text-slate-400">{new Date(workshop.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-1">
                   {(isAdmin || user?._id === workshop.technician?._id) && (
                     <>
                       <button
                         onClick={(e) => openEditModal(workshop, e)}
                         className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-all"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={(e) => handleDeleteWorkshop(workshop._id, e)}
                         className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </>
                   )}
                   <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${workshop.complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                     {workshop.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                     {workshop.complete ? 'Completed' : 'Pending'}
                   </span>
                 </div>
               </div>

               <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span className="truncate">{workshop.client}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <FileText className="w-4 h-4 text-slate-400" />
                   <span className="truncate">{workshop.faultOfItem}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <Wrench className="w-4 h-4 text-slate-400" />
                   <span className="truncate">{workshop.workScope}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span>{workshop.technician?.name || 'Unassigned'}</span>
                 </div>
                 {workshop.image && (
                   <div className="flex items-center gap-2 text-slate-300">
                     <ImageIcon className="w-4 h-4 text-slate-400" />
                     <span className="text-xs text-slate-400">Photo attached</span>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
      ) : (
          <div className="text-center py-12">
           <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-slate-100 mb-2">No workshop items found</h3>
           <p className="text-slate-400 mb-4">
             {searchTerm ? 'Try a different search term' : 'Create your first workshop item to get started'}
           </p>
           {(isAdmin || user?.role === 'technician') && !searchTerm && (
             <button
               onClick={() => setShowModal(true)}
               className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
             >
               Create Workshop Item
             </button>
           )}
         </div>
      )}

       {/* Create Workshop Modal */}
       {showModal && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
           <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-100">Create New Workshop Item</h2>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
                 <X className="w-5 h-5 text-slate-400" />
               </button>
             </div>

            <form onSubmit={handleCreateWorkshop} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    value={newWorkshop.client}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, client: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Client name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Booked In</label>
                  <input
                    type="text"
                    value={newWorkshop.itemBookedIn}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, itemBookedIn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., MacBook Pro 2021"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specs</label>
                <textarea
                  value={newWorkshop.specs}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, specs: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Device specifications (CPU, RAM, storage, etc.)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fault Of Item</label>
                <textarea
                  value={newWorkshop.faultOfItem}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, faultOfItem: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the fault or issue"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Scope</label>
                <textarea
                  value={newWorkshop.workScope}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, workScope: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the work to be performed"
                  rows={3}
                  required
                />
              </div>

              <div>
                <ImageUpload
                  value={newWorkshop.image}
                  onChange={(image) => setNewWorkshop({ ...newWorkshop, image })}
                  label="Image (Optional)"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select
                    value={newWorkshop.technician}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, technician: e.target.value })}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="complete"
                  checked={newWorkshop.complete}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, complete: e.target.checked })}
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
                  Create Workshop Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workshop Modal */}
      {showEditModal && editingWorkshop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Workshop Item</h2>
              <button onClick={() => { setShowEditModal(false); setEditingWorkshop(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditWorkshop} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    value={editingWorkshop.client}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, client: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Booked In</label>
                  <input
                    type="text"
                    value={editingWorkshop.itemBookedIn}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, itemBookedIn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specs</label>
                <textarea
                  value={editingWorkshop.specs}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, specs: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fault Of Item</label>
                <textarea
                  value={editingWorkshop.faultOfItem}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, faultOfItem: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Scope</label>
                <textarea
                  value={editingWorkshop.workScope}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, workScope: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <ImageUpload
                  value={editingWorkshop.image || ''}
                  onChange={(image) => setEditingWorkshop({ ...editingWorkshop, image })}
                  label="Image (Optional)"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select
                    value={editingWorkshop.technician?._id || ''}
                    onChange={(e) => {
                      const tech = users.find(u => u._id === e.target.value);
                      if (tech) {
                        setEditingWorkshop({ ...editingWorkshop, technician: { _id: tech._id, name: tech.name, email: tech.email } });
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-complete"
                  checked={editingWorkshop.complete}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, complete: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="edit-complete" className="text-sm font-medium text-gray-700">
                  Mark as Complete
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingWorkshop(null); }}
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

      {/* View Workshop Modal */}
      {showViewModal && viewingWorkshop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Workshop Item Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewingWorkshop(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Client</span>
                  <p className="font-medium text-gray-900">{viewingWorkshop.client}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Item Booked In</span>
                  <p className="font-medium text-gray-900">{viewingWorkshop.itemBookedIn}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Specs</span>
                <p className="font-medium text-gray-900 mt-1">{viewingWorkshop.specs}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Fault Of Item</span>
                <p className="font-medium text-gray-900 mt-1">{viewingWorkshop.faultOfItem}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Work Scope</span>
                <p className="font-medium text-gray-900 mt-1">{viewingWorkshop.workScope}</p>
              </div>

              {viewingWorkshop.image && (
                <div>
                  <span className="text-sm text-gray-500">Image</span>
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewingWorkshop.image}
                      alt="Workshop item"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Technician</span>
                  <p className="font-medium text-gray-900">{viewingWorkshop.technician?.name || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${viewingWorkshop.complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewingWorkshop.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {viewingWorkshop.complete ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); setViewingWorkshop(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                {(isAdmin || user?._id === viewingWorkshop.technician?._id) && (
                  <button
                    type="button"
                    onClick={(e) => { setShowViewModal(false); openEditModal(viewingWorkshop, e); }}
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
