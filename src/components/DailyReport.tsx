import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Download,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Eye,
  Trash2,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { InspectionRecord } from '../types';
import {
  formatThaiDate,
  formatThaiTime,
  isSameDay,
  generateLineSummary,
  exportToCSV,
} from '../utils/helpers';

interface DailyReportProps {
  inspections: InspectionRecord[];
  onDeleteRecord: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onViewImage: (imageUrl: string, title: string, subtitle?: string) => void;
  onNavigateToRecord: () => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onResetTodayInspections: () => void;
}

export const DailyReport: React.FC<DailyReportProps> = ({
  inspections,
  onDeleteRecord,
  onToggleResolved,
  onViewImage,
  onNavigateToRecord,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onResetTodayInspections,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedLine, setCopiedLine] = useState<boolean>(false);

  const today = new Date();
  const formattedToday = formatThaiDate(today.toISOString(), true);

  // Filter inspections recorded today
  const todayInspections = inspections.filter((rec) => isSameDay(rec.date, today));

  // Compute daily metrics
  const total = todayInspections.length;
  const passCount = todayInspections.filter((r) => r.status === 'pass').length;
  const failCount = todayInspections.filter((r) => r.status === 'fail').length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  // Filter by status & search
  const filteredRecords = todayInspections.filter((rec) => {
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
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

  const handleCopyLine = () => {
    const text = generateLineSummary(todayInspections, formattedToday);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLine(true);
      setTimeout(() => setCopiedLine(false), 3000);
    });
  };

  const handleExportCSV = () => {
    exportToCSV(todayInspections, `ranot_daily_report_${today.toISOString().slice(0, 10)}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2>สรุปผลการตรวจเขตทำความสะอาดรายวัน</h2>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{formattedToday}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={handleCopyLine}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              copiedLine
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="คัดลอกข้อความสรุปเพื่อส่งเข้ากลุ่ม LINE"
          >
            {copiedLine ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLine ? 'คัดลอกแล้ว!' : 'คัดลอกส่ง LINE'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>

          {/* Admin Reset Daily Summary Button */}
          <button
            onClick={() => {
              if (!isAdminAuthenticated) {
                onOpenAdminLogin();
              } else {
                if (confirm('คุณต้องการรีเซ็ตผลการตรวจของวันนี้ทั้งหมดใช่หรือไม่?')) {
                  onResetTodayInspections();
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
                ? 'รีเซ็ตข้อมูลผลการตรวจของวันนี้ทั้งหมด (เฉพาะแอดมิน)'
                : 'เข้าสู่ระบบแอดมินเพื่อรีเซ็ตผลการตรวจ'
            }
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAdminAuthenticated ? 'รีเซ็ตผลตรวจวันนี้' : 'รีเซ็ตผล (แอดมิน)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">ตรวจแล้ววันนี้</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{total}</span>
            <span className="text-xs text-slate-400">เขตพื้นที่</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-700 font-medium">ผ่านเกณฑ์</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{passCount}</span>
            <span className="text-xs text-emerald-600 font-medium">{passRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-700 font-medium">ไม่ผ่านเกณฑ์</p>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600">{failCount}</span>
            <span className="text-xs text-red-600 font-medium">
              {total > 0 ? Math.round((failCount / total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">อัตราความสะอาด</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">{passRate}%</span>
            <span className="text-xs text-blue-600 font-medium">
              {passRate >= 80 ? 'ยอดเยี่ยม' : passRate >= 50 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                passRate >= 80 ? 'bg-emerald-500' : passRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 mr-1 hidden lg:inline flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด ({total})
          </button>
          <button
            onClick={() => setStatusFilter('pass')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === 'pass'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            ผ่าน ({passCount})
          </button>
          <button
            onClick={() => setStatusFilter('fail')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              statusFilter === 'fail'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            ไม่ผ่าน ({failCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเขต, ชั้นเรียน, ผู้ตรวจ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Daily Records List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {todayInspections.length === 0
                ? 'ยังไม่มีการบันทึกข้อมูลการตรวจในวันนี้'
                : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {todayInspections.length === 0
                ? 'เริ่มต้นบันทึกผลการตรวจเขตความรับผิดชอบของนักเรียนเวรประจำวัน'
                : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองสถานะ'}
            </p>
            {todayInspections.length === 0 && (
              <button
                onClick={onNavigateToRecord}
                className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                + บันทึกผลการตรวจเขตใหม่
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs border-b border-slate-200 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-24">เวลา</th>
                  <th className="py-3.5 px-4">เขตพื้นที่ & ชั้นเรียน</th>
                  <th className="py-3.5 px-4">ผู้ตรวจ</th>
                  <th className="py-3.5 px-4 w-28">ผลตรวจ</th>
                  <th className="py-3.5 px-4">หลักฐาน / หมายเหตุ</th>
                  <th className="py-3.5 px-4 text-right w-24 print:hidden">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                    {/* Time */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {formatThaiTime(rec.date)}
                    </td>

                    {/* Zone & Class */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rec.zoneName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {rec.assignedClass || 'ไม่ระบุห้อง'}
                        </span>
                      </div>
                    </td>

                    {/* Inspector */}
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{rec.inspectorName}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{rec.inspectorRole}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {rec.status === 'pass' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ผ่าน</span>
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>ไม่ผ่าน</span>
                          </span>
                          {rec.resolved && (
                            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" /> แก้ไขแล้ว
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Note & Evidence Photo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        {rec.image && (
                          <button
                            type="button"
                            onClick={() =>
                              onViewImage(
                                rec.image!,
                                rec.zoneName,
                                `ตรวจโดย: ${rec.inspectorName} (${formatThaiTime(rec.date)})`
                              )
                            }
                            className="relative group shrink-0"
                            title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                          >
                            <img
                              src={rec.image}
                              alt="หลักฐาน"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs group-hover:opacity-80 transition"
                            />
                            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        )}
                        <div className="text-xs">
                          {rec.note ? (
                            <p className={rec.status === 'fail' ? 'text-red-700 font-medium' : 'text-slate-600'}>
                              {rec.note}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">ไม่มีหมายเหตุเพิ่มเติม</span>
                          )}

                          {rec.status === 'fail' && !rec.resolved && (
                            <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>รอนักเรียนเวรเข้ามาแก้ไข</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        {rec.status === 'fail' && (
                          <button
                            onClick={() => onToggleResolved(rec.id)}
                            className={`p-1.5 rounded-lg text-xs transition ${
                              rec.resolved
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-700'
                            }`}
                            title={rec.resolved ? 'ยกเลิกสถานะแก้ไขแล้ว' : 'ทำเครื่องหมายว่าแก้ไขแล้ว'}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('คุณต้องการลบรายการตรวจนี้ใช่หรือไม่?')) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="ลบรายการตรวจ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
