
import React, { useState } from 'react';
import { RepairRequest, User, StatusLabels, StatusColors, PriorityLabels, PriorityColors } from '../types';
import RepairFormModal from './RepairFormModal';

interface UserDashboardProps {
  user: User;
  requests: RepairRequest[];
  onCreateRequest: (request: Partial<RepairRequest>) => void;
  onUpdateStatus?: (id: string, updates: Partial<RepairRequest>) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, requests, onCreateRequest, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const userRequests = requests.filter(r => r.requester.username === user.username);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm border border-gray-100">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-gray-800 mb-2">สวัสดีคุณ {user.name} 🛠️</h2>
          <p className="text-gray-500 text-lg">หากครุภัณฑ์ชำรุด สามารถแจ้งซ่อมได้ทันทีผ่านระบบออนไลน์</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-4 px-12 py-6 text-white font-black rounded-[2rem] text-xl transition-all hover:scale-105 active:scale-95 group">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          แจ้งซ่อมใหม่
        </button>
      </div>

      <div className="soft-card overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-800">ประวัติการแจ้งซ่อมของท่าน</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Ticket ID</th>
                <th className="px-8 py-5">ความเร่งด่วน</th>
                <th className="px-8 py-5">ครุภัณฑ์</th>
                <th className="px-8 py-5">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic font-bold">ยังไม่มีข้อมูลการแจ้งซ่อม</td></tr>
              ) : (
                userRequests.map(req => (
                  <tr key={req.id} className="hover:bg-purple-50/30 transition-all">
                    <td className="px-8 py-6 font-mono font-bold text-purple-600">{req.id}</td>
                    <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${PriorityColors[req.priority]}`}>
                          {PriorityLabels[req.priority]}
                        </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-800">{req.asset.type}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm ${StatusColors[req.status]}`}>
                        {StatusLabels[req.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <RepairFormModal user={user} onClose={() => setShowForm(false)} onSubmit={(req) => { onCreateRequest(req); setShowForm(false); }} />
      )}
    </div>
  );
};

export default UserDashboard;
