
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { MaintenanceTask } from '../types';

const MaintenanceSchedule: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<MaintenanceTask>({
    id: '', title: '', assetName: '', location: '', nextDate: '', period: 'Monthly', status: 'Upcoming'
  });

  const loadData = async () => {
    const data = await storage.getMaintenanceSchedule();
    setTasks(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskToSave = { ...formData, id: formData.id || `PM-${Date.now()}` };
    await storage.saveMaintenanceTask(taskToSave);
    setShowModal(false);
    loadData();
    setFormData({ id: '', title: '', assetName: '', location: '', nextDate: '', period: 'Monthly', status: 'Upcoming' });
  };

  return (
    <div className="soft-card animate-fade-in overflow-hidden">
      <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">📅 แผนบำรุงรักษาเชิงป้องกัน</h2>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">Preventive Maintenance Schedule</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-4 text-white font-black rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          เพิ่มแผนงาน
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8">
        {tasks.map(task => (
          <div key={task.id} className="p-6 border rounded-3xl bg-white hover:shadow-lg transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase ${task.status === 'Overdue' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {task.status}
            </div>
            <h4 className="text-lg font-black text-gray-800 mb-2">{task.title}</h4>
            <div className="space-y-2 text-xs font-bold text-gray-500">
              <p className="flex items-center gap-2">📍 {task.location}</p>
              <p className="flex items-center gap-2">⚙️ {task.assetName}</p>
              <p className="flex items-center gap-2">🔁 ทุก {task.period === 'Monthly' ? '1 เดือน' : task.period === 'Quarterly' ? '3 เดือน' : '1 ปี'}</p>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-end">
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Next Service Date</p>
                <p className="text-sm font-black text-blue-600">{new Date(task.nextDate).toLocaleDateString('th-TH')}</p>
              </div>
              <button className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100">
                อัปเดตงาน
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="col-span-full text-center py-20 text-gray-400">ยังไม่มีการกำหนดแผนบำรุงรักษา</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-black mb-6">กำหนดแผนบำรุงรักษา</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="ชื่อแผนงาน (เช่น ล้างแอร์ประจำปี)" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input required placeholder="ครุภัณฑ์/อุปกรณ์" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.assetName} onChange={e => setFormData({...formData, assetName: e.target.value})} />
              <input required placeholder="สถานที่" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <input required type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.nextDate} onChange={e => setFormData({...formData, nextDate: e.target.value})} />
                 <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value as any})}>
                    <option value="Monthly">รายเดือน</option>
                    <option value="Quarterly">รายไตรมาส</option>
                    <option value="Yearly">รายปี</option>
                 </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 py-4 btn-primary text-white rounded-2xl font-black">บันทึกแผน</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSchedule;
