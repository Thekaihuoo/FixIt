
import React, { useState } from 'react';
import { User, RepairRequest, PriorityLevel, PriorityLabels } from '../types';
import { ASSET_TYPES } from '../constants';
import { GoogleGenAI } from "@google/genai";

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
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAssist = async () => {
    if (!formData.symptoms || formData.symptoms.length < 5) {
      alert('กรุณากรอกอาการเบื้องต้นอย่างน้อย 5 ตัวอักษรเพื่อให้ AI ช่วยวิเคราะห์');
      return;
    }

    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `คุณคือผู้เชี่ยวชาญด้านการซ่อมบำรุงครุภัณฑ์ในโรงเรียน 
        ผู้ใช้งานแจ้งอาการเสียมาว่า: "${formData.symptoms}" 
        สำหรับอุปกรณ์ประเภท: "${formData.assetType}"
        
        งานของคุณคือ:
        1. เรียบเรียงคำอธิบายอาการเสียให้เป็นภาษาระบบซ่อมที่เป็นทางการและชัดเจนสำหรับช่าง
        2. แนะนำระดับความเร่งด่วน (Normal, Urgent, หรือ Critical) พร้อมเหตุผลสั้นๆ
        
        ตอบกลับในรูปแบบ JSON เท่านั้น:
        {
          "refinedSymptoms": "คำอธิบายที่เรียบเรียงใหม่",
          "suggestedPriority": "Priority Level",
          "reason": "เหตุผลสั้นๆ"
        }`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.refinedSymptoms) {
        setFormData(prev => ({
          ...prev,
          symptoms: result.refinedSymptoms,
          priority: (['Normal', 'Urgent', 'Critical'].includes(result.suggestedPriority) ? result.suggestedPriority : prev.priority) as PriorityLevel
        }));
        alert(`AI วิเคราะห์เสร็จสิ้น!\nคำแนะนำ: ${result.reason}`);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert('ขออภัย ระบบ AI ไม่สามารถวิเคราะห์ได้ในขณะนี้');
    } finally {
      setAiLoading(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white/95 soft-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border-none">
        <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800">📋 รายละเอียดการแจ้งซ่อม</h2>
            <p className="text-xs text-orange-500 font-extrabold uppercase tracking-widest mt-1">New Repair Request</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 text-gray-400 hover:text-red-500 transition-all rounded-2xl hover:bg-red-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4">
             <div className="flex justify-between items-center ml-2">
                <label className="text-sm font-black text-gray-700">ระดับความเร่งด่วน <span className="text-red-500">*</span></label>
             </div>
             <div className="grid grid-cols-3 gap-3">
                {(['Normal', 'Urgent', 'Critical'] as PriorityLevel[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                      formData.priority === p 
                      ? (p === 'Critical' ? 'border-red-500 bg-red-50 text-red-600' : p === 'Urgent' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-blue-500 bg-blue-50 text-blue-600')
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                    }`}
                  >
                    {PriorityLabels[p]}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-600 text-sm">1</span>
                ข้อมูลครุภัณฑ์
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASSET_TYPES.map(type => (
                  <label key={type} className={`flex items-center justify-center text-[10px] font-black p-4 border-2 rounded-2xl transition-all cursor-pointer ${formData.assetType === type ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-inner' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                    <input type="radio" name="assetType" value={type} checked={formData.assetType === type} onChange={(e) => setFormData({...formData, assetType: e.target.value})} className="hidden" />
                    {type.split(' (')[0]}
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="หมายเลขครุภัณฑ์" value={formData.assetId} onChange={(e) => setFormData({...formData, assetId: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold shadow-inner" />
                 <input type="text" placeholder="ห้อง/สถานที่" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold shadow-inner" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 text-sm">2</span>
                    อาการที่ชำรุด <span className="text-red-500">*</span>
                </h3>
                <button 
                  type="button" 
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className={`btn-ai px-4 py-2 text-white text-[10px] font-black rounded-xl flex items-center gap-2 transition-all ${aiLoading ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
                >
                  {aiLoading ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : '🤖 AI ช่วยวิเคราะห์'}
                </button>
            </div>
            <textarea required rows={4} value={formData.symptoms} onChange={(e) => setFormData({...formData, symptoms: e.target.value})} className="w-full p-5 bg-gray-50 rounded-3xl border-none text-sm font-medium shadow-inner focus:ring-2 focus:ring-indigo-500/20" placeholder="ระบุอาการเสียที่พบ... (เช่น เปิดเครื่องไม่ติด, แอร์ไม่เย็น)"></textarea>
          </div>

          <div className="pt-6 border-t flex gap-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl text-gray-500 font-bold hover:bg-gray-200 transition-colors">ยกเลิก</button>
             <button type="submit" className="flex-[2] py-4 btn-primary text-white rounded-2xl font-black shadow-lg">ยืนยันการแจ้งซ่อม</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairFormModal;
