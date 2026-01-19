
export enum AttendanceStatus {
  GOING = 'GOING',
  MAYBE = 'MAYBE',
  ABSENT = 'ABSENT',
  UNSET = 'UNSET'
}

export enum EventType {
  MATCH = 'MATCH',
  PRACTICE = 'PRACTICE',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  position?: string;
  avatar?: string;
  isApproved: boolean; // 管理者承認フラグ
}

export interface Attendance {
  userId: string;
  userName: string;
  status: AttendanceStatus;
  comment?: string;
  updatedAt: string;
}

export interface FutsalEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  attendees: Attendance[];
}

export interface TeamStats {
  totalEvents: number;
  activeMembers: number;
  averageAttendance: number;
}
