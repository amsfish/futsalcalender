
import React, { useState } from 'react';
import { FutsalEvent, EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../constants';

interface CalendarViewProps {
  events: FutsalEvent[];
  onEventClick: (event: FutsalEvent) => void;
  onDateClick: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.MATCH: return 'bg-red-500';
      case EventType.PRACTICE: return 'bg-blue-500';
      case EventType.SOCIAL: return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateClick(dateStr);
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">
          {year}年 {month + 1}月
        </h2>
        <div className="flex space-x-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekDays.map((day, i) => (
          <div key={day} className={`py-3 text-center text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

          return (
            <div 
              key={index} 
              onClick={() => day && handleDayClick(day)}
              className={`border-r border-b border-slate-100 p-1 flex flex-col transition-colors ${!day ? 'bg-slate-50' : 'bg-white hover:bg-slate-50 cursor-pointer'}`}
            >
              {day && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 p-0.5">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold text-white truncate transition-transform hover:scale-95"
                        style={{ backgroundColor: getTypeColor(event.type).replace('bg-', '') === 'red-500' ? '#ef4444' : getTypeColor(event.type).replace('bg-', '') === 'blue-500' ? '#3b82f6' : '#10b981' }}
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-slate-50 flex flex-wrap gap-4 border-t border-slate-100">
        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
          {EVENT_TYPE_LABELS[EventType.MATCH]}
        </div>
        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
          {EVENT_TYPE_LABELS[EventType.PRACTICE]}
        </div>
        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
          {EVENT_TYPE_LABELS[EventType.SOCIAL]}
        </div>
        <div className="ml-auto text-[10px] font-bold text-slate-400 italic">
          ※ 日付をクリックして新規作成
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
