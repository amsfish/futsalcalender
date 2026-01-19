
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    password: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name: formData.name, email: formData.email });
    setMessage({ type: 'success', text: '設定を更新しました。' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password) return;
    setMessage({ type: 'success', text: 'パスワードを変更しました。' });
    setFormData({ ...formData, password: '' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">アカウント設定</h2>
        <button 
          onClick={onLogout}
          className="flex items-center text-red-500 font-bold text-sm hover:text-red-700 transition-colors bg-red-50 px-4 py-2 rounded-xl"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ログアウト
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">基本情報</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ニックネーム</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            基本情報を保存
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">パスワード変更</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">新しいパスワード</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
          >
            パスワードを変更
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
