
import React, { useState, useEffect, useRef } from 'react';
import { User, RepairRequest, AppNotification, StatusLabels } from './types';
import { storage } from './services/storage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserManagement from './components/UserManagement';
import InventoryManager from './components/InventoryManager';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import { LOGO_URL } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isInitialLoad = useRef<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await storage.initAuth();
        const currentUser = storage.getAuth();
        if (currentUser) setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = storage.subscribeToRequests((newRequests) => {
      setRequests(newRequests);
      isInitialLoad.current = false;
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loggedUser = await storage.login(authForm.username, authForm.password);
    if (loggedUser) {
      setUser(loggedUser);
      setLoginError('');
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setActiveMenu('dashboard');
  };

  const createRequest = async (requestData: Partial<RepairRequest>) => {
    const timestamp = Date.now();
    const newId = `RE-${new Date().getFullYear()}-${String(timestamp).slice(-4)}`;
    const newRequest: RepairRequest = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      ...requestData as any
    };
    await storage.saveRequest(newRequest);
  };

  const updateRequest = async (id: string, updates: Partial<RepairRequest>) => {
    const existing = requests.find(r => r.id === id);
    if (existing) await storage.saveRequest({ ...existing, ...updates });
  };

  const deleteRequest = async (id: string) => await storage.deleteRequest(id);

  const formatDateTh = (date: Date) => {
    return date.toLocaleDateString('th-TH', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border-t-8 border-purple-600">
          <div className="text-center mb-10">
            <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-4 p-2 bg-gray-50 rounded-2xl" />
            <h1 className="text-3xl font-black text-gray-800">FixIt Login</h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Repair System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" placeholder="Username" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
            <input type="password" placeholder="Password" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            {loginError && <div className="text-red-500 text-sm font-bold text-center">{loginError}</div>}
            <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-purple-700 transition-all">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 sidebar-gradient text-white no-print flex flex-col fixed inset-y-0 z-50">
        <div className="p-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-10 w-full">
            <div className="bg-white/20 p-2 rounded-xl">
               <img src={LOGO_URL} alt="Logo" className="h-8 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">ระบบแจ้งซ่อม</h1>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-3xl p-6 mb-8 flex items-center gap-4 border border-white/10">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 font-black text-xl shadow-inner">
               {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black">{user.name}</p>
              <p className="text-[10px] opacity-60 font-bold">{user.role === 'staff' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-4 py-4 px-8 sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="font-bold text-sm">แดชบอร์ด</span>
          </button>
          
          {user.role === 'staff' && (
            <>
              <button onClick={() => setActiveMenu('users')} className={`w-full flex items-center gap-4 py-4 px-8 sidebar-item ${activeMenu === 'users' ? 'active' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <span className="font-bold text-sm">จัดการผู้ใช้งาน</span>
              </button>
              <button onClick={() => setActiveMenu('inventory')} className={`w-full flex items-center gap-4 py-4 px-8 sidebar-item ${activeMenu === 'inventory' ? 'active' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span className="font-bold text-sm">จัดการคลังวัสดุ</span>
              </button>
              <button onClick={() => setActiveMenu('pm')} className={`w-full flex items-center gap-4 py-4 px-8 sidebar-item ${activeMenu === 'pm' ? 'active' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="font-bold text-sm">แผนบำรุงรักษา</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-8">
          <button onClick={handleLogout} className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all shadow-lg">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 main-content overflow-y-auto">
        <header className="p-8 flex justify-between items-center bg-white/30 backdrop-blur-sm sticky top-0 z-40 no-print">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
             <h2 className="text-2xl font-black text-gray-800">
               {activeMenu === 'dashboard' ? 'แดชบอร์ดระบบ' : activeMenu === 'users' ? 'จัดการผู้ใช้งาน' : activeMenu === 'inventory' ? 'คลังวัสดุ' : 'แผนบำรุงรักษา'}
             </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{formatDateTh(currentTime)}</p>
          </div>
        </header>

        <div className="p-8 pt-0">
          {activeMenu === 'dashboard' ? (
            user.role === 'staff' ? (
              <AdminDashboard requests={requests} onUpdateStatus={updateRequest} onDeleteRequest={deleteRequest} />
            ) : (
              <UserDashboard user={user} requests={requests} onCreateRequest={createRequest} onUpdateStatus={updateRequest} />
            )
          ) : activeMenu === 'users' ? (
            <UserManagement />
          ) : activeMenu === 'inventory' ? (
            <InventoryManager />
          ) : (
            <MaintenanceSchedule />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
