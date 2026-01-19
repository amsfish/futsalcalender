
import React from 'react';
import { FutsalEvent, AttendanceStatus, EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../constants';

interface EventCardProps {
  event: FutsalEvent;
  onClick: (event: FutsalEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const goingCount = event.attendees.filter(a => a.status === AttendanceStatus.GOING).length;
  const maybeCount = event.attendees.filter(a => a.status === AttendanceStatus.MAYBE).length;
  const absentCount = event.attendees.filter(a => a.status === AttendanceStatus.ABSENT).length;

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.MATCH: return 'bg-red-100 text-red-700 border-red-200';
      case EventType.PRACTICE: return 'bg-blue-100 text-blue-700 border-blue-200';
      case EventType.SOCIAL: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div 
      onClick={() => onClick(event)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeColor(event.type)}`}>
          {EVENT_TYPE_LABELS[event.type]}
        </span>
        <span className="text-slate-500 text-sm">{event.date}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{event.title}</h3>
      
      <div className="flex items-center text-slate-600 text-sm mb-4">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="truncate">{event.location}</span>
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">出席</span>
          <span className="text-lg font-bold text-slate-700">{goingCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">未定</span>
          <span className="text-lg font-bold text-slate-700">{maybeCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">欠席</span>
          <span className="text-lg font-bold text-slate-700">{absentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
