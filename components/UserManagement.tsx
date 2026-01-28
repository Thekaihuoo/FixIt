
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [formData, setFormData] = useState({
    user: '',
    pass: '',
    name: '',
    role: 'user',
    position: '',
    dept: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    const data = await storage.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await storage.saveUser(formData);
    setShowAddModal(false);
    loadUsers();
    setFormData({ user: '', pass: '', name: '', role: 'user', position: '', dept: '' });
  };

  const handleBulkAdd = async () => {
    try {
      let usersToAdd: any[] = [];
      try {
        usersToAdd = JSON.parse(bulkInput);
      } catch (e) {
        const lines = bulkInput.trim().split('\n');
        usersToAdd = lines.map(line => {
          const [user, pass, name, role, position, dept] = line.split(',').map(s => s.trim());
          return { user, pass, name, role: role || 'user', position, dept };
        });
      }

      if (usersToAdd.length > 0) {
        await storage.bulkAddUsers(usersToAdd);
        alert(`เพิ่มผู้ใช้สำเร็จ ${usersToAdd.length} รายการ`);
        setBulkInput('');
        setShowBulkModal(false);
        loadUsers();
      }
    } catch (err) {
      alert('รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง');
    }
  };

  const handleDelete = async (username: string) => {
    if (confirm(`🗑️ ยืนยันการลบผู้ใช้: ${username}?\nข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบออก`)) {
      await storage.deleteUser(username);
      loadUsers();
    }
  };

  return (
    <div className="soft-card overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
        <div>
            <h2 className="text-2xl font-black text-gray-800">จัดการข้อมูลผู้ใช้งาน</h2>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">User Database Control</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            เพิ่มแบบกลุ่ม
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-4 btn-secondary text-white rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Username</th>
              <th className="px-8 py-5">ชื่อ-นามสกุล</th>
              <th className="px-8 py-5">ตำแหน่ง/หน่วยงาน</th>
              <th className="px-8 py-5">สิทธิ์การใช้งาน</th>
              <th className="px-8 py-5">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                   <div className="animate-pulse flex flex-col items-center gap-3">
                       <div className="h-4 bg-gray-200 rounded w-40"></div>
                       <p className="text-xs font-bold uppercase tracking-widest">Loading Users...</p>
                   </div>
               </td></tr>
            ) : users.map(u => (
              <tr key={u.user} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">{u.user}</span>
                </td>
                <td className="px-8 py-6 text-sm font-black text-gray-800">{u.name}</td>
                <td className="px-8 py-6 text-xs text-gray-500 font-bold">
                  {u.position || '-'} / <span className="text-blue-500">{u.dept || '-'}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${u.role === 'staff' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                    {u.role === 'staff' ? 'Admin' : 'Requester'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-2">
                      <button 
                        onClick={() => { setFormData(u); setShowAddModal(true); }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                        title="แก้ไขข้อมูล"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(u.user)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100"
                        title="ลบผู้ใช้"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-black text-gray-800 mb-6">{formData.user ? '📝 แก้ไขข้อมูลผู้ใช้' : '✨ เพิ่มผู้ใช้ใหม่'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-black text-gray-700 ml-1 mb-2">Username</label>
                    <input 
                      type="text" required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.user}
                      onChange={e => setFormData({...formData, user: e.target.value})}
                      disabled={!!formData.user && users.some(u => u.user === formData.user)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-black text-gray-700 ml-1 mb-2">Password</label>
                    <input 
                      type="text" required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={formData.pass}
                      onChange={e => setFormData({...formData, pass: e.target.value})}
                    />
                  </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 ml-1 mb-2">ชื่อ-นามสกุล</label>
                <input 
                  type="text" required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 ml-1 mb-2">ตำแหน่ง</label>
                  <input 
                    type="text" className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 ml-1 mb-2">ฝ่าย/หมวดงาน</label>
                  <input 
                    type="text" className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.dept}
                    onChange={e => setFormData({...formData, dept: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 ml-1 mb-2">สิทธิ์การใช้งานระบบ</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="user">ผู้ใช้งาน/ผู้แจ้งซ่อม (User)</option>
                  <option value="staff">ผู้ดูแลระบบ/เจ้าหน้าที่ (Admin)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">ยกเลิก</button>
                <button type="submit" className="px-8 py-4 btn-secondary text-white rounded-2xl font-black shadow-lg">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10">
            <h3 className="text-2xl font-black text-gray-800 mb-2">🚀 เพิ่มผู้ใช้แบบกลุ่ม (Bulk Import)</h3>
            <p className="text-sm text-gray-400 font-bold mb-6">
              รูปแบบการวางข้อมูล: <span className="text-blue-500">username, password, ชื่อ-นามสกุล, role, ตำแหน่ง, ฝ่าย</span>
            </p>
            <textarea 
              rows={8}
              className="w-full p-6 bg-gray-50 border-dashed border-2 border-gray-200 rounded-3xl font-mono text-sm mb-6 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all outline-none"
              placeholder="user01, 1234, นายสมชาย ใจดี, user, ครู, หมวดวิทย์&#10;user02, 1234, นางสาวสมศรี มีสุข, user, ครู, หมวดคณิต"
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowBulkModal(false)} className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">ยกเลิก</button>
              <button onClick={handleBulkAdd} className="px-10 py-4 btn-secondary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">ประมวลผลข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
