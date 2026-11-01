export type InspectorRole = 'committee' | 'admin';

export interface InspectionCriteria {
  litterFree: boolean;        // ความสะอาดพื้น ไร้เศษขยะและใบไม้
  binsCleaned: boolean;       // ถังขยะเททิ้งและจัดวางเรียบร้อย
  orderlyArranged: boolean;   // โต๊ะเก้าอี้และสิ่งของเป็นระเบียบ
  noStainsWater: boolean;     // ไม่มีน้ำขังและคราบสกปรก
}

export interface InspectionRecord {
  id: string;
  date: string;               // ISO date string
  zoneId: string;
  zoneName: string;
  assignedClass: string;
  inspectorRole: InspectorRole;
  inspectorName: string;
  status: 'pass' | 'fail';
  criteria?: InspectionCriteria;
  note?: string;
  image?: string;             // Base64 compressed image data URL
  resolved?: boolean;         // Has issue been fixed
}

export interface Zone {
  id: string;
  name: string;
  locationArea: string;
  assignedClass: string;
  advisorTeacher: string;
  description?: string;
}

export const ROLE_LABELS: Record<InspectorRole, string> = {
  committee: 'กรรมการสภานักเรียน',
  admin: 'ผู้ดูแลระบบ / ฝ่ายบริหาร',
};
