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
        <span key={role} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Project Types</h1>
            <p className="text-slate-400 mt-1">Define project categories and access levels</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Add Type</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search project types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 pl-10 pr-4 py-2.5 border border-slate-700/50 bg-slate-800/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Project Types Grid */}
      {filteredProjectTypes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjectTypes.map((pt) => (
            <div
              key={pt._id}
              className="glass rounded-2xl p-4 md:p-6 border border-slate-700/50 hover:border-slate-600/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pt)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProjectType(pt._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-100 text-lg mb-2">{pt.name}</h3>

              {pt.description && (
                <p className="text-sm text-slate-400 mb-4">{pt.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {getRoleBadge(pt.allowedRoles)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No project types yet</h3>
          <p className="text-slate-500 mb-4">Create your first project type to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Create Project Type
          </button>
        </div>
      )}

      {/* Create Project Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Add Project Type</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectType} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newProjectType.name}
                  onChange={(e) => setNewProjectType({...newProjectType, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Development, Website, Call Out"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newProjectType.description}
                  onChange={(e) => setNewProjectType({...newProjectType, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Allowed Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = newProjectType.allowedRoles.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRole(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                            : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Type Modal */}
      {showEditModal && editingProjectType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Edit Project Type</h2>
              <button onClick={() => { setShowEditModal(false); setEditingProjectType(null); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProjectType} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editingProjectType.name}
                  onChange={(e) => setEditingProjectType({...editingProjectType, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Development, Website, Call Out"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editingProjectType.description || ''}
                  onChange={(e) => setEditingProjectType({...editingProjectType, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Allowed Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = editingProjectType.allowedRoles.includes(option.value as any);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRole(option.value, true)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                            : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-5">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingProjectType(null); }}
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
