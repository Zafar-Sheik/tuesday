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
  Factory,
  CheckCircle2,
  Circle
} from 'lucide-react';

interface CollectionItem {
  item: string;
  quantity: number;
}

interface Collection {
  _id: string;
  date: string;
  supplier: string;
  location: string;
  technician: { _id: string; name: string; email: string };
  vehicle: string;
  items: CollectionItem[];
  client: string;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCollection, setNewCollection] = useState({
    date: '',
    supplier: '',
    location: '',
    technician: '',
    vehicle: '',
    items: [{ item: '', quantity: 1 }] as CollectionItem[],
    client: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCollections();
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success) {
        setCollections(data.data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
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

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewCollection({
          date: '',
          supplier: '',
          location: '',
          technician: '',
          vehicle: '',
          items: [{ item: '', quantity: 1 }],
          client: ''
        });
        fetchCollections();
      } else {
        alert(data.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;

    try {
      const res = await fetch(`/api/collections/${editingCollection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingCollection.date,
          supplier: editingCollection.supplier,
          location: editingCollection.location,
          technician: editingCollection.technician._id,
          vehicle: editingCollection.vehicle,
          items: editingCollection.items,
          client: editingCollection.client
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingCollection(null);
        fetchCollections();
      } else {
        alert(data.error || 'Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  const handleDeleteCollection = async (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete collection');
        } catch {
          alert('Failed to delete collection');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        fetchCollections();
      } else {
        alert(data.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const openEditModal = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(collection);
    setShowEditModal(true);
  };

  const addItemField = () => {
    setNewCollection(prev => ({
      ...prev,
      items: [...prev.items, { item: '', quantity: 1 }]
    }));
  };

  const removeItemField = (index: number) => {
    setNewCollection(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: 'item' | 'quantity', value: string | number) => {
    setNewCollection(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const updateEditItem = (index: number, field: 'item' | 'quantity', value: string | number) => {
    if (!editingCollection) return;
    const newItems = [...editingCollection.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingCollection({ ...editingCollection, items: newItems });
  };

  const addEditItemField = () => {
    setEditingCollection(prev => prev ? {
      ...prev,
      items: [...prev.items, { item: '', quantity: 1 }]
    } : null);
  };

  const removeEditItemField = (index: number) => {
    setEditingCollection(prev => prev ? {
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    } : null);
  };

  const filteredCollections = collections.filter(c =>
    searchTerm === '' ||
    c.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-500 mt-1">Track and manage supplier collections</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Collection</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search collections by supplier, location, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Collections Grid */}
      {filteredCollections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <div
              key={collection._id}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
               <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Factory className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-[120px]">{collection.supplier}</h3>
                    <p className="text-xs text-gray-500">{new Date(collection.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(isAdmin || user?._id === collection.technician?._id) && (
                    <>
                      <button
                        onClick={(e) => openEditModal(collection, e)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCollection(collection._id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{collection.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>{collection.technician?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span>{collection.vehicle}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>{collection.items.length} item(s)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Factory className="w-4 h-4 text-gray-400" />
                  <span>Delivering to: {collection.client}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first collection to get started'}
          </p>
          {(isAdmin || user?.role === 'technician') && !searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Collection
            </button>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Collection</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newCollection.date}
                    onChange={(e) => setNewCollection({ ...newCollection, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={newCollection.vehicle}
                    onChange={(e) => setNewCollection({ ...newCollection, vehicle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Vehicle name/number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={newCollection.supplier}
                  onChange={(e) => setNewCollection({ ...newCollection, supplier: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newCollection.location}
                  onChange={(e) => setNewCollection({ ...newCollection, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  value={newCollection.technician}
                  onChange={(e) => setNewCollection({ ...newCollection, technician: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Technician</option>
                  {users.filter(u => u.role === 'technician').map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                {newCollection.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.item}
                      onChange={(e) => updateItem(index, 'item', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {newCollection.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemField(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItemField}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (Delivery Destination)</label>
                <input
                  type="text"
                  value={newCollection.client}
                  onChange={(e) => setNewCollection({ ...newCollection, client: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
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
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEditModal && editingCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Collection</h2>
              <button onClick={() => { setShowEditModal(false); setEditingCollection(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditCollection} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingCollection.date?.slice(0, 10) || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={editingCollection.vehicle}
                    onChange={(e) => setEditingCollection({ ...editingCollection, vehicle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={editingCollection.supplier}
                  onChange={(e) => setEditingCollection({ ...editingCollection, supplier: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingCollection.location}
                  onChange={(e) => setEditingCollection({ ...editingCollection, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  value={editingCollection.technician?._id || ''}
                  onChange={(e) => {
                    const tech = users.find(u => u._id === e.target.value);
                    if (tech) {
                      setEditingCollection({ ...editingCollection, technician: { _id: tech._id, name: tech.name, email: tech.email } });
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                {editingCollection.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.item}
                      onChange={(e) => updateEditItem(index, 'item', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {editingCollection.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEditItemField(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEditItemField}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (Delivery Destination)</label>
                <input
                  type="text"
                  value={editingCollection.client}
                  onChange={(e) => setEditingCollection({ ...editingCollection, client: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCollection(null); }}
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
    </>
  );
}
