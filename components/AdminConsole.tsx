
import React, { useState, useEffect } from 'react';
import { User, FutsalEvent } from '../types';

interface AdminConsoleProps {
  users: User[];
  events: FutsalEvent[];
  currentUser: User;
  onResetDB: () => void;
  onUpdateFullDB: (data: { users: User[], events: FutsalEvent[] }) => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ users, events, currentUser, onResetDB, onUpdateFullDB }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonInput(JSON.stringify({ users, events }, null, 2));
  }, [users, events]);

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.users || !parsed.events) {
        throw new Error('users または events フィールドが必要です。');
      }
      if (window.confirm('データベースを直接上書きします。よろしいですか？')) {
        onUpdateFullDB(parsed);
        setError(null);
        setIsEditing(false);
        alert('DBを更新しました。反映のためにページをリロードします。');
        window.location.reload();
      }
    } catch (e: any) {
      setError(`JSONエラー: ${e.message}`);
    }
  };

  const handlePromoteMyself = () => {
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, role: 'ADMIN' as const, isApproved: true } : u
    );
    if (window.confirm('現在のあなたのアカウントを管理者に昇格させますか？')) {
      onUpdateFullDB({ users: updatedUsers, events });
      alert('権限を更新しました。');
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (window.confirm('DBを初期状態に戻します。保存されたデータはすべて消去されますがよろしいですか？')) {
      onResetDB();
      window.location.reload();
    }
  };

  return (
    <div className="mt-12 pt-8 border-t-4 border-red-500 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Danger Zone: DB Editor</h3>
        </div>
        <button 
          onClick={handlePromoteMyself}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-red-700 transition-colors shadow-lg"
        >
          自分を管理者に昇格
        </button>
      </div>

      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800">
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs font-mono text-slate-400">database.json</span>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-blue-700 transition-colors"
              >
                編集モード
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { setIsEditing(false); setError(null); }}
                  className="text-xs bg-slate-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-slate-500"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSaveJson}
                  className="text-xs bg-green-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-900/50"
                >
                  保存して反映
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="relative">
          <textarea
            readOnly={!isEditing}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className={`w-full h-96 p-6 bg-slate-900 text-green-400 font-mono text-xs leading-relaxed outline-none resize-none transition-all ${isEditing ? 'bg-slate-950 ring-inset ring-2 ring-blue-500/50' : ''}`}
            spellCheck={false}
          />
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-xl text-xs font-bold shadow-2xl animate-bounce">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase">Database Version</div>
            <div className="text-lg font-black text-slate-800">LocalStorage v1.0</div>
          </div>
          <button 
            onClick={handleReset}
            className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-100"
          >
            初期状態にリセット
          </button>
        </div>
        
        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase">Quick Fix</div>
            <div className="text-sm font-bold text-slate-700">メールアドレス一括置換などはJSONエディタで行ってください</div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        CAUTION: Direct DB editing can cause application errors. Use with care.
      </p>
    </div>
  );
};

export default AdminConsole;
