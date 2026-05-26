'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import SignaturePad from '@/components/SignaturePad';
import {
  Truck,
  Plus,
  Loader2,
  Search,
  X,
  Edit,
  Trash2,
  MapPin,
  User as UserIcon,
  Package,
  CheckCircle2,
  Circle,
  ImageIcon
} from 'lucide-react';

interface DeliveryItem {
  item: string;
  quantity: number;
}

interface Delivery {
  _id: string;
  date: string;
  client: string;
  location: string;
  technician: { _id: string; name: string; email: string };
  items: DeliveryItem[];
  receivedBy: string;
  clientSignature?: string;
  signedAt?: string;
  image?: string;
  complete: boolean;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newDelivery, setNewDelivery] = useState({
    date: '',
    client: '',
    location: '',
    technician: '',
    items: [{ item: '', quantity: 1 }] as DeliveryItem[],
    receivedBy: '',
    clientSignature: '',
    image: '',
    complete: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDeliveries();
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/deliveries');
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
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

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDelivery,
          image: newDelivery.image || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewDelivery({
          date: '',
          client: '',
          location: '',
          technician: '',
          items: [{ item: '', quantity: 1 }],
          receivedBy: '',
          clientSignature: '',
          image: '',
          complete: false
        });
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to create delivery');
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
    }
  };

  const handleEditDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDelivery) return;

    try {
      const res = await fetch(`/api/deliveries/${editingDelivery._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingDelivery.date,
          client: editingDelivery.client,
          location: editingDelivery.location,
          technician: editingDelivery.technician._id,
          items: editingDelivery.items,
          receivedBy: editingDelivery.receivedBy,
          clientSignature: editingDelivery.clientSignature,
          image: editingDelivery.image || undefined,
          complete: editingDelivery.complete
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingDelivery(null);
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to update delivery');
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
    }
  };

  const handleDeleteDelivery = async (deliveryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete delivery');
        } catch {
          alert('Failed to delete delivery');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to delete delivery');
      }
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const openEditModal = (delivery: Delivery, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDelivery(delivery);
    setShowEditModal(true);
  };

  const openViewModal = (delivery: Delivery, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingDelivery(delivery);
    setShowViewModal(true);
  };

  const addItemField = () => {
    setNewDelivery(prev => ({
      ...prev,
      items: [...prev.items, { item: '', quantity: 1 }]
    }));
  };

  const removeItemField = (index: number) => {
    setNewDelivery(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: 'item' | 'quantity', value: string | number) => {
    setNewDelivery(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const updateEditItem = (index: number, field: 'item' | 'quantity', value: string | number) => {
    if (!editingDelivery) return;
    const newItems = [...editingDelivery.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingDelivery({ ...editingDelivery, items: newItems });
  };

  const addEditItemField = () => {
    setEditingDelivery(prev => prev ? {
      ...prev,
      items: [...prev.items, { item: '', quantity: 1 }]
    } : null);
  };

  const removeEditItemField = (index: number) => {
    setEditingDelivery(prev => prev ? {
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    } : null);
  };

  const filteredDeliveries = deliveries
    .filter(d => filter === 'all' || (filter === 'complete' ? d.complete : !d.complete))
    .filter(d =>
      searchTerm === '' ||
      d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

   if (loading || !user) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950">
         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
       </div>
     );
   }

  const isAdmin = user.role === 'admin';

  return (
    <>
       {/* Header */}
       <div className="mb-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Deliveries</h1>
             <p className="text-slate-400 mt-1">Track and manage client deliveries</p>
           </div>

           {(isAdmin || user?.role === 'technician') && (
             <button
               onClick={() => setShowModal(true)}
               className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
             >
               <Plus className="w-5 h-5" />
               <span>New Delivery</span>
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
             placeholder="Search deliveries by client or location..."
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

      {/* Deliveries Grid */}
      {filteredDeliveries.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredDeliveries.map((delivery) => (
             <div
               key={delivery._id}
               onClick={() => openViewModal(delivery)}
               className="glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all cursor-pointer"
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                     <Truck className="w-5 h-5 text-blue-500" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-100 truncate max-w-[120px]">{delivery.client}</h3>
                     <p className="text-xs text-slate-400">{new Date(delivery.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-1">
                   {(isAdmin || user?._id === delivery.technician?._id) && (
                     <>
                       <button
                         onClick={(e) => openEditModal(delivery, e)}
                         className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-all"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={(e) => handleDeleteDelivery(delivery._id, e)}
                         className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </>
                   )}
                   <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${delivery.complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                     {delivery.complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                     {delivery.complete ? 'Completed' : 'Pending'}
                   </span>
                 </div>
               </div>

               <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-slate-300">
                   <MapPin className="w-4 h-4 text-slate-400" />
                   <span className="truncate">{delivery.location}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span>{delivery.technician?.name || 'Unassigned'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <Package className="w-4 h-4 text-slate-400" />
                   <span>{delivery.items.length} item(s)</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-300">
                   <UserIcon className="w-4 h-4 text-slate-400" />
                   <span>Received by: {delivery.receivedBy}</span>
                 </div>
                 {delivery.image && (
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
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first delivery to get started'}
          </p>
          {(isAdmin || user?.role === 'technician') && !searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Delivery
            </button>
          )}
        </div>
      )}

       {/* Create Delivery Modal */}
       {showModal && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
             <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-100">Create New Delivery</h2>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleCreateDelivery} className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                   <input
                     type="date"
                     value={newDelivery.date}
                     onChange={(e) => setNewDelivery({ ...newDelivery, date: e.target.value })}
                     className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     required
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                 <input
                   type="text"
                   value={newDelivery.client}
                   onChange={(e) => setNewDelivery({ ...newDelivery, client: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                 <input
                   type="text"
                   value={newDelivery.location}
                   onChange={(e) => setNewDelivery({ ...newDelivery, location: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Technician</label>
                 <select
                   value={newDelivery.technician}
                   onChange={(e) => setNewDelivery({ ...newDelivery, technician: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 >
                   <option value="" className="bg-slate-800">Select Technician</option>
                   {users.filter(u => u.role === 'technician').map((u) => (
                     <option key={u._id} value={u._id} className="bg-slate-800">{u.name}</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Items</label>
                 {newDelivery.items.map((item, index) => (
                   <div key={index} className="flex gap-2 mb-2">
                     <input
                       type="text"
                       placeholder="Item name"
                       value={item.item}
                       onChange={(e) => updateItem(index, 'item', e.target.value)}
                       className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                       required
                     />
                     <input
                       type="number"
                       placeholder="Qty"
                       min="1"
                       value={item.quantity}
                       onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                       className="w-20 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                       required
                     />
                     {newDelivery.items.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeItemField(index)}
                         className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                     )}
                   </div>
                 ))}
                 <button
                   type="button"
                   onClick={addItemField}
                   className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                 >
                   <Plus className="w-4 h-4" /> Add Item
                 </button>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Received By</label>
                 <input
                   type="text"
                   value={newDelivery.receivedBy}
                   onChange={(e) => setNewDelivery({ ...newDelivery, receivedBy: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <SignaturePad
                   value={newDelivery.clientSignature || ''}
                   onChange={(clientSignature) => setNewDelivery({ ...newDelivery, clientSignature })}
                   label="Client Signature (Optional)"
                 />
               </div>

               <div>
                 <ImageUpload
                   value={newDelivery.image}
                   onChange={(image) => setNewDelivery({ ...newDelivery, image })}
                   label="Image (Optional)"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="complete"
                   checked={newDelivery.complete}
                   onChange={(e) => setNewDelivery({ ...newDelivery, complete: e.target.checked })}
                   className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
                 />
                 <label htmlFor="complete" className="text-sm font-medium text-slate-300">
                   Mark as Complete
                 </label>
               </div>

               <div className="flex gap-3 pt-5">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="flex-1 px-4 py-3 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
                 >
                   Create Delivery
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Edit Delivery Modal */}
       {showEditModal && editingDelivery && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
             <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-100">Edit Delivery</h2>
               <button onClick={() => { setShowEditModal(false); setEditingDelivery(null); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <form onSubmit={handleEditDelivery} className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                   <input
                     type="date"
                     value={editingDelivery.date?.slice(0, 10) || ''}
                     onChange={(e) => setEditingDelivery({ ...editingDelivery, date: e.target.value })}
                     className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     required
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                 <input
                   type="text"
                   value={editingDelivery.client}
                   onChange={(e) => setEditingDelivery({ ...editingDelivery, client: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                 <input
                   type="text"
                   value={editingDelivery.location}
                   onChange={(e) => setEditingDelivery({ ...editingDelivery, location: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Technician</label>
                 <select
                   value={editingDelivery.technician?._id || ''}
                   onChange={(e) => {
                     const tech = users.find(u => u._id === e.target.value);
                     if (tech) {
                       setEditingDelivery({ ...editingDelivery, technician: { _id: tech._id, name: tech.name, email: tech.email } });
                     }
                   }}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 >
                   <option value="" className="bg-slate-800">Select Technician</option>
                   {users.filter(u => u.role === 'technician').map((u) => (
                     <option key={u._id} value={u._id} className="bg-slate-800">{u.name}</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Items</label>
                 {editingDelivery.items.map((item, index) => (
                   <div key={index} className="flex gap-2 mb-2">
                     <input
                       type="text"
                       placeholder="Item name"
                       value={item.item}
                       onChange={(e) => updateEditItem(index, 'item', e.target.value)}
                       className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                       required
                     />
                     <input
                       type="number"
                       placeholder="Qty"
                       min="1"
                       value={item.quantity}
                       onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                       className="w-20 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                       required
                     />
                     {editingDelivery.items.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeEditItemField(index)}
                         className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                     )}
                   </div>
                 ))}
                 <button
                   type="button"
                   onClick={addEditItemField}
                   className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                 >
                   <Plus className="w-4 h-4" /> Add Item
                 </button>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Received By</label>
                 <input
                   type="text"
                   value={editingDelivery.receivedBy}
                   onChange={(e) => setEditingDelivery({ ...editingDelivery, receivedBy: e.target.value })}
                   className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   required
                 />
               </div>

               <div>
                 <SignaturePad
                   value={editingDelivery.clientSignature || ''}
                   onChange={(clientSignature) => setEditingDelivery({ ...editingDelivery, clientSignature })}
                   label="Client Signature (Optional)"
                 />
               </div>

               <div>
                 <ImageUpload
                   value={editingDelivery.image || ''}
                   onChange={(image) => setEditingDelivery({ ...editingDelivery, image })}
                   label="Image (Optional)"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="edit-complete"
                   checked={editingDelivery.complete}
                   onChange={(e) => setEditingDelivery({ ...editingDelivery, complete: e.target.checked })}
                   className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
                 />
                 <label htmlFor="edit-complete" className="text-sm font-medium text-slate-300">
                   Mark as Complete
                 </label>
               </div>

               <div className="flex gap-3 pt-5">
                 <button
                   type="button"
                   onClick={() => { setShowEditModal(false); setEditingDelivery(null); }}
                   className="flex-1 px-4 py-3 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
                 >
                   Save Changes
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* View Delivery Modal */}
       {showViewModal && viewingDelivery && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
             <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-100">Delivery Details</h2>
               <button onClick={() => { setShowViewModal(false); setViewingDelivery(null); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-4 md:p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-sm text-slate-400">Date</span>
                   <p className="font-medium text-slate-100">{new Date(viewingDelivery.date).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <span className="text-sm text-slate-400">Client</span>
                   <p className="font-medium text-slate-100">{viewingDelivery.client}</p>
                 </div>
               </div>

               <div>
                 <span className="text-sm text-slate-400">Location</span>
                 <p className="font-medium text-slate-100 mt-1">{viewingDelivery.location}</p>
               </div>

               <div>
                 <span className="text-sm text-slate-400">Items</span>
                 <div className="mt-2 space-y-2">
                   {viewingDelivery.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm bg-slate-800/50 p-3 rounded-xl">
                       <span className="text-slate-300">{item.item}</span>
                       <span className="font-medium text-slate-200">x{item.quantity}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <span className="text-sm text-slate-400">Received By</span>
                 <p className="font-medium text-slate-100 mt-1">{viewingDelivery.receivedBy}</p>
               </div>

               {viewingDelivery.clientSignature && (
                 <div>
                   <span className="text-sm text-slate-400">Client Signature</span>
                   <div className="mt-2">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                       src={viewingDelivery.clientSignature}
                       alt="Client signature"
                       className="max-w-full h-32 object-contain border border-slate-700/50 rounded-xl bg-slate-800/50 p-2"
                     />
                     {viewingDelivery.signedAt && (
                       <p className="text-xs text-slate-500 mt-1">
                         Signed on {new Date(viewingDelivery.signedAt).toLocaleDateString()}
                       </p>
                     )}
                   </div>
                 </div>
               )}

               {viewingDelivery.image && (
                 <div>
                   <span className="text-sm text-slate-400">Image</span>
                   <div className="mt-2">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                       src={viewingDelivery.image}
                       alt="Delivery"
                       className="max-w-full h-auto rounded-xl border border-slate-700/50"
                     />
                   </div>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-sm text-slate-400">Technician</span>
                   <p className="font-medium text-slate-100">{viewingDelivery.technician?.name || 'Unassigned'}</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-slate-400">Status</span>
                   <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${viewingDelivery.complete ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                     {viewingDelivery.complete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                     {viewingDelivery.complete ? 'Completed' : 'Pending'}
                   </span>
                 </div>
               </div>

               <div className="flex gap-3 pt-5">
                 <button
                   type="button"
                   onClick={() => { setShowViewModal(false); setViewingDelivery(null); }}
                   className="flex-1 px-4 py-3 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800/50 transition-colors"
                 >
                   Close
                 </button>
                 {(isAdmin || user?._id === viewingDelivery.technician?._id) && (
                   <button
                     type="button"
                     onClick={(e) => { setShowViewModal(false); openEditModal(viewingDelivery, e); }}
                     className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
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
