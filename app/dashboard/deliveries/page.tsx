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
  MapPin,
  User as UserIcon,
  Car,
  CheckCircle2,
  Circle,
  FileText,
  Image as ImageIcon
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
  updatedAt: string;
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
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newDelivery, setNewDelivery] = useState({
    date: '',
    client: '',
    location: '',
    technician: '',
    items: [{ item: '', quantity: 1 }] as DeliveryItem[],
    receivedBy: '',
    clientSignature: '',
    signedAt: '',
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

  async function apiFetch(url: string, options?: RequestInit) {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data;
  }

  const fetchDeliveries = async () => {
    try {
      const { data } = await apiFetch('/api/deliveries');
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await apiFetch('/api/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await apiFetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelivery)
      });

      if (data.success === true) {
        setShowModal(false);
        setNewDelivery({
          date: '',
          client: '',
          location: '',
          technician: '',
          items: [{ item: '', quantity: 1 }],
          receivedBy: '',
          clientSignature: '',
          signedAt: '',
          image: '',
          complete: false
        });
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to create delivery');
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert(error instanceof Error ? error.message : 'Failed to create delivery');
    }
  };

  const handleEditDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDelivery) return;

    try {
      const { data } = await apiFetch(`/api/deliveries/${editingDelivery._id}`, {
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
          signedAt: editingDelivery.signedAt,
          image: editingDelivery.image,
          complete: editingDelivery.complete
        })
      });

      if (data.success === true) {
        setShowEditModal(false);
        setEditingDelivery(null);
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to update delivery');
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      alert(error instanceof Error ? error.message : 'Failed to update delivery');
    }
  };

  const handleDeleteDelivery = async (deliveryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      const { data } = await apiFetch(`/api/deliveries/${deliveryId}`, {
        method: 'DELETE'
      });

      if (data.success) {
        fetchDeliveries();
      } else {
        alert(data.error || 'Failed to delete delivery');
      }
    } catch (error) {
      console.error('Error deleting delivery:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete delivery');
    }
  };

  const openEditModal = (delivery: Delivery, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDelivery(delivery);
    setShowEditModal(true);
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
    const newItems = [...newDelivery.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewDelivery({ ...newDelivery, items: newItems });
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

  const filteredDeliveries = deliveries.filter(d =>
    searchTerm === '' ||
    d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Deliveries</h1>
            <p className="text-slate-400 mt-1">Manage and track customer deliveries</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Delivery</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search deliveries by client, location, or received by..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Deliveries Grid */}
      {filteredDeliveries.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 truncate max-w-[120px]">{delivery.client}</h3>
                    <p className="text-xs text-slate-400">{new Date(delivery.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
                  <Car className="w-4 h-4 text-slate-400" />
                  <span>Received by: {delivery.receivedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>{delivery.items.length} item(s)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>{delivery.complete ? 'Completed' : 'Pending'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first delivery to get started'}
          </p>
          {!searchTerm && (
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Completed</label>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={newDelivery.complete}
                      onChange={(e) => setNewDelivery({ ...newDelivery, complete: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Mark as Complete</span>
                  </div>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Signature (Optional)</label>
                <input
                  type="text"
                  value={newDelivery.clientSignature}
                  onChange={(e) => setNewDelivery({ ...newDelivery, clientSignature: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image (Optional)</label>
                <input
                  type="text"
                  value={newDelivery.image}
                  onChange={(e) => setNewDelivery({ ...newDelivery, image: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Completed</label>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={editingDelivery.complete}
                      onChange={(e) => setEditingDelivery({ ...editingDelivery, complete: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Mark as Complete</span>
                  </div>
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
                  value={editingDelivery.technician._id || ''}
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Signature (Optional)</label>
                <input
                  type="text"
                  value={editingDelivery.clientSignature || ''}
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, clientSignature: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image (Optional)</label>
                <input
                  type="text"
                  value={editingDelivery.image || ''}
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, image: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
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
    </>
  );
}
