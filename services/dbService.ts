
import { User, FutsalEvent, AttendanceStatus } from '../types';
import { supabase } from './supabaseClient';

export const db = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data.map(u => ({
      ...u,
      isApproved: u.is_approved
    }));
  },

  getCurrentUserProfile: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) return null;
    return { ...data, isApproved: data.is_approved };
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    const dbUpdates: any = { ...updates };
    if (updates.isApproved !== undefined) {
      dbUpdates.is_approved = updates.isApproved;
      delete dbUpdates.isApproved;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);
    
    if (error) throw error;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  getEvents: async (): Promise<FutsalEvent[]> => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    const { data: attendanceData, error: attError } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles (name)
      `);

    if (attError) throw attError;

    return eventsData.map(event => ({
      ...event,
      startTime: event.start_time,
      endTime: event.end_time,
      attendees: attendanceData
        .filter(a => a.event_id === event.id)
        .map(a => ({
          userId: a.user_id,
          userName: a.profiles?.name || 'Unknown',
          status: a.status as AttendanceStatus,
          comment: a.comment,
          updatedAt: a.updated_at
        }))
    }));
  },

  createEvent: async (event: Omit<FutsalEvent, 'id' | 'attendees'>) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        type: event.type,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        location: event.location,
        description: event.description
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateAttendance: async (eventId: string, userId: string, status: AttendanceStatus, comment: string) => {
    const { error } = await supabase
      .from('attendance')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status: status,
        comment: comment,
        updated_at: new Date().toISOString()
      }, { onConflict: 'event_id,user_id' });
    
    if (error) throw error;
  }
};
