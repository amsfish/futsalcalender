
import { FutsalEvent, EventType, AttendanceStatus, User } from './types';

// Add missing required properties (email, isApproved) to each user
export const MOCK_USERS: User[] = [
  { id: 'u1', name: '田中 太郎', email: 'tanaka@example.com', role: 'ADMIN', position: 'ALA', avatar: 'https://picsum.photos/seed/u1/100/100', isApproved: true },
  { id: 'u2', name: '佐藤 健', email: 'sato@example.com', role: 'MEMBER', position: 'PIVO', avatar: 'https://picsum.photos/seed/u2/100/100', isApproved: true },
  { id: 'u3', name: '鈴木 一郎', email: 'suzuki@example.com', role: 'MEMBER', position: 'FIXO', avatar: 'https://picsum.photos/seed/u3/100/100', isApproved: true },
  { id: 'u4', name: '高橋 翼', email: 'takahashi@example.com', role: 'MEMBER', position: 'GOLEIRO', avatar: 'https://picsum.photos/seed/u4/100/100', isApproved: true },
  { id: 'u5', name: '伊藤 直美', email: 'ito@example.com', role: 'MEMBER', position: 'ALA', avatar: 'https://picsum.photos/seed/u5/100/100', isApproved: true },
];

export const MOCK_EVENTS: FutsalEvent[] = [
  {
    id: 'e1',
    title: '定期練習（フットサルステージ多摩）',
    type: EventType.PRACTICE,
    date: '2024-05-20',
    startTime: '19:00',
    endTime: '21:00',
    location: 'フットサルステージ多摩 第1コート',
    description: 'パス回しとシュート練習を中心に行います。初心者歓迎！',
    attendees: [
      { userId: 'u1', userName: '田中 太郎', status: AttendanceStatus.GOING, updatedAt: '2024-05-15T10:00:00Z' },
      { userId: 'u2', userName: '佐藤 健', status: AttendanceStatus.GOING, updatedAt: '2024-05-15T11:00:00Z' },
      { userId: 'u3', userName: '鈴木 一郎', status: AttendanceStatus.ABSENT, updatedAt: '2024-05-16T09:00:00Z' },
    ]
  },
  {
    id: 'e2',
    title: 'リーグ戦 vs FCレッド',
    type: EventType.MATCH,
    date: '2024-05-25',
    startTime: '10:00',
    endTime: '12:00',
    location: '代々木フットサルパーク',
    description: '今季最大のライバルとの一戦です。ユニフォーム必携！',
    attendees: [
      { userId: 'u1', userName: '田中 太郎', status: AttendanceStatus.GOING, updatedAt: '2024-05-17T10:00:00Z' },
      { userId: 'u4', userName: '高橋 翼', status: AttendanceStatus.GOING, updatedAt: '2024-05-17T12:00:00Z' },
    ]
  }
];

export const EVENT_TYPE_LABELS = {
  [EventType.MATCH]: '試合',
  [EventType.PRACTICE]: '練習',
  [EventType.SOCIAL]: '交流会',
  [EventType.OTHER]: 'その他',
};

export const ATTENDANCE_LABELS = {
  [AttendanceStatus.GOING]: '出席',
  [AttendanceStatus.MAYBE]: '未定',
  [AttendanceStatus.ABSENT]: '欠席',
  [AttendanceStatus.UNSET]: '回答なし',
};
