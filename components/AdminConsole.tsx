
import React, { useState } from 'react';
import { User, FutsalEvent } from '../types';
import { db } from '../services/dbService';

interface AdminConsoleProps {
  users: User[];
  events: FutsalEvent[];
  currentUser: User;
  onResetDB: () => void;
  onUpdateFullDB: () => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ users, currentUser, onUpdateFullDB }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePromoteMyself = async () => {
    if (window.confirm('現在のあなたのアカウントを管理者に昇格させ、承認状態にしますか？')) {
      setIsLoading(true);
      try {
        await db.updateUser(currentUser.id, { role: 'ADMIN', isApproved: true });
        alert('権限を更新しました。反映のためにリロードします。');
        window.location.reload();
      } catch (e) {
        alert('エラーが発生しました。SQL Editorでテーブルが作成されているか確認してください。');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mt-12 pt-8 border-t-4 border-blue-500 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Admin Control Panel</h3>
        </div>
        <button 
          onClick={handlePromoteMyself}
          disabled={isLoading}
          className="text-xs bg-blue-600 text-white px-4 py-2 rounded-xl font-black hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
        >
          {isLoading ? '更新中...' : '自分を管理者に昇格'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-2">Supabase 接続状況</h4>
        <p className="text-sm text-slate-500 mb-4">
          データはクラウド上に安全に保存されています。一括削除やデータの直接編集が必要な場合は、
          <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 underline ml-1">Supabase Dashboard</a> 
          をご利用ください。
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-black uppercase">Users</div>
            <div className="text-2xl font-black text-slate-800">{users.length}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-black uppercase">Storage</div>
            <div className="text-sm font-black text-blue-600">Connected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
