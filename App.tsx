
import React, { useState, useEffect, useRef } from 'react';
import { User, RepairRequest, AppNotification, StatusLabels } from './types';
import { storage } from './services/storage';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { PRIMARY_COLOR, LOGO_URL } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{show: boolean, message: string, ticketId?: string}>({show: false, message: ''});
  
  const prevRequestsCount = useRef<number>(0);
  const prevRequestsMap = useRef<Map<string, RepairRequest>>(new Map());
  const isInitialLoad = useRef<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await storage.initAuth();
        const currentUser = storage.getAuth();
        if (currentUser) setUser(currentUser);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Subscribe to requests when logged in
  useEffect(() => {
    if (!user) return;

    const unsubscribe = storage.subscribeToRequests((newRequests) => {
      if (user.role === 'staff' && !isInitialLoad.current) {
        // 1. Detect New Requests
        if (newRequests.length > prevRequestsCount.current) {
          const latestTicket = newRequests[0];
          // Only notify if it's truly a new ID we haven't seen
          if (!prevRequestsMap.current.has(latestTicket.id)) {
            const newNoti: AppNotification = {
              id: Date.now().toString(),
              message: `มีรายการแจ้งซ่อมใหม่จากคุณ ${latestTicket.requester.name}`,
              ticketId: latestTicket.id,
              timestamp: new Date().toISOString(),
              read: false
            };
            
            setNotifications(prev => [newNoti, ...prev].slice(0, 50));
            showToast(newNoti.message, latestTicket.id);
            audioRef.current?.play().catch(() => {});
          }
        }

        // 2. Detect Status Updates
        newRequests.forEach(newReq => {
          const oldReq = prevRequestsMap.current.get(newReq.id);
          if (oldReq && oldReq.status !== newReq.status) {
            const updateNoti: AppNotification = {
              id: `update-${Date.now()}-${newReq.id}`,
              message: `รายการ ${newReq.id} เปลี่ยนสถานะเป็น: ${StatusLabels[newReq.status]}`,
              ticketId: newReq.id,
              timestamp: new Date().toISOString(),
              read: false
            };

            setNotifications(prev => [updateNoti, ...prev].slice(0, 50));
            showToast(updateNoti.message, newReq.id);
            audioRef.current?.play().catch(() => {});
          }
        });
      }

      setRequests(newRequests);
      
      // Update references for next comparison
      prevRequestsCount.current = newRequests.length;
      const nextMap = new Map<string, RepairRequest>();
      newRequests.forEach(r => nextMap.set(r.id, r));
      prevRequestsMap.current = nextMap;
      
      isInitialLoad.current = false;
    });

    return () => unsubscribe();
  }, [user]);

  const showToast = (message: string, ticketId?: string) => {
    setToast({ show: true, message, ticketId });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 6000);
  };

  const handleMarkAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
    } catch (error) {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setRequests([]);
    setNotifications([]);
    isInitialLoad.current = true;
    prevRequestsMap.current = new Map();
  };

  const createRequest = async (requestData: Partial<RepairRequest>) => {
    const timestamp = new Date().getTime();
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
    if (existing) {
      const updated = { ...existing, ...updates };
      await storage.saveRequest(updated);
    }
  };

  const deleteRequest = async (id: string) => {
      await storage.deleteRequest(id);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff]">
        <div className="text-center">
            <div className="relative h-20 w-20 mx-auto">
               <div className="absolute inset-0 rounded-3xl bg-orange-500 animate-ping opacity-20"></div>
               <div className="relative flex items-center justify-center bg-white rounded-3xl h-full w-full shadow-xl border-2 border-orange-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500 border-r-2 border-transparent"></div>
               </div>
            </div>
            <p className="mt-6 text-gray-500 font-black uppercase tracking-widest text-xs">Connecting Database...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] p-6">
        <div className="max-w-md w-full soft-card p-10 relative overflow-hidden animate-fade-in border-t-8 border-orange-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full translate-x-16 -translate-y-16"></div>
          
          <div className="text-center mb-10 relative z-10">
            <div className="bg-white inline-block p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
               <img src={LOGO_URL} alt="Logo" className="h-16 mx-auto" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">FixIt</h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Asset Repair Management</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username / ชื่อผู้ใช้</label>
              <input 
                type="text" 
                className="block w-full px-5 py-4 bg-gray-50 border-transparent border focus:border-orange-200 rounded-2xl shadow-inner text-lg font-bold focus:ring-4 focus:ring-orange-500/10 transition-all"
                value={authForm.username}
                onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                placeholder="ระบุชื่อผู้ใช้งาน"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password / รหัสผ่าน</label>
              <input 
                type="password" 
                className="block w-full px-5 py-4 bg-gray-50 border-transparent border focus:border-orange-200 rounded-2xl shadow-inner text-lg font-bold focus:ring-4 focus:ring-orange-500/10 transition-all"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-bounce-in">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {loginError}
              </div>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center py-5 px-4 rounded-2xl text-white text-xl font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            "Freeman @ Copyright Krukai"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Dynamic Toast System */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-[100] no-print">
          <div className="bg-gray-900 text-white shadow-2xl rounded-3xl p-6 max-w-sm flex items-start gap-4 border-l-8 border-orange-500 ring-1 ring-white/10 animate-slide-up">
            <div className="bg-orange-500 p-2 rounded-xl h-fit">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="flex-1">
              <p className="font-black text-lg">แจ้งเตือนใหม่!</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">{toast.message}</p>
              {toast.ticketId && <span className="text-[10px] font-mono text-orange-400 mt-2 bg-white/10 px-2 py-0.5 rounded-lg inline-block uppercase font-black">{toast.ticketId}</span>}
            </div>
            <button onClick={() => setToast({show: false, message: ''})} className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      <Header 
        user={user} 
        onLogout={handleLogout} 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
      
      <main className="flex-1 relative pb-20">
        {user.role === 'staff' ? (
          <AdminDashboard 
            requests={requests} 
            onUpdateStatus={updateRequest}
            onDeleteRequest={deleteRequest}
          />
        ) : (
          <UserDashboard 
            user={user} 
            requests={requests} 
            onCreateRequest={createRequest} 
          />
        )}
      </main>

      <footer className="no-print bg-white/50 border-t border-gray-100 py-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em]">Freeman @ Copyright Krukai 2024</p>
          <div className="flex justify-center gap-6 mt-4">
             <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-blue-200 rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-orange-200 rounded-full"></div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        /* Smooth transitions for hover */
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default App;
