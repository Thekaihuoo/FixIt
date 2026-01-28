
import React, { useState, useMemo } from 'react';
import { RepairRequest, RepairStatus, StatusLabels, StatusColors, PriorityLabels, PriorityColors } from '../types';
import { ASSET_TYPES } from '../constants';
import PrintView from './PrintView';

interface AdminDashboardProps {
  requests: RepairRequest[];
  onUpdateStatus: (id: string, updates: Partial<RepairRequest>) => void;
  onDeleteRequest: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onUpdateStatus, onDeleteRequest }) => {
  const [selectedTicket, setSelectedTicket] = useState<RepairRequest | null>(null);
  const [printTicket, setPrintTicket] = useState<RepairRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const statsByStatus = useMemo(() => {
    return {
      Pending: requests.filter(r => r.status === 'Pending').length,
      InProgress: requests.filter(r => r.status === 'In Progress').length,
      Vendor: requests.filter(r => r.status === 'Vendor Contacted').length,
      Completed: requests.filter(r => r.status === 'Completed').length,
    };
  }, [requests]);

  const cards = [
    { title: 'งานรอรับเรื่อง', count: statsByStatus.Pending, color: 'bg-teal-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'กำลังดำเนินการ', count: statsByStatus.InProgress, color: 'bg-green-400', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { title: 'ส่งซ่อมร้าน', count: statsByStatus.Vendor, color: 'bg-orange-400', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1' },
    { title: 'เสร็จสมบูรณ์', count: statsByStatus.Completed, color: 'bg-blue-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const filteredRequests = requests.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.requester.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (ticket: RepairRequest) => {
    setPrintTicket(ticket);
    setTimeout(() => { window.print(); setPrintTicket(null); }, 300);
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'Ticket ID', 
      'วันที่แจ้ง', 
      'ความเร่งด่วน', 
      'ผู้แจ้ง', 
      'หน่วยงาน', 
      'เบอร์โทร', 
      'ประเภทครุภัณฑ์', 
      'หมายเลขครุภัณฑ์', 
      'ห้อง/สถานที่', 
      'อาการ', 
      'สถานะ', 
      'ค่าใช้จ่าย'
    ];

    const escapeCsv = (val: any) => {
      const s = String(val || '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.join(','),
      ...requests.map(r => [
        escapeCsv(r.id),
        escapeCsv(new Date(r.createdAt).toLocaleString('th-TH')),
        escapeCsv(PriorityLabels[r.priority]),
        escapeCsv(r.requester.name),
        escapeCsv(r.requester.department),
        escapeCsv(r.requester.phone),
        escapeCsv(r.asset.type),
        escapeCsv(r.asset.id_number),
        escapeCsv(r.asset.room),
        escapeCsv(r.symptoms),
        escapeCsv(StatusLabels[r.status]),
        escapeCsv(r.cost || 0)
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fixit_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Overview Cards Grid - Based on attachment style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.color} text-white p-8 category-card flex items-center justify-between shadow-lg`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="bg-white/30 p-2 rounded-xl">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={card.icon}></path></svg>
                 </div>
                 <h3 className="text-xl font-black">{card.title}</h3>
              </div>
              <p className="text-4xl font-black mt-2">{card.count}</p>
            </div>
            <div className="flex flex-col gap-2">
               <button className="p-2 bg-black/10 hover:bg-black/20 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main List Table */}
      <div className="soft-card overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
           <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-gray-800">รายการแจ้งซ่อมทั้งหมด</h3>
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-green-100 transition-all no-print border border-green-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                ส่งออก CSV
              </button>
           </div>
           <div className="relative w-full md:w-80">
              <input type="text" placeholder="ค้นหา Ticket หรือชื่อ..." className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Ticket</th>
                <th className="px-8 py-5">ประเภท</th>
                <th className="px-8 py-5">ผู้แจ้ง</th>
                <th className="px-8 py-5">สถานะ</th>
                <th className="px-8 py-5">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-purple-50/20 transition-all">
                  <td className="px-8 py-6 font-mono font-black text-purple-600">{req.id}</td>
                  <td className="px-8 py-6 font-bold text-gray-700">{req.asset.type}</td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800">{req.requester.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{req.requester.department}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${StatusColors[req.status]}`}>
                      {StatusLabels[req.status]}
                    </span>
                  </td>
                  <td className="px-8 py-6 flex gap-3">
                    <button onClick={() => setSelectedTicket(req)} className="text-blue-600 font-black hover:underline">จัดการ</button>
                    <button onClick={() => handlePrint(req)} className="text-purple-600 font-black hover:underline">พิมพ์</button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic font-bold">ไม่พบรายการที่ค้นหา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-10">
            <h2 className="text-2xl font-black mb-8 border-b pb-4">📝 จัดการ Ticket: {selectedTicket.id}</h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">อัปเดตสถานะ</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={selectedTicket.status} onChange={e => setSelectedTicket({...selectedTicket, status: e.target.value as RepairStatus})}>
                   {Object.entries(StatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase mb-2 block">ค่าใช้จ่ายประมาณการ</label>
                <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={selectedTicket.cost || ''} onChange={e => setSelectedTicket({...selectedTicket, cost: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedTicket(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">ปิดหน้าต่าง</button>
              <button onClick={() => { onUpdateStatus(selectedTicket.id, selectedTicket); setSelectedTicket(null); }} className="flex-1 py-4 btn-primary text-white rounded-2xl font-black">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {printTicket && <PrintView request={printTicket} />}
    </div>
  );
};

export default AdminDashboard;
