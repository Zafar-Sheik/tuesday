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

export interface DeliveryItem {
  item: string;
  quantity: number;
}

export interface Delivery {
  _id: string;
  date: string;
  client: string;
  location: string;
  technician: string | User;
  items: DeliveryItem[];
  receivedBy: string;
  clientSignature?: string;
  complete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  item: string;
  quantity: number;
}

export interface Collection {
  _id: string;
  date: string;
  supplier: string;
  location: string;
  technician: string | User;
  vehicle: string;
  items: CollectionItem[];
  client: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobCard {
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
  image?: string; // base64 string
  clientSignature?: string;
  complete: boolean;
  technician: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Workshop {
  _id: string;
  client: string;
  itemBookedIn: string;
  specs: string;
  faultOfItem: string;
  workScope: string;
  image?: string; // base64 string
  complete: boolean;
  technician: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FuelManagement {
  _id: string;
  date: string;
  vehicle: string;
  mileage: number;
  amountFilled: number;
  litresFilled: number;
  garage: string;
  kmDone: number;
  image?: string; // base64 string
  complete: boolean;
  technician: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
