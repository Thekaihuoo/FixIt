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
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isInitialLoad = useRef<boolean>(true);
  const prevRequestsCount = useRef(0);
  const requestsRef = useRef<RepairRequest[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    } catch (e) {
      console.warn("Notification audio not supported");
    }
    
    // Load notifications from local storage
    const saved = localStorage.getItem('fixit_notifications');
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('fixit_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const init = async () => {
      try {
        await storage.initAuth();
        const currentUser = storage.getAuth();
        if (currentUser) setUser(currentUser);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Update requestsRef whenever requests changes
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = storage.subscribeToRequests((newRequests) => {
      // Notification Detection Logic for Admin Staff
      if (user.role === 'staff' && !isInitialLoad.current) {
        if (newRequests.length > prevRequestsCount.current) {
          // Identify newly added requests by comparing IDs
          const newItems = newRequests.filter(nr => !requestsRef.current.some(r => r.id === nr.id));
          if (newItems.length > 0) {
            const newNotis: AppNotification[] = newItems.map(req => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
              message: `คุณได้รับแจ้งซ่อมใหม่: ${req.asset.type} โดย ${req.requester.name}`,
              ticketId: req.id,
              timestamp: new Date().toISOString(),
              read: false
            }));
            setNotifications(prev => [...newNotis, ...prev]);
            
            // Try playing notification sound
            audioRef.current?.play().catch(e => console.log("Sound play prevented by browser", e));
          }
        }
      }

      setRequests(newRequests);
      prevRequestsCount.current = newRequests.length;
      isInitialLoad.current = false;
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await storage.login(authForm.username, authForm.password);
      if (loggedUser) {
        setUser(loggedUser);
        setLoginError('');
      } else {
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setActiveMenu('dashboard');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotiDropdown(false);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-600 mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">กำลังเตรียมความพร้อมของระบบ...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden mesh-bg">
        <div className="absolute top-[5%] left-[10%] w-[30vw] h-[30vw] bg-purple-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[40vw] h-[40vw] bg-orange-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-[20vw] h-[20vw] bg-blue-400/10 rounded-full blur-[80px]"></div>

        <div className="max-w-md w-full relative z-10 px-6 animate-fade-in">
          <div className="glass-card rounded-[3.5rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-bl-[100px]"></div>
            
            <div className="text-center mb-10">
              <div className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl mb-8 ring-8 ring-white/50 transform transition-transform hover:scale-110 duration-500">
                <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto" />
              </div>
              <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-2">FixIt</h1>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-1.5 w-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"></div>
                <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.4em]">Service Online</p>
                <div className="h-1.5 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="w-full pl-16 pr-8 py-5 bg-white/50 border-2 border-white focus:border-violet-300 focus:bg-white rounded-3xl font-bold text-gray-800 transition-all outline-none shadow-sm" 
                  value={authForm.username} 
                  onChange={e => setAuthForm({...authForm, username: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </span>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full pl-16 pr-8 py-5 bg-white/50 border-2 border-white focus:border-violet-300 focus:bg-white rounded-3xl font-bold text-gray-800 transition-all outline-none shadow-sm" 
                  value={authForm.password} 
                  onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                  required 
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 text-red-600 text-[12px] font-black text-center py-4 rounded-2xl border border-red-200 animate-shake flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {loginError}
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full py-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_40px_-10px_rgba(92,45,145,0.5)] hover:shadow-[0_25px_50px_-10px_rgba(92,45,145,0.7)] hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center gap-4 mt-8 group"
              >
                เข้าสู่ระบบ
                <svg className="w-7 h-7 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.2em] opacity-60">Smart Maintenance Solution</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 sidebar-gradient text-white no-print flex flex-col fixed inset-y-0 z-50 shadow-2xl">
        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8 w-full px-2">
            <div className="bg-white/20 p-2 rounded-xl shadow-xl backdrop-blur-md ring-2 ring-white/10">
               <img src={LOGO_URL} alt="Logo" className="h-7 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">FixIt</h1>
              <p className="text-[9px] opacity-70 font-bold uppercase tracking-[0.2em] mt-1">Management</p>
            </div>
          </div>

          <div className="w-full bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-4 mb-8 flex items-center gap-3 border border-white/15 shadow-2xl transform transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center text-violet-700 font-black text-xl shadow-xl transform transition-transform hover:rotate-2">
               {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{user.name}</p>
              <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest mt-0.5">{user.role === 'staff' ? 'Admin Staff' : 'Requester'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-4 py-3.5 px-6 sidebar-item ${activeMenu === 'dashboard' ? 'active' : 'hover:bg-white/5'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="font-black text-sm tracking-wide">แดชบอร์ด</span>
          </button>
          
          {user.role === 'staff' && (
            <>
              <button onClick={() => setActiveMenu('users')} className={`w-full flex items-center gap-4 py-3.5 px-6 sidebar-item ${activeMenu === 'users' ? 'active' : 'hover:bg-white/5'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <span className="font-black text-sm tracking-wide">จัดการผู้ใช้งาน</span>
              </button>
              <button onClick={() => setActiveMenu('inventory')} className={`w-full flex items-center gap-4 py-3.5 px-6 sidebar-item ${activeMenu === 'inventory' ? 'active' : 'hover:bg-white/5'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span className="font-black text-sm tracking-wide">คลังวัสดุ/อะไหล่</span>
              </button>
              <button onClick={() => setActiveMenu('pm')} className={`w-full flex items-center gap-4 py-3.5 px-6 sidebar-item ${activeMenu === 'pm' ? 'active' : 'hover:bg-white/5'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="font-black text-sm tracking-wide">แผนบำรุงรักษา</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-6">
          <button onClick={handleLogout} className="w-full py-3.5 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center gap-3 font-black text-xs transition-all shadow-xl hover:-translate-y-1 active:scale-95">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 main-content overflow-y-auto">
        <header className="px-10 py-8 flex justify-between items-center bg-white/40 backdrop-blur-2xl sticky top-0 z-40 no-print border-b border-white/40 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-2 h-8 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full shadow-lg"></div>
             <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                 {activeMenu === 'dashboard' ? 'แดชบอร์ดระบบ' : activeMenu === 'users' ? 'จัดการผู้ใช้งาน' : activeMenu === 'inventory' ? 'คลังวัสดุ/อะไหล่' : 'แผนบำรุงรักษา'}
               </h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Management Intelligence</p>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
            {user.role === 'staff' && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotiDropdown(!showNotiDropdown);
                    if (!showNotiDropdown) markAllAsRead();
                  }}
                  className="p-3 text-gray-500 hover:text-violet-600 transition-all rounded-2xl bg-white/50 hover:bg-white shadow-sm relative group"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
                    </span>
                  )}
                </button>

                {showNotiDropdown && (
                  <div className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden z-[60] animate-slide-down">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                       <h3 className="text-xs font-black text-gray-800">การแจ้งเตือน</h3>
                       <button onClick={clearNotifications} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">ล้างทั้งหมด</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-10 text-center text-gray-400">
                           <svg className="w-10 h-10 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                           <p className="text-[10px] font-bold uppercase tracking-widest">ไม่มีการแจ้งเตือน</p>
                         </div>
                       ) : (
                         <div className="divide-y divide-gray-100">
                           {notifications.map(noti => (
                             <div key={noti.id} className="p-5 hover:bg-violet-50/30 transition-colors flex gap-4">
                               <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                               </div>
                               <div>
                                 <p className="text-xs font-bold text-gray-800 leading-tight mb-1.5">{noti.message}</p>
                                 <div className="flex items-center gap-3">
                                   <span className="text-[9px] font-mono text-indigo-500 font-black">{noti.ticketId}</span>
                                   <span className="text-[9px] text-gray-400 font-bold">{new Date(noti.timestamp).toLocaleTimeString('th-TH')}</span>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="bg-white/60 px-4 py-2 rounded-xl border border-white/80 shadow-sm">
                <p className="text-xs font-black text-gray-800 tracking-tight uppercase">{formatDateTh(currentTime)}</p>
                <p className="text-[9px] text-violet-600 font-black tracking-[0.2em]">{currentTime.toLocaleTimeString('th-TH')}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 pt-6">
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
        
        <footer className="p-10 text-center no-print">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] opacity-40">Freeman @ Copyright Krukai ฝากแชร์ ฝากติดตามด้วยนะครับ</p>
        </footer>
      </main>
      
      {showNotiDropdown && <div className="fixed inset-0 z-50" onClick={() => setShowNotiDropdown(false)}></div>}
    </div>
  );
};

export default App;