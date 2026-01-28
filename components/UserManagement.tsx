
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'user'>('all');
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

  // Filter and Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.dept?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'staff').length,
    requesters: users.filter(u => u.role === 'user').length
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user || !formData.pass || !formData.name) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
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
    <div className="space-y-6 animate-fade-in">
      {/* Stats Dashboard for Users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="soft-card p-6 bg-gradient-to-br from-indigo-50 to-white border-l-8 border-indigo-500">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Users</p>
          <p className="text-3xl font-black text-gray-800">{stats.total}</p>
          <p className="text-xs text-indigo-600 font-bold mt-1">ผู้ใช้งานทั้งหมด</p>
        </div>
        <div className="soft-card p-6 bg-gradient-to-br from-purple-50 to-white border-l-8 border-purple-500">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Admins</p>
          <p className="text-3xl font-black text-gray-800">{stats.admins}</p>
          <p className="text-xs text-purple-600 font-bold mt-1">ผู้ดูแลระบบ</p>
        </div>
        <div className="soft-card p-6 bg-gradient-to-br from-blue-50 to-white border-l-8 border-blue-500">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Requesters</p>
          <p className="text-3xl font-black text-gray-800">{stats.requesters}</p>
          <p className="text-xs text-blue-600 font-bold mt-1">ผู้แจ้งซ่อม</p>
        </div>
      </div>

      <div className="soft-card overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-gray-50/50">
          <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-800">จัดการข้อมูลผู้ใช้งาน</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                 <button onClick={() => setRoleFilter('all')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${roleFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400 hover:text-gray-600'}`}>ทั้งหมด</button>
                 <button onClick={() => setRoleFilter('staff')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${roleFilter === 'staff' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-400 hover:text-gray-600'}`}>Admin</button>
                 <button onClick={() => setRoleFilter('user')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${roleFilter === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-400 hover:text-gray-600'}`}>Requester</button>
              </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, username, หน่วยงาน..." 
                className="pl-12 pr-6 py-4 bg-white border-transparent border rounded-2xl text-sm w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowBulkModal(true)}
                className="p-4 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                title="เพิ่มหลายคน"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </button>
              <button 
                onClick={() => {
                  setFormData({ user: '', pass: '', name: '', role: 'user', position: '', dept: '' });
                  setShowAddModal(true);
                }}
                className="px-8 py-4 btn-primary text-white rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                เพิ่มคนใหม่
              </button>
            </div>
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
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">ไม่พบข้อมูลผู้ใช้งานที่ค้นหา</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.user} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-6">
                      <span className="font-mono text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">{u.user}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${u.role === 'staff' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {u.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-bold">
                    <div className="flex flex-col">
                      <span>{u.position || '-'}</span>
                      <span className="text-indigo-500">{u.dept || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${u.role === 'staff' ? 'bg-purple-50 text-purple-800 border-purple-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                      {u.role === 'staff' ? 'Admin' : 'Requester'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setFormData(u); setShowAddModal(true); }}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
                          title="แก้ไขข้อมูล"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(u.user)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
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

        {/* Individual Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">{formData.user && users.some(u => u.user === formData.user) ? '📝 แก้ไขข้อมูล' : '✨ เพิ่มผู้ใช้ใหม่'}</h3>
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Individual User Profile</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 transition-all rounded-2xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Username <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={formData.user}
                        onChange={e => setFormData({...formData, user: e.target.value})}
                        placeholder="ชื่อผู้เข้าใช้งาน (English only)"
                        disabled={!!formData.user && users.some(u => u.user === formData.user)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          value={formData.pass}
                          onChange={e => setFormData({...formData, pass: e.target.value})}
                          placeholder="รหัสผ่าน"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"}></path></svg>
                        </button>
                      </div>
                    </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="ระบุชื่อจริงและนามสกุล"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">ตำแหน่ง</label>
                    <input 
                      type="text" className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.position}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                      placeholder="เช่น ครู, ช่าง"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">ฝ่าย/หมวดงาน</label>
                    <input 
                      type="text" className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.dept}
                      onChange={e => setFormData({...formData, dept: e.target.value})}
                      placeholder="เช่น หมวดวิทย์"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">สิทธิ์การใช้งานระบบ</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-gray-100 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                  >
                    <option value="user">ผู้ใช้งาน/ผู้แจ้งซ่อม (User)</option>
                    <option value="staff">ผู้ดูแลระบบ/เจ้าหน้าที่ (Admin)</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">ยกเลิก</button>
                  <button type="submit" className="flex-[2] py-4 btn-primary text-white rounded-2xl font-black shadow-lg">บันทึกข้อมูล</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">🚀 เพิ่มผู้ใช้แบบกลุ่ม (Bulk Import)</h3>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Data Processing Center</p>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 transition-all rounded-2xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <p className="text-sm text-gray-400 font-bold mb-6 p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                รูปแบบการวางข้อมูล: <span className="text-blue-600">username, password, ชื่อ-นามสกุล, role, ตำแหน่ง, ฝ่าย</span>
                <br/>* หรือวางข้อมูลรูปแบบ JSON Array ก็ได้
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
                <button onClick={handleBulkAdd} className="px-10 py-4 btn-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">ประมวลผลและบันทึก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
