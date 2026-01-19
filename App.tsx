
import React, { useState, useEffect } from 'react';
import { FutsalEvent, AttendanceStatus, User } from './types';
import { db } from './services/dbService';
import { supabase } from './services/supabaseClient';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import CalendarView from './components/CalendarView';
import CreateEventModal from './components/CreateEventModal';
import AuthScreen from './components/AuthScreen';
import SettingsView from './components/SettingsView';
import MemberView from './components/MemberView';
import AdminConsole from './components/AdminConsole';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<FutsalEvent[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FutsalEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialDate, setInitialDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'events' | 'calendar' | 'members' | 'settings'>('events');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsData, usersData] = await Promise.all([
        db.getEvents(),
        db.getUsers()
      ]);
      setEvents(eventsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await db.getCurrentUserProfile(session.user.id);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    fetchData();

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdateAttendance = async (eventId: string, status: AttendanceStatus, comment: string) => {
    if (!currentUser) return;
    try {
      await db.updateAttendance(eventId, currentUser.id, status, comment);
      await fetchData(); // 最新状態を再取得
      // モーダル表示中のイベントも更新
      const updatedEvents = await db.getEvents();
      const currentSelected = updatedEvents.find(e => e.id === eventId);
      if (currentSelected) setSelectedEvent(currentSelected);
    } catch (error) {
      alert('出欠の更新に失敗しました');
    }
  };

  const handleCreateEvent = async (eventData: Omit<FutsalEvent, 'id' | 'attendees'>) => {
    try {
      await db.createEvent(eventData);
      await fetchData();
      setIsCreating(false);
    } catch (error) {
      alert('イベントの作成に失敗しました');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await db.updateUser(userId, { isApproved: true });
      await fetchData();
    } catch (error) {
      alert('承認に失敗しました');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await db.deleteUser(userId);
      await fetchData();
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const handleUpdateUserDetail = async (userId: string, updates: Partial<User>) => {
    try {
      await db.updateUser(userId, updates);
      await fetchData();
      if (currentUser?.id === userId) {
        const updatedProfile = await db.getCurrentUserProfile(userId);
        setCurrentUser(updatedProfile);
      }
    } catch (error) {
      alert('ユーザー情報の更新に失敗しました');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-bold animate-pulse">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !currentUser.isApproved) {
    return <AuthScreen onLogin={() => fetchData()} />;
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Futsal Connect</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:block text-sm font-medium text-slate-600">{currentUser.name}さん</span>
            <img src={currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/100/100`} className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" alt="avatar" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-800">今後の予定</h2>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新規作成
              </button>
            </div>
            {events.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-400 font-medium">予定されているイベントはありません。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events
                  .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                  .map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onClick={setSelectedEvent} 
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">カレンダー</h2>
            <CalendarView 
              events={events} 
              onEventClick={setSelectedEvent} 
              onDateClick={(date) => { setInitialDate(date); setIsCreating(true); }} 
            />
          </div>
        )}

        {activeTab === 'members' && (
          <MemberView 
            currentUser={currentUser}
            allUsers={allUsers}
            onApprove={handleApproveUser}
            onDelete={handleDeleteUser}
            onToggleRole={(userId) => {
              const u = allUsers.find(user => user.id === userId);
              if (u) handleUpdateUserDetail(userId, { role: u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' });
            }}
            onUpdateUserDetail={handleUpdateUserDetail}
          />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <SettingsView 
              currentUser={currentUser}
              onUpdateUser={(updates) => handleUpdateUserDetail(currentUser.id, updates)}
              onLogout={handleLogout}
            />
            {currentUser.role === 'ADMIN' && (
              <AdminConsole 
                users={allUsers}
                events={events}
                currentUser={currentUser}
                onResetDB={() => alert('Supabaseのリセットは管理パネルから行ってください')}
                onUpdateFullDB={async (data) => {
                  alert('フルDB更新は現在Supabaseではサポートされていません。テーブルを直接編集してください。');
                }}
              />
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <button onClick={() => setActiveTab('events')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'events' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="text-[10px] font-bold">一覧</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'calendar' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold">カレンダー</span>
        </button>
        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'members' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            {currentUser.role === 'ADMIN' && allUsers.some(u => !u.isApproved) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </div>
          <span className="text-[10px] font-bold">メンバー</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold">設定</span>
        </button>
      </nav>

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onUpdateAttendance={handleUpdateAttendance}
        />
      )}

      {isCreating && (
        <CreateEventModal 
          initialDate={initialDate}
          onClose={() => setIsCreating(false)}
          onSave={handleCreateEvent}
        />
      )}
    </div>
  );
};

export default App;
