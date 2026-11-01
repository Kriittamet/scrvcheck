import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Building,
  TrendingUp,
  AlertOctagon,
  Eye,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { InspectionRecord, Zone } from '../types';
import { formatThaiDate, formatThaiTime, exportToCSV } from '../utils/helpers';

interface MonthlyReportProps {
  inspections: InspectionRecord[];
  zones: Zone[];
  onDeleteRecord: (id: string) => void;
  onViewImage: (imageUrl: string, title: string, subtitle?: string) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onResetAllInspections: () => void;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  inspections,
  zones,
  onDeleteRecord,
  onViewImage,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onResetAllInspections,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | 'thisMonth' | 'last7Days'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

  // Filter records based on selected timeframe
  const filteredByTime = useMemo(() => {
    const now = new Date();
    return inspections.filter((rec) => {
      const recDate = new Date(rec.date);
      if (timeRange === 'last7Days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recDate >= sevenDaysAgo;
      }
      if (timeRange === 'thisMonth') {
        return (
          recDate.getMonth() === now.getMonth() &&
          recDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [inspections, timeRange]);

  // Overall statistics
  const total = filteredByTime.length;
  const passCount = filteredByTime.filter((r) => r.status === 'pass').length;
  const failCount = filteredByTime.filter((r) => r.status === 'fail').length;
  const passPercentage = total > 0 ? Math.round((passCount / total) * 100) : 0;

  // Calculate zone performance breakdown
  const zoneStats = useMemo(() => {
    const statsMap: Record<
      string,
      {
        zoneName: string;
        assignedClass: string;
        total: number;
        pass: number;
        fail: number;
      }
    > = {};

    zones.forEach((z) => {
      statsMap[z.id] = {
        zoneName: z.name,
        assignedClass: z.assignedClass,
        total: 0,
        pass: 0,
        fail: 0,
      };
    });

    filteredByTime.forEach((rec) => {
      if (!statsMap[rec.zoneId]) {
        statsMap[rec.zoneId] = {
          zoneName: rec.zoneName,
          assignedClass: rec.assignedClass || '',
          total: 0,
          pass: 0,
          fail: 0,
        };
      }
      statsMap[rec.zoneId].total += 1;
      if (rec.status === 'pass') statsMap[rec.zoneId].pass += 1;
      if (rec.status === 'fail') statsMap[rec.zoneId].fail += 1;
    });

    return Object.entries(statsMap)
      .map(([id, s]) => ({
        id,
        ...s,
        passRate: s.total > 0 ? Math.round((s.pass / s.total) * 100) : 100,
      }))
      .sort((a, b) => b.total - a.total);
  }, [zones, filteredByTime]);

  // Filtered records for table
  const tableRecords = useMemo(() => {
    return filteredByTime.filter((rec) => {
      if (selectedZoneId !== 'all' && rec.zoneId !== selectedZoneId) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchZone = rec.zoneName.toLowerCase().includes(term);
        const matchClass = (rec.assignedClass || '').toLowerCase().includes(term);
        const matchInspector = rec.inspectorName.toLowerCase().includes(term);
        const matchNote = (rec.note || '').toLowerCase().includes(term);
        return matchZone || matchClass || matchInspector || matchNote;
      }
      return true;
    });
  }, [filteredByTime, selectedZoneId, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(tableRecords, `ranot_inspections_history_${timeRange}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2>สรุปผลรายเดือนและสถิติภาพรวม</h2>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            สถิติการตรวจเขตทำความสะอาด โรงเรียนระโนดวิทยา
          </p>
        </div>

        {/* Time Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'all'
                  ? 'bg-white text-blue-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTimeRange('thisMonth')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'thisMonth'
                  ? 'bg-white text-blue-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setTimeRange('last7Days')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'last7Days'
                  ? 'bg-white text-blue-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 วันล่าสุด
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          {/* Admin Reset All Statistics & Inspections Button */}
          <button
            onClick={() => {
              if (!isAdminAuthenticated) {
                onOpenAdminLogin();
              } else {
                if (confirm('คุณต้องการรีเซ็ตประวัติการตรวจและสถิติการสรุปผลทั้งหมดใช่หรือไม่? (การกระทำนี้จะล้างข้อมูลการตรวจทั้งหมด)')) {
                  onResetAllInspections();
                }
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              isAdminAuthenticated
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
            }`}
            title={
              isAdminAuthenticated
                ? 'รีเซ็ตประวัติการตรวจและสถิติทั้งหมด (เฉพาะแอดมิน)'
                : 'เข้าสู่ระบบแอดมินเพื่อรีเซ็ตสถิติ'
            }
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAdminAuthenticated ? 'รีเซ็ตข้อมูลสถิติทั้งหมด' : 'รีเซ็ตสถิติ (แอดมิน)'}</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border-l-4 border-blue-500 border-t border-r border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              จำนวนการตรวจทั้งหมด
            </p>
            <h3 className="text-3xl font-extrabold text-blue-900 mt-1">{total}</h3>
            <p className="text-xs text-slate-400 mt-1">ครั้ง</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border-l-4 border-emerald-500 border-t border-r border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              ผ่านเกณฑ์มาตรฐาน
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{passCount}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{passPercentage}% ของการตรวจ</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border-l-4 border-red-500 border-t border-r border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-700 font-semibold uppercase tracking-wider">
              ไม่ผ่านเกณฑ์ (ต้องปรับปรุง)
            </p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">{failCount}</h3>
            <p className="text-xs text-red-600 mt-1 font-medium">
              {total > 0 ? Math.round((failCount / total) * 100) : 0}% ของการตรวจ
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Performance by Zone Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">สถิติความสะอาดจำแนกตามเขตพื้นที่</h3>
          </div>
          <span className="text-xs text-slate-400">เรียงตามความถี่การตรวจ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zoneStats.slice(0, 6).map((zs) => (
            <div
              key={zs.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{zs.zoneName}</h4>
                  <span className="text-xs text-slate-500">ชั้น {zs.assignedClass}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-extrabold ${
                      zs.passRate >= 80
                        ? 'text-emerald-600'
                        : zs.passRate >= 60
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {zs.passRate}%
                  </span>
                  <div className="text-[11px] text-slate-400">
                    ตรวจ {zs.total} (ผ่าน {zs.pass})
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    zs.passRate >= 80
                      ? 'bg-emerald-500'
                      : zs.passRate >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${zs.total > 0 ? zs.passRate : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table header with filters */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">ประวัติการตรวจบันทึกทั้งหมด</h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              {tableRecords.length} รายการ
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Zone Selector Filter */}
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">ทุกเขตพื้นที่</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {tableRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            ไม่พบประวัติการตรวจตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">วันที่ / เวลา</th>
                  <th className="py-3 px-4">เขตพื้นที่ & ห้องเรียน</th>
                  <th className="py-3 px-4">ผู้ตรวจ</th>
                  <th className="py-3 px-4 w-28">ผลการตรวจ</th>
                  <th className="py-3 px-4">หมายเหตุ / ภาพถ่าย</th>
                  <th className="py-3 px-4 text-right w-16">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tableRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{formatThaiDate(rec.date)}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{formatThaiTime(rec.date)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rec.zoneName}</div>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                        {rec.assignedClass || 'ไม่ระบุห้อง'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{rec.inspectorName}</div>
                      <div className="text-slate-400 text-[10px] capitalize">{rec.inspectorRole}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.status === 'pass' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ผ่าน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" /> ไม่ผ่าน
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {rec.image && (
                          <button
                            type="button"
                            onClick={() =>
                              onViewImage(
                                rec.image!,
                                rec.zoneName,
                                `${formatThaiDate(rec.date)} โดย ${rec.inspectorName}`
                              )
                            }
                            className="relative group shrink-0"
                            title="ดูรูปภาพ"
                          >
                            <img
                              src={rec.image}
                              alt="รูป"
                              className="w-8 h-8 rounded object-cover border border-slate-200"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          </button>
                        )}
                        <span className={rec.status === 'fail' ? 'text-red-700' : 'text-slate-600'}>
                          {rec.note || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
