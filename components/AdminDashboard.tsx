
import React, { useState, useMemo, useEffect } from 'react';
import { RepairRequest, RepairStatus, StatusLabels, StatusColors, PriorityLabels, PriorityColors } from '../types';
import { SECONDARY_COLOR, ASSET_TYPES } from '../constants';
import PrintView from './PrintView';
import UserManagement from './UserManagement';
import InventoryManager from './InventoryManager';
import MaintenanceSchedule from './MaintenanceSchedule';

interface AdminDashboardProps {
  requests: RepairRequest[];
  onUpdateStatus: (id: string, updates: Partial<RepairRequest>) => void;
  onDeleteRequest: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onUpdateStatus, onDeleteRequest }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'insights' | 'inventory' | 'pm'>('requests');
  const [selectedTicket, setSelectedTicket] = useState<RepairRequest | null>(null);
  const [printTicket, setPrintTicket] = useState<RepairRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const handleAfterPrint = () => setPrintTicket(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const stats = {
    pending: requests.filter(r => r.status === 'Pending').length,
    inProgress: requests.filter(r => r.status === 'In Progress' || r.status === 'Vendor Contacted').length,
    completed: requests.filter(r => r.status === 'Completed').length
  };

  const assetTypeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    ASSET_TYPES.forEach(type => counts[type] = 0);
    requests.forEach(req => {
      if (counts[req.asset.type] !== undefined) counts[req.asset.type]++;
      else counts['อื่น ๆ']++;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [requests]);

  const maxCount = Math.max(...assetTypeStats.map(s => s[1]), 1);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.asset.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    onUpdateStatus(selectedTicket.id, selectedTicket);
    setSelectedTicket(null);
  };

  const handlePrint = (ticket: RepairRequest) => {
    setPrintTicket(ticket);
    setTimeout(() => { window.print(); }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 no-print animate-fade-in">
      {/* Dynamic Navigation Bar */}
      <div className="flex flex-wrap gap-4 p-2 bg-white/50 rounded-[2.5rem] w-fit shadow-inner">
        {[
          { id: 'requests', label: 'รายการแจ้งซ่อม', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'orange' },
          { id: 'inventory', label: 'คลังวัสดุ', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'blue' },
          { id: 'pm', label: 'แผนบำรุงรักษา', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'red' },
          { id: 'insights', label: 'สถิติ', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', color: 'green' },
          { id: 'users', label: 'ผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'indigo' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`py-4 px-6 text-xs font-black rounded-[2rem] transition-all flex items-center gap-2 ${activeTab === tab.id ? `bg-white text-${tab.color}-600 shadow-md` : 'text-gray-500 hover:text-gray-800'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon}></path></svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="soft-card p-8 border-l-[12px] border-yellow-400">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
              <p className="text-4xl font-black text-gray-800">{stats.pending}</p>
              <p className="text-xs text-yellow-600 font-bold mt-1">รอรับเรื่อง</p>
            </div>
            <div className="soft-card p-8 border-l-[12px] border-blue-500">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing</p>
              <p className="text-4xl font-black text-gray-800">{stats.inProgress}</p>
              <p className="text-xs text-blue-600 font-bold mt-1">กำลังดำเนินการ</p>
            </div>
            <div className="soft-card p-8 border-l-[12px] border-green-500">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</p>
              <p className="text-4xl font-black text-gray-800">{stats.completed}</p>
              <p className="text-xs text-green-600 font-bold mt-1">เสร็จสมบูรณ์</p>
            </div>
          </div>

          <div className="soft-card overflow-hidden">
             <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
                <input type="text" placeholder="ค้นหา..." className="px-6 py-4 bg-white border-transparent border rounded-2xl text-sm w-full md:w-80 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="px-6 py-4 bg-white border-transparent border rounded-2xl text-sm font-bold shadow-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                   <option value="all">ทุกสถานะ</option>
                   {Object.entries(StatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">TICKET</th>
                        <th className="px-8 py-5">ลำดับความสำคัญ</th>
                        <th className="px-8 py-5">ครุภัณฑ์</th>
                        <th className="px-8 py-5">สถานะ</th>
                        <th className="px-8 py-5">การประเมิน</th>
                        <th className="px-8 py-5">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-orange-50/20">
                          <td className="px-8 py-6 font-mono font-black text-orange-600">{req.id}</td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${PriorityColors[req.priority]}`}>
                                {PriorityLabels[req.priority]}
                             </span>
                          </td>
                          <td className="px-8 py-6 font-bold text-gray-700">{req.asset.type}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase ${StatusColors[req.status]}`}>
                                {StatusLabels[req.status]}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             {req.rating ? (
                               <div className="flex text-orange-400">
                                 {'★'.repeat(req.rating)}{'☆'.repeat(5-req.rating)}
                               </div>
                             ) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="px-8 py-6 flex items-center gap-3">
                             <button onClick={() => setSelectedTicket(req)} className="text-blue-600 font-black hover:underline">จัดการ</button>
                             <button onClick={() => handlePrint(req)} className="text-gray-600 font-black hover:underline">พิมพ์</button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && <InventoryManager />}
      {activeTab === 'pm' && <MaintenanceSchedule />}
      {activeTab === 'insights' && (
        <div className="soft-card p-10 space-y-10">
           <div className="text-center">
              <h2 className="text-3xl font-black text-gray-800">📊 สถิติการแจ้งซ่อมครุภัณฑ์</h2>
              <p className="text-gray-500 mt-2">วิเคราะห์ประเภทอุปกรณ์ที่ชำรุดบ่อยที่สุดเพื่อวางแผนการดูแลรักษา</p>
           </div>
           
           <div className="space-y-6 max-w-4xl mx-auto">
              {assetTypeStats.map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-gray-700">{type}</span>
                    <span className="text-sm font-black text-orange-600">{count} รายการ</span>
                  </div>
                  <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(count / maxCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
      {activeTab === 'users' && <UserManagement />}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 animate-bounce-in">
              <h2 className="text-2xl font-black text-gray-800 mb-6">จัดการ Ticket: {selectedTicket.id}</h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase block mb-2">อัปเดตสถานะ</label>
                    <select className="w-full p-4 bg-gray-50 border rounded-2xl text-sm font-bold" value={selectedTicket.status} onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value as RepairStatus})}>
                       {Object.entries(StatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase block mb-2">ร้านที่ติดต่อ</label>
                        <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm font-bold" value={selectedTicket.staffAction?.vendorName || ''} onChange={(e) => setSelectedTicket({...selectedTicket, staffAction: {...(selectedTicket.staffAction||{}), vendorName: e.target.value}})} />
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase block mb-2">ค่าใช้จ่าย (บาท)</label>
                        <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm font-bold" value={selectedTicket.cost || 0} onChange={(e) => setSelectedTicket({...selectedTicket, cost: parseInt(e.target.value)})} />
                     </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setSelectedTicket(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl text-gray-600 font-bold">ปิด</button>
                    <button type="submit" className="flex-1 py-4 btn-secondary text-white rounded-2xl font-black shadow-lg">บันทึกข้อมูล</button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {printTicket && <PrintView request={printTicket} />}
    </div>
  );
};

export default AdminDashboard;
