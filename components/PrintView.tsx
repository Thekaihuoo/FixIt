
import React from 'react';
import { RepairRequest } from '../types';
import { ASSET_TYPES } from '../constants';

interface PrintViewProps {
  request: RepairRequest;
}

const PrintView: React.FC<PrintViewProps> = ({ request }) => {
  const isType = (t: string) => {
    if (t === 'อื่น ๆ') return ASSET_TYPES.includes(request.asset.type) === false || request.asset.type === 'อื่น ๆ';
    return request.asset.type === t;
  };

  return (
    <div className="print-only max-w-4xl mx-auto p-12 bg-white text-black text-[14pt] leading-relaxed">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-1">แบบฟอร์มการแจ้งซ่อมบำรุงครุภัณฑ์</h1>
        <h2 className="text-xl font-semibold">โรงเรียน Appfreeman</h2>
      </div>

      <div className="space-y-4">
        <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
          ข้าพเจ้า <span className="flex-1 px-4">{request.requester.name}</span> ตำแหน่ง <span className="flex-1 px-4">{request.requester.position}</span>
        </p>
        <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
          หน่วยงาน <span className="flex-1 px-4">{request.requester.department}</span> เบอร์โทร <span className="flex-1 px-4">{request.requester.phone}</span>
        </p>
        
        <p className="mt-4 font-semibold">มีความประสงค์ขออนุมัติซ่อมแซมครุภัณฑ์ ดังนี้</p>
        
        <div className="grid grid-cols-2 gap-y-2 mt-2">
          {ASSET_TYPES.slice(0, 5).map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-5 h-5 border-2 border-black flex items-center justify-center`}>
                {isType(type) && <span className="text-black leading-none">✓</span>}
              </div>
              <span>{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
             <div className={`w-5 h-5 border-2 border-black flex items-center justify-center`}>
                {isType('อื่น ๆ') && <span className="text-black leading-none">✓</span>}
              </div>
              <span className="flex-1 border-b border-dotted border-gray-600">อื่น ๆ {isType('อื่น ๆ') ? (request.asset.otherType || '') : ''}</span>
          </div>
        </div>

        <p className="mt-4 flex items-end border-b border-dotted border-gray-600 pb-1">
          หมายเลขครุภัณฑ์ <span className="flex-1 px-4">{request.asset.id_number}</span> ห้อง <span className="flex-1 px-4">{request.asset.room}</span>
        </p>
        
        <div className="mt-4">
          <p className="font-semibold mb-2">รายละเอียด / อาการ</p>
          <div className="min-h-[150px] border-b border-dotted border-gray-600 pb-1">
            {request.symptoms}
          </div>
        </div>

        <div className="mt-8 flex items-end">
          <p className="flex-1 border-b border-dotted border-gray-600 pb-1">
            โดยสะดวกให้เข้าดำเนินการซ่อมแซม วันที่ <span className="px-4">{request.preferredDate.split(' ')[0]}</span> เวลา <span className="px-4">{request.preferredDate.split(' ')[1]}</span>
          </p>
        </div>

        <div className="mt-12 text-right">
          <div className="inline-block text-center space-y-4">
            <p>ลงชื่อ................................................................ผู้แจ้ง</p>
            <p>( {request.requester.name} )</p>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t-2 border-dashed border-black">
          <p className="font-bold underline text-lg mb-4">ส่วนของเจ้าหน้าที่งานพัสดุ</p>
          <div className="space-y-4">
            <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
              แจ้ง ร้าน/บริษัท <span className="flex-1 px-4">{request.staffAction?.vendorName || '.......................................................'}</span> 
              เมื่อวันที่ <span className="w-40 px-4">{request.staffAction?.contactDate || '.......................'}</span>
              เวลา <span className="w-24 px-4">{request.staffAction?.contactTime || '.......................'}</span>
            </p>
            <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
               ร้าน/บริษัท <span className="flex-1 px-4">{request.staffAction?.vendorName || '.......................................................'}</span> 
               ผู้รับเรื่อง <span className="flex-1 px-4">.......................................................</span>
            </p>
            <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
               เข้ามาให้บริการในวันที่ <span className="flex-1 px-4">{request.staffAction?.serviceDate || '.......................'}</span> 
               เวลา <span className="w-24 px-4">{request.staffAction?.serviceTime || '.......................'}</span>
            </p>
            <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
               หมายเหตุ <span className="flex-1 px-4">{request.staffAction?.notes || '.......................................................'}</span>
            </p>
            <p className="flex items-end border-b border-dotted border-gray-600 pb-1">
               ผู้รับครุภัณฑ์ นำไปซ่อม/ตรวจเช็ค <span className="flex-1 px-4">{request.staffAction?.pickupPerson || '.......................................................'}</span> 
               วันที่ <span className="w-40 px-4">{request.staffAction?.pickupDate || '.......................'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintView;
