'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Fuel,
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
  Droplets
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface FuelManagement {
  _id: string;
  date: string;
  vehicle: string;
  mileage: number;
  amountFilled: number;
  litresFilled: number;
  garage: string;
  kmDone: number;
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

interface FuelFormData {
  date: string;
  vehicle: string;
  mileage: number;
  amountFilled: number;
  litresFilled: number;
  garage: string;
  kmDone: number;
  image: string;
  complete: boolean;
  technician: string;
}

export default function FuelManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fuelRecords, setFuelRecords] = useState<FuelManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingFuel, setViewingFuel] = useState<FuelManagement | null>(null);
  const [editingFuel, setEditingFuel] = useState<FuelManagement | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newFuel, setNewFuel] = useState<FuelFormData>({
    date: '',
    vehicle: '',
    mileage: 0,
    amountFilled: 0,
    litresFilled: 0,
    garage: '',
    kmDone: 0,
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
      fetchFuelRecords();
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchFuelRecords = async () => {
    try {
      const res = await fetch('/api/fuel-management', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      if (data.success) setFuelRecords(data.data);
    } catch (error) {
      console.error('Error fetching fuel records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const body = {
          date: newFuel.date,
          vehicle: newFuel.vehicle,
          mileage: newFuel.mileage,
          amountFilled: newFuel.amountFilled,
          litresFilled: newFuel.litresFilled,
          garage: newFuel.garage,
          kmDone: newFuel.kmDone,
          image: newFuel.image,
          complete: newFuel.complete,
          technician: newFuel.technician
        };

      const res = await fetch('/api/fuel-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewFuel({
          date: '',
          vehicle: '',
          mileage: 0,
          amountFilled: 0,
          litresFilled: 0,
          garage: '',
          kmDone: 0,
          image: '',
          complete: false,
          technician: ''
        });
        fetchFuelRecords();
      } else {
        alert(data.error || 'Failed to create fuel record');
      }
    } catch (error) {
      console.error('Error creating fuel record:', error);
    }
  };

  const handleEditFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFuel) return;

    try {
        const body = {
          date: editingFuel.date,
          vehicle: editingFuel.vehicle,
          mileage: editingFuel.mileage,
          amountFilled: editingFuel.amountFilled,
          litresFilled: editingFuel.litresFilled,
          garage: editingFuel.garage,
          kmDone: editingFuel.kmDone,
          image: editingFuel.image,
          complete: editingFuel.complete,
          technician: editingFuel.technician._id
        };

      const res = await fetch(`/api/fuel-management/${editingFuel._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingFuel(null);
        fetchFuelRecords();
      } else {
        alert(data.error || 'Failed to update fuel record');
      }
    } catch (error) {
      console.error('Error updating fuel record:', error);
    }
  };

  const handleDeleteFuel = async (fuelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this fuel record?')) return;

    try {
      const res = await fetch(`/api/fuel-management/${fuelId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete fuel record');
        } catch {
          alert('Failed to delete fuel record');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        fetchFuelRecords();
      } else {
        alert(data.error || 'Failed to delete fuel record');
      }
    } catch (error) {
      console.error('Error deleting fuel record:', error);
    }
  };

  const openEditModal = (fuel: FuelManagement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFuel(fuel);
    setShowEditModal(true);
  };

  const openViewModal = (fuel: FuelManagement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingFuel(fuel);
    setShowViewModal(true);
  };

  const filteredFuelRecords = fuelRecords
    .filter(f => filter === 'all' || (filter === 'complete' ? f.complete : !f.complete))
    .filter(f =>
      searchTerm === '' ||
      f.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.garage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
             <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Fuel Management</h1>
             <p className="text-slate-400 mt-1">Track and manage vehicle fuel consumption</p>
           </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Fuel Record</span>
            </button>
         </div>
       </div>

       {/* Search and Filters */}
       <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input
             type="text"
             placeholder="Search by vehicle, garage, or technician..."
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

      {/* Fuel Records Grid */}
      {filteredFuelRecords.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredFuelRecords.map((fuel) => (
             <div
               key={fuel._id}
               onClick={() => openViewModal(fuel)}
               className="glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all cursor-pointer"
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                     <Fuel className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-100 truncate max-w-[140px]">{fuel.vehicle}</h3>
                     <p className="text-xs text-slate-400">{new Date(fuel.date).toLocaleDateString()}</p>
                   </div>
                  </div>
                   <div className="flex items-center gap-1">
                     <button
                       onClick={(e) => openEditModal(fuel, e)}
                       className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-all"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     <button
                       onClick={(e) => handleDeleteFuel(fuel._id, e)}
                       className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>

               <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-slate-300">
                   <FileText className="w-4 h-4 text-slate-400" />
                   <span>Mileage: {fuel.mileage.toLocaleString()} km</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <Droplets className="w-4 h-4 text-slate-400" />
                   <span>{fuel.litresFilled} L @ R {fuel.amountFilled.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <Fuel className="w-4 h-4 text-slate-400" />
                   <span>Km Done: {fuel.kmDone.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span>{fuel.garage}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span>{fuel.technician?.name || 'Unassigned'}</span>
                 </div>
                 {fuel.image && (
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
           <Fuel className="w-16 h-16 text-slate-400 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-slate-100 mb-2">No fuel records found</h3>
           <p className="text-slate-400 mb-4">
             {searchTerm ? 'Try a different search term' : 'Create your first fuel record to get started'}
           </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
              >
                Create Fuel Record
              </button>
            )}
         </div>
      )}

       {/* Create Fuel Record Modal */}
       {showModal && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
           <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-100">Create New Fuel Record</h2>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
                 <X className="w-5 h-5 text-slate-400" />
               </button>
             </div>

             <form onSubmit={handleCreateFuel} className="p-4 md:p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                   <input
                     type="date"
                     value={newFuel.date}
                     onChange={(e) => setNewFuel({ ...newFuel, date: e.target.value })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle</label>
                   <input
                     type="text"
                     value={newFuel.vehicle}
                     onChange={(e) => setNewFuel({ ...newFuel, vehicle: e.target.value })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     placeholder="e.g., Van 1, Truck 2"
                     required
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Mileage (km)</label>
                   <input
                     type="number"
                     value={newFuel.mileage}
                     onChange={(e) => setNewFuel({ ...newFuel, mileage: parseFloat(e.target.value) || 0 })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     required
                     min="0"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Km Done</label>
                   <input
                     type="number"
                     value={newFuel.kmDone}
                     onChange={(e) => setNewFuel({ ...newFuel, kmDone: parseFloat(e.target.value) || 0 })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     required
                     min="0"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Amount Filled (R)</label>
                   <input
                     type="number"
                     value={newFuel.amountFilled}
                     onChange={(e) => setNewFuel({ ...newFuel, amountFilled: parseFloat(e.target.value) || 0 })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     required
                     min="0"
                     step="0.01"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Litres Filled</label>
                   <input
                     type="number"
                     value={newFuel.litresFilled}
                     onChange={(e) => setNewFuel({ ...newFuel, litresFilled: parseFloat(e.target.value) || 0 })}
                     className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                     required
                     min="0"
                     step="0.01"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Garage / Station</label>
                 <input
                   type="text"
                   value={newFuel.garage}
                   onChange={(e) => setNewFuel({ ...newFuel, garage: e.target.value })}
                   className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                   placeholder="Garage or fuel station name"
                   required
                 />
               </div>

                <div>
                  <ImageUpload
                    value={newFuel.image}
                    onChange={(image) => setNewFuel({ ...newFuel, image })}
                    label="Image (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Technician</label>
                  <select
                    value={newFuel.technician}
                    onChange={(e) => setNewFuel({ ...newFuel, technician: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100"
                    required
                  >
                    <option value="">Select Technician</option>
                    {users.filter(u => u.role === 'technician').map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>

               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="complete"
                   checked={newFuel.complete}
                   onChange={(e) => setNewFuel({ ...newFuel, complete: e.target.checked })}
                   className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
                 />
                 <label htmlFor="complete" className="text-sm font-medium text-slate-300">
                   Mark as Complete
                 </label>
               </div>

               <div className="flex gap-3 pt-4">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="flex-1 px-4 py-2.5 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-all"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
                 >
                   Create Fuel Record
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

      {/* Edit Fuel Record Modal */}
      {showEditModal && editingFuel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Fuel Record</h2>
              <button onClick={() => { setShowEditModal(false); setEditingFuel(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditFuel} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingFuel.date?.slice(0, 10) || ''}
                    onChange={(e) => setEditingFuel({ ...editingFuel, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={editingFuel.vehicle}
                    onChange={(e) => setEditingFuel({ ...editingFuel, vehicle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={editingFuel.mileage}
                    onChange={(e) => setEditingFuel({ ...editingFuel, mileage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Km Done</label>
                  <input
                    type="number"
                    value={editingFuel.kmDone}
                    onChange={(e) => setEditingFuel({ ...editingFuel, kmDone: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Filled (R)</label>
                  <input
                    type="number"
                    value={editingFuel.amountFilled}
                    onChange={(e) => setEditingFuel({ ...editingFuel, amountFilled: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Litres Filled</label>
                  <input
                    type="number"
                    value={editingFuel.litresFilled}
                    onChange={(e) => setEditingFuel({ ...editingFuel, litresFilled: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Garage / Station</label>
                <input
                  type="text"
                  value={editingFuel.garage}
                  onChange={(e) => setEditingFuel({ ...editingFuel, garage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

               <div>
                 <ImageUpload
                   value={editingFuel.image || ''}
                   onChange={(image) => setEditingFuel({ ...editingFuel, image })}
                   label="Image (Optional)"
                 />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select
                    value={editingFuel.technician?._id || ''}
                    onChange={(e) => {
                      const tech = users.find(u => u._id === e.target.value);
                      if (tech) {
                        setEditingFuel({ ...editingFuel, technician: { _id: tech._id, name: tech.name, email: tech.email } });
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-complete"
                  checked={editingFuel.complete}
                  onChange={(e) => setEditingFuel({ ...editingFuel, complete: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="edit-complete" className="text-sm font-medium text-gray-700">
                  Mark as Complete
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingFuel(null); }}
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

      {/* View Fuel Record Modal */}
      {showViewModal && viewingFuel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Fuel Record Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewingFuel(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="font-medium text-gray-900">{new Date(viewingFuel.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Vehicle</span>
                  <p className="font-medium text-gray-900">{viewingFuel.vehicle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Mileage</span>
                  <p className="font-medium text-gray-900">{viewingFuel.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Km Done</span>
                  <p className="font-medium text-gray-900">{viewingFuel.kmDone.toLocaleString()} km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Amount Filled</span>
                  <p className="font-medium text-gray-900">R {viewingFuel.amountFilled.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Litres Filled</span>
                  <p className="font-medium text-gray-900">{viewingFuel.litresFilled} L</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Garage / Station</span>
                <p className="font-medium text-gray-900 mt-1">{viewingFuel.garage}</p>
              </div>

              {viewingFuel.image && (
                <div>
                  <span className="text-sm text-gray-500">Image</span>
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewingFuel.image}
                      alt="Fuel record"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Technician</span>
                  <p className="font-medium text-gray-900">{viewingFuel.technician?.name || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${viewingFuel.complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewingFuel.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {viewingFuel.complete ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); setViewingFuel(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                 <button
                   type="button"
                   onClick={(e) => { setShowViewModal(false); openEditModal(viewingFuel, e); }}
                   className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                 >
                   Edit
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
