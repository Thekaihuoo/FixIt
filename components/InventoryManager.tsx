
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { InventoryItem } from '../types';

const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<InventoryItem>({
    id: '', name: '', category: 'อะไหล่คอมพิวเตอร์', stock: 0, unit: 'ชิ้น', minStock: 5, lastUpdated: ''
  });

  const loadData = async () => {
    const data = await storage.getInventory();
    setItems(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = { 
      ...formData, 
      id: formData.id || `INV-${Date.now()}`,
      lastUpdated: new Date().toISOString() 
    };
    await storage.saveInventoryItem(itemToSave);
    setShowModal(false);
    loadData();
    setFormData({ id: '', name: '', category: 'อะไหล่คอมพิวเตอร์', stock: 0, unit: 'ชิ้น', minStock: 5, lastUpdated: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันการลบวัสดุนี้ออกจากคลัง?')) {
      await storage.deleteInventoryItem(id);
      loadData();
    }
  };

  return (
    <div className="soft-card animate-fade-in overflow-hidden">
      <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">📦 คลังวัสดุและอะไหล่</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Inventory Management System</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-secondary px-6 py-4 text-white font-black rounded-2xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          เพิ่มรายการใหม่
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">ชื่อรายการ</th>
              <th className="px-8 py-5">หมวดหมู่</th>
              <th className="px-8 py-5 text-center">คงเหลือ</th>
              <th className="px-8 py-5">หน่วย</th>
              <th className="px-8 py-5">สถานะสต็อก</th>
              <th className="px-8 py-5">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/20">
                <td className="px-8 py-6 font-bold text-gray-800">{item.name}</td>
                <td className="px-8 py-6 text-gray-500">{item.category}</td>
                <td className="px-8 py-6 text-center font-black">{item.stock}</td>
                <td className="px-8 py-6 text-gray-500">{item.unit}</td>
                <td className="px-8 py-6">
                  {item.stock <= item.minStock ? (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Low Stock</span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Healthy</span>
                  )}
                </td>
                <td className="px-8 py-6 flex gap-3">
                   <button onClick={() => { setFormData(item); setShowModal(true); }} className="text-blue-600 hover:underline">แก้ไข</button>
                   <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-black mb-6">บันทึกข้อมูลคลัง</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1">ชื่อวัสดุ/อะไหล่</label>
                <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1">หมวดหมู่</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                   <option>อะไหล่คอมพิวเตอร์</option>
                   <option>วัสดุไฟฟ้า</option>
                   <option>วัสดุสำนักงาน</option>
                   <option>งานอาคารสถานที่</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">จำนวนคงเหลือ</label>
                    <input required type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">หน่วยเรียก</label>
                    <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                 </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 py-4 btn-secondary text-white rounded-2xl font-black">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
