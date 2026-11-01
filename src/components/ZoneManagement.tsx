import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  GraduationCap,
  ClipboardCheck,
  Building,
  X,
  Search,
  Lock,
  Trash2,
  Edit,
  Shield,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
} from 'lucide-react';
import { Zone } from '../types';

interface ZoneManagementProps {
  zones: Zone[];
  onAddZone: (newZone: Omit<Zone, 'id'>) => void;
  onUpdateZone: (updatedZone: Zone) => void;
  onDeleteZone: (zoneId: string) => void;
  onInspectZone: (zoneId: string) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
}

export const ZoneManagement: React.FC<ZoneManagementProps> = ({
  zones,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onInspectZone,
  isAdminAuthenticated,
  onOpenAdminLogin,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  // Add Zone Form State
  const [name, setName] = useState<string>('');
  const [locationArea, setLocationArea] = useState<string>('');
  const [assignedClass, setAssignedClass] = useState<string>('');
  const [advisorTeacher, setAdvisorTeacher] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Edit Zone Form State
  const [editName, setEditName] = useState<string>('');
  const [editLocationArea, setEditLocationArea] = useState<string>('');
  const [editAssignedClass, setEditAssignedClass] = useState<string>('');
  const [editAdvisorTeacher, setEditAdvisorTeacher] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assignedClass.trim()) {
      alert('กรุณากรอกชื่อเขตพื้นที่และชั้นเรียนที่รับผิดชอบ');
      return;
    }

    onAddZone({
      name: name.trim(),
      locationArea: locationArea.trim() || 'บริเวณโรงเรียนระโนดวิทยา',
      assignedClass: assignedClass.trim(),
      advisorTeacher: advisorTeacher.trim() || 'ครูประจำชั้น',
      description: description.trim() || undefined,
    });

    setName('');
    setLocationArea('');
    setAssignedClass('');
    setAdvisorTeacher('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleStartEdit = (zone: Zone) => {
    if (!isAdminAuthenticated) {
      onOpenAdminLogin();
      return;
    }
    setEditingZone(zone);
    setEditName(zone.name);
    setEditLocationArea(zone.locationArea);
    setEditAssignedClass(zone.assignedClass);
    setEditAdvisorTeacher(zone.advisorTeacher);
    setEditDescription(zone.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    onUpdateZone({
      ...editingZone,
      name: editName.trim(),
      locationArea: editLocationArea.trim() || 'บริเวณโรงเรียนระโนดวิทยา',
      assignedClass: editAssignedClass.trim(),
      advisorTeacher: editAdvisorTeacher.trim() || 'ครูประจำชั้น',
      description: editDescription.trim() || undefined,
    });

    setEditingZone(null);
  };

  const filteredZones = zones.filter((z) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      z.name.toLowerCase().includes(term) ||
      z.assignedClass.toLowerCase().includes(term) ||
      z.advisorTeacher.toLowerCase().includes(term) ||
      z.locationArea.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2>ผังเขตพื้นที่ทำความสะอาดและความรับผิดชอบ</h2>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            โรงเรียนระโนดวิทยา จัดแบ่งเขตพื้นที่รับผิดชอบตามห้องเรียน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdminAuthenticated && (
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>โหมดจัดการแอดมิน</span>
            </span>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเขต หรือห้องเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-52"
            />
          </div>

          <button
            onClick={() => {
              if (!isAdminAuthenticated) {
                onOpenAdminLogin();
              } else {
                setShowAddModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
          >
            {isAdminAuthenticated ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-blue-200" />}
            <span>{isAdminAuthenticated ? 'เพิ่มเขตพื้นที่ใหม่' : 'เพิ่มเขตพื้นที่ (แอดมิน)'}</span>
          </button>
        </div>
      </div>

      {/* Master Zone Map Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 border border-white/10">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">แผนผังเขตพื้นที่ทำความสะอาด โรงเรียนระโนดวิทยา</h3>
              <p className="text-xs text-blue-200/80">แผนผังรวมแสดงตำแหน่งเขตรับผิดชอบของ ม.1 - ม.6 และ ปวช.</p>
            </div>
          </div>
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ขยายดูแผนผังขนาดเต็ม</span>
          </button>
        </div>

        {/* Map Image Banner Container */}
        <div
          className="relative group bg-slate-100 flex items-center justify-center p-2 sm:p-4 cursor-pointer overflow-hidden max-h-[480px]"
          onClick={() => setIsMapModalOpen(true)}
          title="คลิกเพื่อดูรูปภาพแผนผังขนาดเต็ม"
        >
          <img
            src="/school_zone_map.jpg"
            alt="แผนผังเขตพื้นที่ทำความสะอาด โรงเรียนระโนดวิทยา"
            className="w-full max-h-[440px] object-contain rounded-xl shadow-xs transition duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2 text-white font-bold text-sm backdrop-blur-xs">
            <ZoomIn className="w-5 h-5" />
            <span>คลิกเพื่อดูแผนผังขนาดใหญ่ (Full View)</span>
          </div>
        </div>
      </div>

      {/* Grid of Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                  ห้อง {zone.assignedClass}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {zone.locationArea}
                  </span>

                  {/* Admin controls: Edit & Delete */}
                  {isAdminAuthenticated && (
                    <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
                      <button
                        onClick={() => handleStartEdit(zone)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="แก้ไขข้อมูลเขตนี้ (เฉพาะแอดมิน)"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบเขต "${zone.name}" ใช่หรือไม่?`)) {
                            onDeleteZone(zone.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="ลบเขตนี้ (เฉพาะแอดมิน)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-base mt-2.5 leading-snug">
                {zone.name}
              </h3>

              {zone.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{zone.description}</p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>ครูที่ปรึกษา: <strong className="text-slate-700">{zone.advisorTeacher}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onInspectZone(zone.id)}
                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>บันทึกตรวจเขตนี้</span>
              </button>

              {isAdminAuthenticated && (
                <button
                  onClick={() => handleStartEdit(zone)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  title="แก้ไขเขต"
                >
                  แก้ไข
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>เพิ่มเขตพื้นที่ทำความสะอาด</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อเขตพื้นที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หน้าอาคาร 3 หรือ โซนแปลงเกษตร"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชั้นเรียนที่รับผิดชอบ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ม.1/2 หรือ ม.4/3"
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    บริเวณ / อาคาร
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น อาคาร 2 ชั้น 1"
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ครูที่ปรึกษา
                </label>
                <input
                  type="text"
                  placeholder="ชื่อครูที่ปรึกษา"
                  value={advisorTeacher}
                  onChange={(e) => setAdvisorTeacher(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบายขอบเขตงาน
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ปัดกวาดใบไม้ เทถังขยะ และจัดโต๊ะเก้าอี้..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  บันทึกเขตพื้นที่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal (Admin only) */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>แก้ไขเขตพื้นที่ทำความสะอาด</span>
              </h3>
              <button
                onClick={() => setEditingZone(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อเขตพื้นที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชั้นเรียนที่รับผิดชอบ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAssignedClass}
                    onChange={(e) => setEditAssignedClass(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    บริเวณ / อาคาร
                  </label>
                  <input
                    type="text"
                    value={editLocationArea}
                    onChange={(e) => setEditLocationArea(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ครูที่ปรึกษา
                </label>
                <input
                  type="text"
                  value={editAdvisorTeacher}
                  onChange={(e) => setEditAdvisorTeacher(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบายขอบเขตงาน
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`คุณต้องการลบเขต "${editingZone.name}" ใช่หรือไม่?`)) {
                      onDeleteZone(editingZone.id);
                      setEditingZone(null);
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  ลบเขตพื้นที่นี้
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingZone(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition shadow-xs cursor-pointer"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Map Modal */}
      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-5xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    แผนผังเขตพื้นที่ทำความสะอาด โรงเรียนระโนดวิทยา
                  </h3>
                  <p className="text-xs text-slate-500">
                    แสดงผังการจัดแบ่งเขตพื้นที่ทำความสะอาด ม.1 - ม.6 และ ปวช.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-auto bg-slate-100 rounded-xl p-2 flex items-center justify-center">
              <img
                src="/school_zone_map.jpg"
                alt="แผนผังเขตพื้นที่ทำความสะอาด โรงเรียนระโนดวิทยา"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
