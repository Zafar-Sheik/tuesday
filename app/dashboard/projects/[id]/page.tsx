'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Loader2,
  Plus,
  Clock,
  PlayCircle,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit,
  X
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  date: string;
  startTime: string;
  endTime: string;
  assignedTo?: { _id: string; name: string; email: string };
  createdBy?: { _id: string; name: string };
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  projectType?: { _id: string; name: string; allowedRoles?: string[] };
  assignedTo?: { _id: string; name: string; email: string; role: string };
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientSignature?: string;
  signedAt?: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
   
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    assignedTo: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchProject();
    }
  }, [user, authLoading, router, projectId]);

  useEffect(() => {
    if (showEditModal && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [showEditModal]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data.project);
        setTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, project: projectId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          assignedTo: ''
        });
        fetchProject();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Failed to delete task');
        } catch {
          alert('Failed to delete task');
        }
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        fetchProject();
      } else {
        alert(data.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: project?.status })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchProject();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    isDrawing.current = true;
    setHasDrawn(true);
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    isDrawing.current = true;
    setHasDrawn(true);
    lastPos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleTouchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchProject();
      } else {
        alert(data.error || 'Failed to save signature');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (loading || !user || !project) {
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
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/projects')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500">{project.projectType?.name}</p>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
          {user.role === 'admin' && (
            <button onClick={() => setShowEditModal(true)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <p className="font-semibold text-gray-900 capitalize">{project.status.replace('_', ' ')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Progress</p>
          <p className="font-semibold text-gray-900">{project.progress}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Assigned To</p>
          <p className="font-semibold text-gray-900">{project.assignedTo?.name || 'Unassigned'}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Tasks</p>
          <p className="font-semibold text-gray-900">{tasks.length} total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Start Date</p>
          <p className="font-semibold text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">End Date</p>
          <p className="font-semibold text-gray-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">To Do</h3>
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{todoTasks.length}</span>
          </div>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">In Progress</h3>
            <span className="ml-auto bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs">{inProgressTasks.length}</span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
            ))}
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Done</h3>
            <span className="ml-auto bg-green-200 text-green-700 px-2 py-0.5 rounded-full text-xs">{doneTasks.length}</span>
          </div>
          <div className="space-y-3">
            {doneTasks.map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
            ))}
          </div>
        </div>
      </div>

      {/* Client Sign-off Section */}
      {project.projectType?.allowedRoles?.includes('technician') && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Sign-off</h2>
          {project.clientSignature ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Job Completed</p>
                <p className="text-sm text-gray-500">Signed on {new Date(project.signedAt || '').toLocaleDateString()}</p>
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                  <img src={project.clientSignature} alt="Client signature" className="h-16 object-contain" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Please sign below to confirm job completion:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchDraw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 bg-white border border-gray-200 rounded-lg touch-none cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={clearSignature} className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                  Clear
                </button>
                <button type="button" onClick={saveSignature} disabled={!hasDrawn} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  Sign & Complete
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Draw your signature using mouse or touch</p>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={newTask.date} onChange={(e) => setNewTask({...newTask, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={newTask.startTime} onChange={(e) => setNewTask({...newTask, startTime: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={newTask.endTime} onChange={(e) => setNewTask({...newTask, endTime: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={project.status} onChange={(e) => setProject({...project, status: e.target.value as Project['status']})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function TaskCard({ task, onStatusChange, onDelete }: { task: Task; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const getNextStatus = (current: string) => current === 'todo' ? 'in_progress' : current === 'in_progress' ? 'done' : 'done';

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 rounded"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
              <button onClick={() => { onStatusChange(task._id, getNextStatus(task.status)); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">Move to {getNextStatus(task.status).replace('_', ' ')}</button>
              <button onClick={() => { onDelete(task._id); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Delete</button>
            </div>
          )}
        </div>
      </div>
      {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span>{new Date(task.date).toLocaleDateString()}</span>
        <span>•</span>
        <span>{task.startTime} - {task.endTime}</span>
      </div>
    </div>
  );
}
