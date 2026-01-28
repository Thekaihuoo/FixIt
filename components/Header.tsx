
import React, { useState } from 'react';
import { LOGO_URL } from '../constants';
import { User, AppNotification } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  notifications: AppNotification[];
  onMarkAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, notifications, onMarkAsRead }) => {
  const [showNoti, setShowNoti] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="glass-nav no-print sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm">
            <img src={LOGO_URL} alt="FixIt Logo" className="h-8 w-auto" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">FixIt</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Repair Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          {user.role === 'staff' && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNoti(!showNoti);
                  if (!showNoti) onMarkAsRead();
                }}
                className="p-3 text-gray-500 hover:text-orange-500 transition-all rounded-2xl hover:bg-orange-50 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] text-white font-bold items-center justify-center">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {showNoti && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-700">การแจ้งเตือน</h3>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold">{notifications.length} ทั้งหมด</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm italic">ไม่มีการแจ้งเตือนในขณะนี้</div>
                    ) : (
                      notifications.map(noti => (
                        <div key={noti.id} className={`p-4 border-b hover:bg-gray-50 transition-colors ${!noti.read ? 'bg-orange-50/50' : ''}`}>
                          <div className="flex gap-3">
                             <div className="bg-orange-100 p-2 rounded-xl h-fit">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                             </div>
                             <div>
                                <p className="text-xs font-semibold text-gray-800 leading-tight">{noti.message}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[9px] font-mono text-blue-500 font-bold">{noti.ticketId}</span>
                                  <span className="text-[9px] text-gray-400">{new Date(noti.timestamp).toLocaleTimeString('th-TH')}</span>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-100/50 p-1.5 pr-4 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-medium">{user.role === 'staff' ? 'ADMIN PANEL' : (user.dept || 'USER')}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-3 text-gray-400 hover:text-red-500 transition-all rounded-2xl hover:bg-red-50"
            title="ออกจากระบบ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
      {showNoti && <div className="fixed inset-0 z-30" onClick={() => setShowNoti(false)}></div>}
    </header>
  );
};

export default Header;
