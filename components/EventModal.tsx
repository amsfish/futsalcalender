
import React, { useState, useEffect } from 'react';
import { FutsalEvent, AttendanceStatus, User } from '../types';
import { ATTENDANCE_LABELS, MOCK_USERS } from '../constants';
import { getTeamStrategy } from '../services/geminiService';

interface EventModalProps {
  event: FutsalEvent;
  currentUser: User;
  onClose: () => void;
  onUpdateAttendance: (eventId: string, status: AttendanceStatus, comment: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, currentUser, onClose, onUpdateAttendance }) => {
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  
  // Local state for attendance form
  const existingAttendance = event.attendees.find(a => a.userId === currentUser.id);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(existingAttendance?.status || AttendanceStatus.UNSET);
  const [comment, setComment] = useState(existingAttendance?.comment || '');

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const advice = await getTeamStrategy(event);
    setAiAdvice(advice || 'アドバイスを取得できませんでした。');
    setLoadingAdvice(false);
  };

  const handleSave = () => {
    if (selectedStatus === AttendanceStatus.UNSET) {
      alert('出欠ステータスを選択してください。');
      return;
    }
    onUpdateAttendance(event.id, selectedStatus, comment);
    alert('入力が完了しました');
  };

  // Prepare full member list (attending + not yet responded)
  const fullMemberList = MOCK_USERS.map(user => {
    const attendance = event.attendees.find(a => a.userId === user.id);
    return {
      user,
      attendance
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800">イベント詳細</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center text-slate-600">
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{event.date} {event.startTime} 〜 {event.endTime}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
            <p className="mt-6 text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {event.description}
            </p>
          </div>

          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
               <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
              </svg>
              あなたの出欠回答
            </h4>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {[AttendanceStatus.GOING, AttendanceStatus.MAYBE, AttendanceStatus.ABSENT].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-bold transition-all ${
                      selectedStatus === status 
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {ATTENDANCE_LABELS[status]}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">コメント</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-20 text-sm"
                  placeholder="例：少し遅れます、車で行きますなど"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>回答を保存する</span>
              </button>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Gemini AI 戦略アドバイス
              </h4>
              <button 
                onClick={fetchAdvice}
                disabled={loadingAdvice}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center px-3 py-1 rounded-lg hover:bg-indigo-50"
              >
                {loadingAdvice ? '生成中...' : 'アドバイスを生成'}
              </button>
            </div>
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 min-h-[100px]">
              {loadingAdvice ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : aiAdvice ? (
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {aiAdvice}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center">「アドバイスを生成」をクリックして、本日の参加メンバーに合わせた戦略を確認しましょう。</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              回答状況一覧
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">メンバー</th>
                    <th className="px-4 py-3">出欠</th>
                    <th className="px-4 py-3">コメント</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fullMemberList.map(({ user, attendance }, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} 
                            className="w-8 h-8 rounded-full border border-slate-200" 
                            alt="" 
                          />
                          <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {attendance ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold inline-block min-w-[60px] ${
                            attendance.status === AttendanceStatus.GOING ? 'bg-green-100 text-green-700' :
                            attendance.status === AttendanceStatus.MAYBE ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {ATTENDANCE_LABELS[attendance.status]}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-black text-lg">?</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {attendance?.comment || <span className="text-slate-300 italic">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
