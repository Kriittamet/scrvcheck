import React from 'react';
import {
  School,
  ShieldCheck,
  Shield,
  Settings,
  LogOut,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { InspectorRole } from '../types';

interface HeaderProps {
  currentRole: InspectorRole;
  onRoleChange: (role: InspectorRole) => void;
  inspectorName: string;
  onInspectorNameChange: (name: string) => void;
  onResetData: () => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminSettings: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  inspectorName,
  onInspectorNameChange,
  onResetData,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onOpenAdminSettings,
  onLogoutAdmin,
}) => {
  const getRoleIcon = (role: InspectorRole) => {
    switch (role) {
      case 'committee':
        return <ShieldCheck className="w-4 h-4 text-amber-200" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-300" />;
    }
  };

  const handleRoleSelect = (newRole: InspectorRole) => {
    if (newRole === 'admin' && !isAdminAuthenticated) {
      // Prompt admin login modal instead of directly switching
      onOpenAdminLogin();
      return;
    }
    onRoleChange(newRole);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* School Brand & Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner shrink-0 text-white">
            <School className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                โรงเรียนระโนดวิทยา
              </h1>
              <span className="text-[11px] font-medium bg-blue-700/80 text-blue-100 px-2 py-0.5 rounded-full border border-blue-400/30">
                สพม.สงขลา สตูล
              </span>
            </div>
            <p className="text-xs text-blue-200/90 font-light">
              ระบบตรวจเขตพื้นที่ทำความสะอาดและความเป็นระเบียบเรียบร้อย
            </p>
          </div>
        </div>

        {/* User Identity, Role Selector, and Admin Access */}
        <div className="flex flex-wrap items-center gap-2 bg-blue-950/50 p-1.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 px-2">
            {getRoleIcon(currentRole)}
            <span className="text-xs text-blue-200 hidden sm:inline">บทบาท:</span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleSelect(e.target.value as InspectorRole)}
              className="bg-blue-800/90 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 border border-blue-500/40 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition"
            >
              <option value="committee">กรรมการสภานักเรียน</option>
              <option value="admin">
                {isAdminAuthenticated ? '🛡️ ผู้ดูแลระบบ (เข้าสู่ระบบแล้ว)' : '🔒 ผู้ดูแลระบบ (ต้องใส่รหัสผ่าน)'}
              </option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-blue-700/50">
            <span className="text-xs text-blue-200">ชื่อผู้ตรวจ:</span>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => onInspectorNameChange(e.target.value)}
              placeholder="กรอกชื่อผู้ตรวจ"
              className="bg-blue-900/60 text-white text-xs px-2.5 py-1 rounded-md border border-blue-600/50 focus:outline-none focus:ring-1 focus:ring-blue-400 w-36"
            />
          </div>

          {/* Admin Status Controls */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1 pl-2 border-l border-blue-700/50">
              <button
                onClick={onOpenAdminSettings}
                title="ตั้งค่าและจัดการระบบแอดมิน"
                className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">จัดการระบบ</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                title="ออกจากระบบแอดมิน"
                className="p-1.5 text-red-200 hover:text-white hover:bg-red-800/60 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 text-xs bg-blue-700/80 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition cursor-pointer"
              title="เข้าสู่ระบบผู้ดูแลระบบ"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-200" />
              <span>เข้าสู่ระบบแอดมิน</span>
            </button>
          )}

          <button
            onClick={onResetData}
            title="รีเซ็ตข้อมูลตัวอย่างสำหรับทดสอบ"
            className="text-xs text-blue-200/70 hover:text-white hover:bg-blue-800/60 p-1.5 rounded-lg transition ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
