
import React from 'react';
import { RepairRequest } from '../types';
import { ASSET_TYPES, LOGO_URL } from '../constants';

interface PrintViewProps {
  request: RepairRequest;
}

const PrintView: React.FC<PrintViewProps> = ({ request }) => {
  const isType = (t: string) => {
    if (t === 'อื่น ๆ') return ASSET_TYPES.includes(request.asset.type) === false || request.asset.type === 'อื่น ๆ';
    return request.asset.type === t;
  };

  const formattedDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="print-only bg-white text-black p-0 leading-relaxed font-['Sarabun']" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
      {/* Header Area */}
      <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-6">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="Logo" className="h-16 w-auto object-contain" />
          <div className="text-left">
            <h1 className="text-2xl font-black">โรงเรียน Appfreeman</h1>
            <p className="text-sm font-bold">ระบบบริหารจัดการและแจ้งซ่อมครุภัณฑ์ออนไลน์</p>
          </div>
        </div>
        <div className="text-right">
          <div className="border-2 border-black px-4 py-2 font-black text-lg">
            No. {request.id}
          </div>
          <p className="text-xs mt-2 font-bold uppercase tracking-widest text-gray-500">Repair Tracking Form</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-black underline decoration-2 underline-offset-8">ใบคำร้องขอรับบริการซ่อมบำรุงครุภัณฑ์</h2>
      </div>

      <div className="space-y-6 text-[12pt]">
        <div className="flex flex-wrap items-end">
          <span className="font-bold">วันที่แจ้งซ่อม:</span>
          <span className="flex-1 px-3 border-b border-dotted border-black">{formattedDate(request.createdAt)}</span>
        </div>

        <div className="flex flex-wrap items-end gap-x-4">
          <span className="font-bold">ชื่อผู้แจ้ง:</span>
          <span className="flex-1 px-3 border-b border-dotted border-black">{request.requester.name}</span>
          <span className="font-bold">ตำแหน่ง:</span>
          <span className="w-48 px-3 border-b border-dotted border-black">{request.requester.position}</span>
        </div>

        <div className="flex flex-wrap items-end gap-x-4">
          <span className="font-bold">หน่วยงาน/ฝ่าย:</span>
          <span className="flex-1 px-3 border-b border-dotted border-black">{request.requester.department}</span>
          <span className="font-bold">เบอร์โทรศัพท์:</span>
          <span className="w-48 px-3 border-b border-dotted border-black">{request.requester.phone}</span>
        </div>
        
        <div className="mt-8">
          <p className="font-black text-lg mb-3">1. รายละเอียดครุภัณฑ์ที่แจ้งซ่อม</p>
          <div className="grid grid-cols-2 gap-y-3 pl-4">
            {ASSET_TYPES.slice(0, 5).map(type => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-gray-50">
                  {isType(type) && <span className="text-xl leading-none">✓</span>}
                </div>
                <span className={isType(type) ? 'font-bold' : ''}>{type}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-gray-50">
                  {isType('อื่น ๆ') && <span className="text-xl leading-none">✓</span>}
                </div>
                <div className="flex-1 flex items-end">
                  <span className="whitespace-nowrap">อื่น ๆ:</span>
                  <span className="flex-1 border-b border-dotted border-black px-2 min-w-[50px]">
                    {isType('อื่น ๆ') ? (request.asset.otherType || '') : ''}
                  </span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 mt-6">
          <span className="font-bold">หมายเลขครุภัณฑ์:</span>
          <span className="flex-1 px-3 border-b border-dotted border-black font-mono">{request.asset.id_number}</span>
          <span className="font-bold">ห้อง/สถานที่:</span>
          <span className="w-48 px-3 border-b border-dotted border-black">{request.asset.room}</span>
        </div>
        
        <div className="mt-6">
          <p className="font-bold mb-2">2. รายละเอียดอาการชำรุด/ปัญหาที่พบ:</p>
          <div className="min-h-[100px] p-4 border border-black bg-gray-50 rounded-sm italic leading-relaxed">
            {request.symptoms}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 mt-6">
          <span className="font-bold">วัน/เวลาที่สะดวกให้เข้าซ่อม:</span>
          <span className="flex-1 px-3 border-b border-dotted border-black">{request.preferredDate}</span>
        </div>

        <div className="mt-12 flex justify-end">
          <div className="text-center space-y-4 w-[250px]">
            <p>ลงชื่อ................................................................</p>
            <p>( {request.requester.name} )</p>
            <p>ผู้แจ้งความประสงค์</p>
          </div>
        </div>

        {/* Staff Action Part */}
        <div className="mt-12 pt-8 border-t-4 border-double border-black">
          <p className="font-black text-xl underline mb-6">3. ส่วนของเจ้าหน้าที่งานพัสดุ / การดำเนินการ</p>
          <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-x-2">
              <span>แจ้ง ร้าน/บริษัท:</span>
              <span className="flex-1 border-b border-dotted border-black px-2">{request.staffAction?.vendorName || ''}</span> 
              <span>เมื่อวันที่:</span>
              <span className="w-40 border-b border-dotted border-black px-2 text-center">{request.staffAction?.contactDate ? formattedDate(request.staffAction.contactDate) : ''}</span>
            </div>
            
            <div className="flex flex-wrap items-end gap-x-2">
               <span>กำหนดเข้ามาให้บริการในวันที่:</span>
               <span className="flex-1 border-b border-dotted border-black px-2 text-center">{request.staffAction?.serviceDate ? formattedDate(request.staffAction.serviceDate) : ''}</span>
               <span>เวลา:</span>
               <span className="w-32 border-b border-dotted border-black px-2 text-center">{request.staffAction?.serviceTime || ''}</span>
            </div>
            
            <div className="flex flex-wrap items-end gap-x-2">
               <span>ผลการดำเนินการ/หมายเหตุ:</span>
               <span className="flex-1 border-b border-dotted border-black px-2">{request.staffAction?.notes || ''}</span>
            </div>

            <div className="grid grid-cols-2 gap-10 pt-10">
              <div className="text-center space-y-3">
                <p>ลงชื่อ................................................................</p>
                <p>( ................................................................ )</p>
                <p>เจ้าหน้าที่รับแจ้ง</p>
              </div>
              <div className="text-center space-y-3">
                <p>ลงชื่อ................................................................</p>
                <p>( ................................................................ )</p>
                <p>หัวหน้างานพัสดุ/ผู้อนุมัติ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Print Info */}
      <div className="absolute bottom-10 left-20 right-20 flex justify-between text-[8pt] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100 pt-2">
        <span>FixIt Management Intelligence System</span>
        <span>Generated on: {new Date().toLocaleString('th-TH')}</span>
      </div>
    </div>
  );
};

export default PrintView;
