
import React, { useState } from 'react';
import { RepairRequest, User, StatusLabels, StatusColors, PriorityLabels, PriorityColors } from '../types';
import RepairFormModal from './RepairFormModal';

interface UserDashboardProps {
  user: User;
  requests: RepairRequest[];
  onCreateRequest: (request: Partial<RepairRequest>) => void;
  onUpdateStatus?: (id: string, updates: Partial<RepairRequest>) => void; // Added for rating update
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, requests, onCreateRequest, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<RepairRequest | null>(null);
  const [currentRating, setCurrentRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  
  const userRequests = requests.filter(r => r.requester.username === user.username);

  const handleRate = () => {
    if (ratingTarget && onUpdateStatus) {
      onUpdateStatus(ratingTarget.id, { rating: currentRating, feedback });
      setRatingTarget(null);
      setFeedback('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print animate-fade-in">
      <div className="soft-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="relative z-10 space-y-3 text-center md:text-left">
          <h2 className="text-3xl font-black text-gray-800">ยินดีต้อนรับคุณ {user.name} 👋</h2>
          <p className="text-gray-500 max-w-lg text-lg">แจ้งซ่อมครุภัณฑ์ได้รวดเร็ว พร้อมระบุระดับความสำคัญเพื่อให้เราเข้าซ่อมบำรุงได้ตรงจุด</p>
        </div>
        <button onClick={() => setShowForm(true)} className="relative z-10 btn-primary flex items-center gap-3 px-10 py-5 text-white font-black rounded-[2rem] text-xl transition-all hover:scale-105 active:scale-95 group">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          แจ้งซ่อมใหม่
        </button>
      </div>

      <div className="soft-card overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-800">ประวัติการแจ้งซ่อมของท่าน</h3>
          <span className="text-xs font-bold text-gray-500">{userRequests.length} รายการ</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">TICKET ID</th>
                <th className="px-8 py-5">ความเร่งด่วน</th>
                <th className="px-8 py-5">ครุภัณฑ์</th>
                <th className="px-8 py-5">สถานะ</th>
                <th className="px-8 py-5">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userRequests.map(req => (
                <tr key={req.id} className="hover:bg-blue-50/30">
                  <td className="px-8 py-6 font-mono text-sm text-blue-600 font-bold">{req.id}</td>
                  <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${PriorityColors[req.priority]}`}>
                        {PriorityLabels[req.priority]}
                      </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-800">{req.asset.type}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm inline-block ${StatusColors[req.status]}`}>
                      {StatusLabels[req.status]}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {req.status === 'Completed' && !req.rating && (
                      <button onClick={() => setRatingTarget(req)} className="text-xs font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all">
                        ⭐ ประเมินงาน
                      </button>
                    )}
                    {req.rating && (
                      <div className="flex text-orange-400">{'★'.repeat(req.rating)}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 space-y-8">
            <div className="text-center">
               <h3 className="text-2xl font-black text-gray-800">ประเมินความพึงพอใจ</h3>
               <p className="text-gray-500 text-sm mt-2">Ticket: {ratingTarget.id}</p>
            </div>
            
            <div className="flex justify-center gap-2 text-4xl">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setCurrentRating(star)} className={`transition-all ${currentRating >= star ? 'text-orange-400 scale-110' : 'text-gray-200'}`}>
                   ★
                </button>
              ))}
            </div>

            <textarea placeholder="ข้อเสนอแนะเพิ่มเติม..." className="w-full p-4 bg-gray-50 border rounded-2xl text-sm" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>

            <div className="flex gap-3">
              <button onClick={() => setRatingTarget(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl text-gray-600 font-bold">ภายหลัง</button>
              <button onClick={handleRate} className="flex-1 py-4 btn-primary text-white rounded-2xl font-black">บันทึกคะแนน</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <RepairFormModal user={user} onClose={() => setShowForm(false)} onSubmit={(req) => { onCreateRequest(req); setShowForm(false); }} />
      )}
    </div>
  );
};

export default UserDashboard;
