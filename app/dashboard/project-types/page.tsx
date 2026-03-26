'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  Loader2,
  Search,
  Trash2,
  Shield,
  Code,
  Wrench,
  X,
  Edit
} from 'lucide-react';

interface ProjectType {
  _id: string;
  name: string;
  description?: string;
  allowedRoles: ('admin' | 'developer' | 'technician')[];
  createdBy: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'developer', label: 'Developer', icon: Code },
  { value: 'technician', label: 'Technician', icon: Wrench },
];

export default function ProjectTypesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProjectType, setEditingProjectType] = useState<ProjectType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProjectType, setNewProjectType] = useState({
    name: '',
    description: '',
    allowedRoles: [] as string[]
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      fetchProjectTypes();
    }
  }, [user, authLoading, router]);

  const fetchProjectTypes = async () => {
    try {
      const res = await fetch('/api/project-types');
      const data = await res.json();
      if (data.success) {
        setProjectTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching project types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProjectType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newProjectType.allowedRoles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    try {
      const res = await fetch('/api/project-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectType)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setNewProjectType({
          name: '',
          description: '',
          allowedRoles: []
        });
        fetchProjectTypes();
      } else {
        alert(data.error || 'Failed to create project type');
      }
    } catch (error) {
      console.error('Error creating project type:', error);
    }
  };

  const handleEditProjectType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectType) return;

    if (editingProjectType.allowedRoles.length === 0) {
      alert('Please select at least one role');
      return;
    }
    
    try {
      const res = await fetch(`/api/project-types/${editingProjectType._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProjectType.name,
          description: editingProjectType.description,
          allowedRoles: editingProjectType.allowedRoles
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowEditModal(false);
        setEditingProjectType(null);
        fetchProjectTypes();
      } else {
        alert(data.error || 'Failed to update project type');
      }
    } catch (error) {
      console.error('Error updating project type:', error);
    }
  };

  const handleDeleteProjectType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project type?')) return;
    
    try {
      const res = await fetch(`/api/project-types/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete project type');
        } catch {
          alert('Failed to delete project type');
        }
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        fetchProjectTypes();
      } else {
        alert(data.error || 'Failed to delete project type');
      }
    } catch (error) {
      console.error('Error deleting project type:', error);
    }
  };

  const toggleRole = (role: string, isEdit: boolean = false) => {
    if (isEdit && editingProjectType) {
      setEditingProjectType(prev => prev ? {
        ...prev,
        allowedRoles: prev.allowedRoles.includes(role as any)
          ? prev.allowedRoles.filter(r => r !== role)
          : [...prev.allowedRoles, role as any]
      } : null);
    } else {
      setNewProjectType(prev => ({
        ...prev,
        allowedRoles: prev.allowedRoles.includes(role)
          ? prev.allowedRoles.filter(r => r !== role)
          : [...prev.allowedRoles, role]
      }));
    }
  };

  const openEditModal = (pt: ProjectType) => {
    setEditingProjectType(pt);
    setShowEditModal(true);
  };

  const getRoleBadge = (roles: string[]) => {
    return roles.map(role => {
      const option = ROLE_OPTIONS.find(o => o.value === role);
      const Icon = option?.icon || Shield;
      return (
        <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <Icon className="w-3 h-3" />
          {option?.label || role}
        </span>
      );
    });
  };

  const filteredProjectTypes = projectTypes.filter(pt => 
    pt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pt.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Project Types</h1>
            <p className="text-gray-500 mt-1">Define project categories and access levels</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Type</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search project types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Project Types Grid */}
      {filteredProjectTypes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjectTypes.map((pt) => (
            <div
              key={pt._id}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pt)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProjectType(pt._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2">{pt.name}</h3>
              
              {pt.description && (
                <p className="text-sm text-gray-600 mb-4">{pt.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {getRoleBadge(pt.allowedRoles)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No project types yet</h3>
          <p className="text-gray-500 mb-4">Create your first project type to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Project Type
          </button>
        </div>
      )}

      {/* Create Project Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Project Type</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProjectType} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newProjectType.name}
                  onChange={(e) => setNewProjectType({...newProjectType, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Development, Website, Call Out"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProjectType.description}
                  onChange={(e) => setNewProjectType({...newProjectType, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = newProjectType.allowedRoles.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRole(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Type Modal */}
      {showEditModal && editingProjectType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Project Type</h2>
              <button onClick={() => { setShowEditModal(false); setEditingProjectType(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditProjectType} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingProjectType.name}
                  onChange={(e) => setEditingProjectType({...editingProjectType, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Development, Website, Call Out"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProjectType.description || ''}
                  onChange={(e) => setEditingProjectType({...editingProjectType, description: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = editingProjectType.allowedRoles.includes(option.value as any);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRole(option.value, true)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingProjectType(null); }}
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
