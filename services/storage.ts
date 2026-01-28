
import { ref, get, set, update, remove, child, onValue } from "firebase/database";
import { db } from "../firebase";
import { RepairRequest, User, UserRole, InventoryItem, MaintenanceTask } from '../types';
import { INITIAL_USERS } from '../constants';

const REQUESTS_PATH = 'repair_requests';
const USERS_PATH = 'users';
const INVENTORY_PATH = 'inventory';
const MAINTENANCE_PATH = 'maintenance_schedule';
const AUTH_KEY = 'fixit_auth_local';

export const storage = {
  getRequests: async (): Promise<RepairRequest[]> => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, REQUESTS_PATH));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data as Record<string, RepairRequest>).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return [];
  },

  subscribeToRequests: (callback: (requests: RepairRequest[]) => void) => {
    const requestsRef = ref(db, REQUESTS_PATH);
    return onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sorted = Object.values(data as Record<string, RepairRequest>).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(sorted);
      } else {
        callback([]);
      }
    });
  },
  
  saveRequest: async (request: RepairRequest) => {
    const requestRef = ref(db, `${REQUESTS_PATH}/${request.id}`);
    await set(requestRef, request);
  },

  deleteRequest: async (id: string) => {
    const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
    await remove(requestRef);
  },

  // --- New: Inventory Functions ---
  getInventory: async (): Promise<InventoryItem[]> => {
    const snapshot = await get(ref(db, INVENTORY_PATH));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  },

  saveInventoryItem: async (item: InventoryItem) => {
    await set(ref(db, `${INVENTORY_PATH}/${item.id}`), item);
  },

  deleteInventoryItem: async (id: string) => {
    await remove(ref(db, `${INVENTORY_PATH}/${id}`));
  },

  // --- New: Maintenance Schedule Functions ---
  getMaintenanceSchedule: async (): Promise<MaintenanceTask[]> => {
    const snapshot = await get(ref(db, MAINTENANCE_PATH));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  },

  saveMaintenanceTask: async (task: MaintenanceTask) => {
    await set(ref(db, `${MAINTENANCE_PATH}/${task.id}`), task);
  },

  // User Management
  getAllUsers: async (): Promise<any[]> => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, USERS_PATH));
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  },

  saveUser: async (userData: any) => {
    const userRef = ref(db, `${USERS_PATH}/${userData.user}`);
    await set(userRef, userData);
  },

  bulkAddUsers: async (users: any[]) => {
    const updates: Record<string, any> = {};
    users.forEach(u => {
      if (u.user) updates[`${USERS_PATH}/${u.user}`] = u;
    });
    const dbRef = ref(db);
    await update(dbRef, updates);
  },

  deleteUser: async (username: string) => {
    const userRef = ref(db, `${USERS_PATH}/${username}`);
    await remove(userRef);
  },

  initAuth: async () => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, USERS_PATH));
    if (!snapshot.exists()) {
      const usersRef = ref(db, USERS_PATH);
      const usersMap: Record<string, any> = {};
      INITIAL_USERS.forEach(u => {
        usersMap[u.user] = u;
      });
      await set(usersRef, usersMap);
    }
  },

  login: async (username: string, pass: string): Promise<User | null> => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `${USERS_PATH}/${username}`));
    
    if (snapshot.exists()) {
      const user = snapshot.val();
      if (user.pass === pass) {
        const authUser: User = {
          username: user.user,
          name: user.name,
          role: user.role,
          position: user.position,
          dept: user.dept
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
        return authUser;
      }
    }
    return null;
  },

  getAuth: (): User | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};
