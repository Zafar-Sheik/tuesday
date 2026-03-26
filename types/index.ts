export type UserRole = 'admin' | 'developer' | 'technician';

export interface SessionUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectType {
  _id: string;
  name: string;
  description?: string;
  allowedRoles: UserRole[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  projectType: string | ProjectType;
  assignedTo: string | User;
  createdBy: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientSignature?: string;
  signedAt?: Date;
  status: ProjectStatus;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  project: string | Project;
  title: string;
  description?: string;
  assignedTo?: string | User;
  createdBy: string;
  status: TaskStatus;
  date: Date;
  startTime: string;
  endTime: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
