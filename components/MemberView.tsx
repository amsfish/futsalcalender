
import React, { useState } from 'react';
import { User } from '../types';
import UserEditModal from './UserEditModal';

interface MemberViewProps {
  currentUser: User;
  allUsers: User[];
  onApprove: (userId: string) => void;
  onDelete: (userId: string) => void;
  onToggleRole: (userId: string) => void;
  onUpdateUserDetail: (userId: string, updates: Partial<User>) => void;
}

const MemberView: React.FC<MemberViewProps> = ({ 
  currentUser, 
  allUsers, 
  onApprove, 
  onDelete, 
  onToggleRole,
  onUpdateUserDetail 
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const approvedMembers = allUsers.filter(u => u.isApproved);
  const pendingUsers = allUsers.filter(u => !u.isApproved);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isAdmin && pendingUsers.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-bold text-red-600">承認待ちのユーザー</h3>
            <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
              {pendingUsers.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-2xl border-2 border-red-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <img src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} className="w-12 h-12 rounded-full" alt="" />
                  <div>
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    拒否
                  </button>
                  <button 
                    onClick={() => onApprove(user.id)}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-100"
                  >
                    承認する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">メンバー一覧 ({approvedMembers.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {approvedMembers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="relative flex-shrink-0">
                  <img src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} className="w-12 h-12 rounded-full border border-slate-100 object-cover" alt="" />
                  {user.role === 'ADMIN' && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-800 flex items-center truncate">
                    {user.name}
                    {user.id === currentUser.id && <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">自分</span>}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user.position || 'ポジション未設定'}</div>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center space-x-1 ml-2">
                   <button 
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="詳細を編集"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {user.id !== currentUser.id && (
                    <button 
                      onClick={() => {
                        if(window.confirm(`${user.name}さんを削除しますか？`)) onDelete(user.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {editingUser && (
        <UserEditModal 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={onUpdateUserDetail}
        />
      )}
    </div>
  );
};

export default MemberView;
