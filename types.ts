
export type UserRole = 'staff' | 'user';
export type PriorityLevel = 'Normal' | 'Urgent' | 'Critical';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  position?: string;
  dept?: string;
}

export type RepairStatus = 'Pending' | 'In Progress' | 'Vendor Contacted' | 'Completed';

export const StatusLabels: Record<RepairStatus, string> = {
  'Pending': 'รอรับเรื่อง',
  'In Progress': 'กำลังดำเนินการ',
  'Vendor Contacted': 'ส่งซ่อมร้าน',
  'Completed': 'ซ่อมเสร็จแล้ว'
};

export const StatusColors: Record<RepairStatus, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Vendor Contacted': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-green-100 text-green-800'
};

export const PriorityLabels: Record<PriorityLevel, string> = {
  'Normal': 'ปกติ',
  'Urgent': 'เร่งด่วน',
  'Critical': 'เร่งด่วนที่สุด'
};

export const PriorityColors: Record<PriorityLevel, string> = {
  'Normal': 'bg-gray-100 text-gray-600',
  'Urgent': 'bg-orange-100 text-orange-600',
  'Critical': 'bg-red-100 text-red-600'
};

// --- New Types for Inventory ---
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

// --- New Types for PM Schedule ---
export interface MaintenanceTask {
  id: string;
  title: string;
  assetName: string;
  location: string;
  nextDate: string;
  period: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'Upcoming' | 'Done' | 'Overdue';
}

export interface AppNotification {
  id: string;
  message: string;
  ticketId: string;
  timestamp: string;
  read: boolean;
}

export interface RepairRequest {
  id: string;
  createdAt: string;
  priority: PriorityLevel;
  rating?: number;
  feedback?: string;
  cost?: number; // Added for costing
  requester: {
    name: string;
    position: string;
    department: string;
    phone: string;
    username: string;
  };
  asset: {
    type: string;
    otherType?: string;
    id_number: string;
    room: string;
  };
  symptoms: string;
  preferredDate: string;
  status: RepairStatus;
  staffAction?: {
    vendorName?: string;
    contactDate?: string;
    contactTime?: string;
    serviceDate?: string;
    serviceTime?: string;
    notes?: string;
    pickupPerson?: string;
    pickupDate?: string;
  };
}
