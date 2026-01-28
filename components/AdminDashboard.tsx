
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

  const updateStaffAction = (field: string, value: string) => {
    if (!selectedTicket) return;
    setSelectedTicket({
      ...selectedTicket,
      staffAction: {
        ...(selectedTicket.staffAction || {}),
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Overview Cards Grid */}
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

      {/* Enhanced Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-800">🛠️ จัดการ Ticket: <span className="text-purple-600">{selectedTicket.id}</span></h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">วันที่แจ้ง: {new Date(selectedTicket.createdAt).toLocaleString('th-TH')}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Section 1: Requester & Asset Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest border-l-4 border-purple-600 pl-3">👤 ข้อมูลผู้แจ้ง</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">ชื่อ-นามสกุล:</span>
                      <span className="text-sm font-black text-gray-800">{selectedTicket.requester.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">ตำแหน่ง:</span>
                      <span className="text-sm font-bold text-gray-700">{selectedTicket.requester.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">หน่วยงาน:</span>
                      <span className="text-sm font-bold text-gray-700">{selectedTicket.requester.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">เบอร์โทร:</span>
                      <span className="text-sm font-bold text-blue-600">{selectedTicket.requester.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest border-l-4 border-orange-600 pl-3">📦 ข้อมูลครุภัณฑ์</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">ประเภท:</span>
                      <span className="text-sm font-black text-gray-800">{selectedTicket.asset.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">หมายเลขครุภัณฑ์:</span>
                      <span className="text-sm font-bold text-gray-700">{selectedTicket.asset.id_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">ห้อง/สถานที่:</span>
                      <span className="text-sm font-bold text-gray-700">{selectedTicket.asset.room || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold">ความเร่งด่วน:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${PriorityColors[selectedTicket.priority]}`}>
                        {PriorityLabels[selectedTicket.priority]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Symptoms */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest border-l-4 border-red-600 pl-3">⚠️ รายละเอียด/อาการที่แจ้ง</h3>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
                  <p className="text-sm text-gray-700 leading-relaxed italic">{selectedTicket.symptoms}</p>
                </div>
              </div>

              {/* Section 3: Staff Actions & Status Update */}
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">📝 การดำเนินการของเจ้าหน้าที่</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">สถานะปัจจุบัน</label>
                    <select 
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500/20" 
                      value={selectedTicket.status} 
                      onChange={e => setSelectedTicket({...selectedTicket, status: e.target.value as RepairStatus})}
                    >
                      {Object.entries(StatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">ค่าใช้จ่าย (บาท)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500/20" 
                      value={selectedTicket.cost || ''} 
                      onChange={e => setSelectedTicket({...selectedTicket, cost: parseInt(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">ร้าน/บริษัทที่ติดต่อ</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                      value={selectedTicket.staffAction?.vendorName || ''} 
                      onChange={e => updateStaffAction('vendorName', e.target.value)}
                      placeholder="ชื่อร้านซ่อม"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">วันที่แจ้งร้าน</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                      value={selectedTicket.staffAction?.contactDate || ''} 
                      onChange={e => updateStaffAction('contactDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">วันที่เข้าบริการ</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                      value={selectedTicket.staffAction?.serviceDate || ''} 
                      onChange={e => updateStaffAction('serviceDate', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">บันทึกเพิ่มเติม/หมายเหตุ</label>
                  <textarea 
                    rows={3}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" 
                    value={selectedTicket.staffAction?.notes || ''} 
                    onChange={e => updateStaffAction('notes', e.target.value)}
                    placeholder="ระบุการนำเครื่องออก หรือการแก้ไขเบื้องต้น..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t bg-gray-50/50 sticky bottom-0 flex gap-4">
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => handlePrint(selectedTicket)} 
                className="flex-1 py-4 bg-orange-50 text-orange-600 border border-orange-200 rounded-2xl font-black hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                พิมพ์ PDF
              </button>
              <button 
                onClick={() => { onUpdateStatus(selectedTicket.id, selectedTicket); setSelectedTicket(null); }} 
                className="flex-[1.5] py-4 btn-primary text-white rounded-2xl font-black shadow-lg transform active:scale-95 transition-all"
              >
                บันทึกการดำเนินการ
              </button>
            </div>
          </div>
        </div>
      )}

      {printTicket && <PrintView request={printTicket} />}
    </div>
  );
};

export default AdminDashboard;
