
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      if (isLoginView) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        onLogin();
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });
        if (authError) throw authError;

        // auth.users と同期する profiles への挿入（通常はTriggerでやりますが、今回は直接書きます）
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              name: formData.name,
              email: formData.email,
              avatar: `https://picsum.photos/seed/${formData.email}/100/100`,
              role: 'MEMBER',
              is_approved: false
            }]);
          if (profileError) console.error('Profile creation error:', profileError);
        }
        setIsPending(true); // 承認待ち表示へ
      }
    } catch (err: any) {
      setError(err.message || '認証エラーが発生しました。');
      setIsPending(false);
    }
  };

  if (isPending && !isLoginView) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">登録申請完了</h2>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            チーム管理者による承認をお待ちください。<br />
            （メール確認が必要な設定の場合は、メール内のリンクをクリックしてください）
          </p>
          <button onClick={() => { setIsPending(false); setIsLoginView(true); }} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">ログイン画面へ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Futsal Connect</h1>
        <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Powered by Supabase</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">{isLoginView ? 'ログイン' : 'メンバー登録'}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">お名前</label>
              <input type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="フルネームを入力" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス</label>
            <input type="email" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="example@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">パスワード</label>
            <input type="password" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" disabled={isPending} className={`w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 ${isPending ? 'opacity-50' : ''}`}>
            {isPending ? '処理中...' : isLoginView ? 'ログイン' : '登録を申請する'}
          </button>
        </form>
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            {isLoginView ? '新規登録はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
