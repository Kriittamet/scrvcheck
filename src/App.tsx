/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { InspectionForm } from './components/InspectionForm';
import { DailyReport } from './components/DailyReport';
import { MonthlyReport } from './components/MonthlyReport';
import { ZoneManagement } from './components/ZoneManagement';
import { ImageModal } from './components/ImageModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { InspectionRecord, Zone, InspectorRole } from './types';
import { INITIAL_INSPECTIONS, INITIAL_ZONES } from './data/mockData';
import { isSameDay } from './utils/helpers';
import { Shield, Building2, CheckCircle2 } from 'lucide-react';

const STORAGE_INSPECTIONS_KEY = 'ranot_inspections_v7';
const STORAGE_ZONES_KEY = 'ranot_zones_v7';
const STORAGE_ROLE_KEY = 'ranot_role_v7';
const STORAGE_NAME_KEY = 'ranot_inspector_name_v7';
const STORAGE_ADMIN_PASSWORD_KEY = 'ranot_admin_password_v7';
const STORAGE_ADMIN_AUTH_KEY = 'ranot_admin_auth_v7';

export default function App() {
  // Load initial data from localStorage with fallback to default mock data
  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INSPECTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse inspections from localStorage', e);
    }
    return INITIAL_INSPECTIONS;
  });

  const [zones, setZones] = useState<Zone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ZONES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse zones from localStorage', e);
    }
    return INITIAL_ZONES;
  });

  const [currentRole, setCurrentRole] = useState<InspectorRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY) as string;
      if (saved === 'committee' || saved === 'admin') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'committee';
  });

  const [inspectorName, setInspectorName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NAME_KEY);
      if (saved && saved !== 'นักเรียนเวรประจำวัน') return saved;
    } catch {
      // fallback
    }
    return 'กรรมการสภานักเรียน';
  });

  // Admin authentication state & password
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return 'scrv90140';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_AUTH_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('record');
  const [preselectedZoneId, setPreselectedZoneId] = useState<string | undefined>(undefined);

  // Modal Image State
  const [modalImage, setModalImage] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INSPECTIONS_KEY, JSON.stringify(inspections));
    } catch (e) {
      console.error('Storage quota reached or error saving inspections', e);
    }
  }, [inspections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ZONES_KEY, JSON.stringify(zones));
    } catch (e) {
      console.error('Error saving zones', e);
    }
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLE_KEY, currentRole);
    } catch {
      // fallback
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NAME_KEY, inspectorName);
    } catch {
      // fallback
    }
  }, [inspectorName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ADMIN_PASSWORD_KEY, adminPassword);
    } catch {
      // fallback
    }
  }, [adminPassword]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ADMIN_AUTH_KEY, isAdminAuthenticated ? 'true' : 'false');
    } catch {
      // fallback
    }
  }, [isAdminAuthenticated]);

  // Handle role change and prefill default name suggestion
  const handleRoleChange = (role: InspectorRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'committee':
        setInspectorName('กรรมการสภานักเรียน');
        break;
      case 'admin':
        setInspectorName('ผู้ดูแลระบบงานอาคารสถานที่');
        break;
    }
  };

  // Admin login success callback
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentRole('admin');
    setInspectorName('ผู้ดูแลระบบงานอาคารสถานที่');
  };

  // Logout admin
  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (currentRole === 'admin') {
      setCurrentRole('committee');
      setInspectorName('กรรมการสภานักเรียน');
    }
  };

  // Update admin password
  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
  };

  // Add new inspection
  const handleSaveRecord = (recordData: Omit<InspectionRecord, 'id' | 'date'>) => {
    const newRecord: InspectionRecord = {
      ...recordData,
      id: `insp-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setInspections((prev) => [newRecord, ...prev]);
  };

  // Delete an inspection
  const handleDeleteRecord = (id: string) => {
    setInspections((prev) => prev.filter((r) => r.id !== id));
  };

  // Toggle resolved status for failed inspections
  const handleToggleResolved = (id: string) => {
    setInspections((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, resolved: !r.resolved };
        }
        return r;
      })
    );
  };

  // Add new zone
  const handleAddZone = (newZoneData: Omit<Zone, 'id'>) => {
    const newZone: Zone = {
      ...newZoneData,
      id: `z-${Date.now()}`,
    };
    setZones((prev) => [...prev, newZone]);
  };

  // Update zone (Admin only)
  const handleUpdateZone = (updatedZone: Zone) => {
    setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
  };

  // Delete zone (Admin only)
  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  };

  // Reset today's inspections (Admin only)
  const handleResetTodayInspections = () => {
    const today = new Date();
    setInspections((prev) => prev.filter((r) => !isSameDay(r.date, today)));
  };

  // Reset all inspection records (Admin only)
  const handleResetAllInspections = () => {
    setInspections([]);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลเป็นชุดตัวอย่างของโรงเรียนระโนดวิทยาใช่หรือไม่?')) {
      setInspections(INITIAL_INSPECTIONS);
      setZones(INITIAL_ZONES);
      alert('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // Open modal photo
  const handleViewImage = (imageUrl: string, title: string, subtitle?: string) => {
    setModalImage({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  // Quick inspect specific zone
  const handleInspectZone = (zoneId: string) => {
    setPreselectedZoneId(zoneId);
    setActiveTab('record');
  };

  // Compute today's counts for navbar badge
  const today = new Date();
  const todayInspections = inspections.filter((rec) => isSameDay(rec.date, today));
  const todayCount = todayInspections.length;
  const todayFailCount = todayInspections.filter((r) => r.status === 'fail').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Header with Role Selector & Admin Access */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        inspectorName={inspectorName}
        onInspectorNameChange={setInspectorName}
        onResetData={handleResetData}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onOpenAdminSettings={() => setShowAdminSettingsModal(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayCount={todayCount}
        todayFailCount={todayFailCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'record' && (
          <InspectionForm
            zones={zones}
            currentRole={currentRole}
            inspectorName={inspectorName}
            onSaveRecord={handleSaveRecord}
            onViewDaily={() => setActiveTab('daily')}
            preselectedZoneId={preselectedZoneId}
          />
        )}

        {activeTab === 'daily' && (
          <DailyReport
            inspections={inspections}
            onDeleteRecord={handleDeleteRecord}
            onToggleResolved={handleToggleResolved}
            onViewImage={handleViewImage}
            onNavigateToRecord={() => setActiveTab('record')}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
            onResetTodayInspections={handleResetTodayInspections}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReport
            inspections={inspections}
            zones={zones}
            onDeleteRecord={handleDeleteRecord}
            onViewImage={handleViewImage}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
            onResetAllInspections={handleResetAllInspections}
          />
        )}

        {activeTab === 'zones' && (
          <ZoneManagement
            zones={zones}
            onAddZone={handleAddZone}
            onUpdateZone={handleUpdateZone}
            onInspectZone={handleInspectZone}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
            onDeleteZone={handleDeleteZone}
          />
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        adminPasswordHash={adminPassword}
      />

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={showAdminSettingsModal}
        onClose={() => setShowAdminSettingsModal(false)}
        adminPassword={adminPassword}
        onUpdatePassword={handleUpdateAdminPassword}
        onLogoutAdmin={handleLogoutAdmin}
        onResetData={handleResetData}
        onClearInspections={() => {
          setInspections([]);
          alert('ล้างประวัติการตรวจทั้งหมดเรียบร้อยแล้ว');
        }}
        inspections={inspections}
        zones={zones}
      />

      {/* Image Modal Preview */}
      <ImageModal
        isOpen={modalImage.isOpen}
        onClose={() => setModalImage((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={modalImage.imageUrl}
        title={modalImage.title}
        subtitle={modalImage.subtitle}
      />

      {/* School Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">โรงเรียนระโนดวิทยา (Ranot Wittaya School)</p>
              <p className="text-[11px] text-slate-400">
                129 หมู่ 6 ต.ระโนด อ.ระโนด จ.สงขลา 90140 | สพม.สงขลา สตูล
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>งานส่งเสริมวินัยและสุขอนามัยสิ่งแวดล้อม</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ระบบพร้อมใช้งานออฟไลน์ (Local Database)</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
