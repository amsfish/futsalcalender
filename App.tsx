
import React, { useState, useEffect } from 'react';
import { FutsalEvent, AttendanceStatus, User } from './types.ts';
import { db } from './services/dbService.ts';
import { supabase } from './services/supabaseClient.ts';
import EventCard from './components/EventCard.tsx';
import EventModal from './components/EventModal.tsx';
import CalendarView from './components/CalendarView.tsx';
import CreateEventModal from './components/CreateEventModal.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import SettingsView from './components/SettingsView.tsx';
import MemberView from './components/MemberView.tsx';
import AdminConsole from './components/AdminConsole.tsx';

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
      await fetchData(); 
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

  if (currentUser && !currentUser.isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter uppercase">Waiting for Approval</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
            {currentUser.name}さん、ようこそ！<br />
            現在、管理者による承認をお待ちしております。
          </p>
          <div className="space-y-3">
            <button onClick={handleLogout} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">Logout</button>
            {allUsers.filter(u => u.role === 'ADMIN').length === 0 && (
              <button 
                onClick={() => handleUpdateUserDetail(currentUser.id, { role: 'ADMIN', isApproved: true })}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 text-xs uppercase tracking-widest"
              >
                I am the first admin
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={() => fetchData()} />;
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tighter italic">Futsal Connect</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-widest">{currentUser.name}</span>
            <img src={currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/100/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="avatar" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Upcoming Events</h2>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-100 flex items-center uppercase tracking-widest"
              >
                Create
              </button>
            </div>
            {events.length === 0 ? (
              <div className="bg-white p-12 rounded-[40px] border-4 border-dashed border-slate-100 text-center">
                <p className="text-slate-300 font-black uppercase tracking-widest text-sm">No scheduled events yet.</p>
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
          <CalendarView 
            events={events} 
            onEventClick={setSelectedEvent} 
            onDateClick={(date) => { setInitialDate(date); setIsCreating(true); }} 
          />
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
          <SettingsView 
            currentUser={currentUser}
            onUpdateUser={(updates) => handleUpdateUserDetail(currentUser.id, updates)}
            onLogout={handleLogout}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40">
        <button onClick={() => setActiveTab('events')} className={`flex flex-col items-center ${activeTab === 'events' ? 'text-blue-600' : 'text-slate-300'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">Events</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-blue-600' : 'text-slate-300'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">Calendar</span>
        </button>
        <button onClick={() => setActiveTab('members')} className={`flex flex-col items-center ${activeTab === 'members' ? 'text-blue-600' : 'text-slate-300'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">Team</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-300'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
        </button>
      </nav>

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          currentUser={currentUser}
          allUsers={allUsers}
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
