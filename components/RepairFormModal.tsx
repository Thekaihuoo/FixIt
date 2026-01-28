
import React, { useState } from 'react';
import { User, RepairRequest, PriorityLevel, PriorityLabels } from '../types';
import { ASSET_TYPES, PRIMARY_COLOR } from '../constants';

interface RepairFormModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (request: Partial<RepairRequest>) => void;
}

const RepairFormModal: React.FC<RepairFormModalProps> = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    phone: '',
    assetType: ASSET_TYPES[0],
    otherType: '',
    assetId: '',
    room: '',
    symptoms: '',
    preferredDate: '',
    preferredTime: '',
    priority: 'Normal' as PriorityLevel
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetType || !formData.symptoms) {
        alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        return;
    }

    const request: Partial<RepairRequest> = {
      priority: formData.priority,
      requester: {
        name: user.name,
        position: user.position || '',
        department: user.dept || '',
        phone: formData.phone,
        username: user.username
      },
      asset: {
        type: formData.assetType,
        otherType: formData.otherType,
        id_number: formData.assetId,
        room: formData.room
      },
      symptoms: formData.symptoms,
      preferredDate: `${formData.preferredDate} ${formData.preferredTime}`.trim(),
      status: 'Pending'
    };

    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-white">
        <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800">📋 กรอกรายละเอียดแจ้งซ่อม</h2>
            <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mt-1">New Repair Request Form</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 text-gray-400 hover:text-red-500 transition-all rounded-2xl hover:bg-red-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Section: ระดับความสำคัญ */}
          <div className="space-y-4">
             <label className="text-sm font-black text-gray-700 block ml-2">ระดับความเร่งด่วน <span className="text-red-500">*</span></label>
             <div className="grid grid-cols-3 gap-3">
                {(['Normal', 'Urgent', 'Critical'] as PriorityLevel[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                      formData.priority === p 
                      ? (p === 'Critical' ? 'border-red-500 bg-red-50 text-red-600 shadow-sm' : p === 'Urgent' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm')
                      : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {PriorityLabels[p]}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-sm">1</span>
                ข้อมูลพื้นฐานผู้แจ้ง
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-100">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">ชื่อ-นามสกุล</label>
                <div className="p-4 bg-white rounded-2xl text-sm font-bold text-gray-700 border border-gray-200">{user.name}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">หน่วยงาน / ฝ่าย</label>
                <div className="p-4 bg-white rounded-2xl text-sm font-bold text-gray-700 border border-gray-200">{user.dept || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-700 ml-1 mb-2">เบอร์โทรศัพท์สำหรับติดต่อกลับ <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-4 bg-white border-gray-200 border focus:border-orange-300 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" 
                  placeholder="ตัวอย่าง 081-234-xxxx"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-600 text-sm">2</span>
                รายละเอียดของอุปกรณ์
            </h3>
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-700 ml-1">เลือกประเภทครุภัณฑ์ที่เสีย <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ASSET_TYPES.map(type => (
                  <label key={type} className={`flex items-center gap-3 text-xs font-bold p-4 border-2 rounded-2xl transition-all cursor-pointer shadow-sm ${formData.assetType === type ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-50 bg-white hover:border-orange-100'}`}>
                    <input type="radio" name="assetType" value={type} checked={formData.assetType === type} onChange={(e) => setFormData({...formData, assetType: e.target.value})} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.assetType === type ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {formData.assetType === type && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-700 ml-1 mb-2">หมายเลขครุภัณฑ์ (ถ้ามี)</label>
                <input type="text" value={formData.assetId} onChange={(e) => setFormData({...formData, assetId: e.target.value})} className="w-full p-4 border-gray-200 border rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-orange-500/10" placeholder="เช่น 123-456-789" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 ml-1 mb-2">ห้อง / สถานที่</label>
                <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full p-4 border-gray-200 border rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-orange-500/10" placeholder="เช่น ห้องสมุด" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-100 text-red-600 text-sm">3</span>
                อาการที่ชำรุด <span className="text-red-500">*</span>
            </h3>
            <textarea required rows={4} value={formData.symptoms} onChange={(e) => setFormData({...formData, symptoms: e.target.value})} className="w-full p-5 border-gray-200 border rounded-3xl text-sm font-medium focus:ring-4 shadow-sm" placeholder="โปรดระบุรายละเอียดปัญหา..."></textarea>
          </div>

          <div className="flex gap-4 justify-end pt-8 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-8 py-4 bg-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-200">ยกเลิก</button>
            <button type="submit" className="px-10 py-4 btn-primary text-white rounded-2xl font-black text-lg transition-all hover:scale-105">ส่งข้อมูลแจ้งซ่อม</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairFormModal;
