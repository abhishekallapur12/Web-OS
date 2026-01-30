import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, X, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    if (!user) {
      console.log('No user found, skipping event load');
      return;
    }
    
    try {
      console.log('Loading events for user:', user.id);
      
      // Load events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      console.log('Date range:', startOfMonth.toISOString().split('T')[0], 'to', endOfMonth.toISOString().split('T')[0]);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('event_date', startOfMonth.toISOString().split('T')[0])
        .lte('event_date', endOfMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Supabase error loading events:', error);
        throw error;
      }

      console.log('Loaded events:', data);

      const formattedEvents: Event[] = data?.map(event => ({
        id: event.id,
        title: event.title,
        date: event.event_date,
        time: event.event_time || '',
        location: event.location || '',
        description: event.description || ''
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load calendar events. Please check your database setup.",
        variant: "destructive",
      });
    }
  };

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInCalendar = () => {
    const days = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setNewEvent({ title: '', time: '', location: '', description: '' });
    setShowEventDialog(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setSelectedDate(null);
    setNewEvent({
      title: event.title,
      time: event.time,
      location: event.location || '',
      description: event.description || ''
    });
    setShowEventDialog(true);
  };

  const handleCreateOrUpdateEvent = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create events",
        variant: "destructive",
      });
      return;
    }

    if (!newEvent.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an event title",
        variant: "destructive",
      });
      return;
    }

    if (!editingEvent && !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select a date for the event",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingEvent) {
        // Update existing event
        console.log('Updating event:', editingEvent.id, newEvent);
        
        const { data, error } = await supabase
          .from('calendar_events')
          .update({
            title: newEvent.title.trim(),
            event_time: newEvent.time || null,
            location: newEvent.location.trim() || null,
            description: newEvent.description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating event:', error);
          throw error;
        }

        console.log('Event updated:', data);

        // Update local state
        setEvents(events.map(event => 
          event.id === editingEvent.id 
            ? {
                ...event,
                title: newEvent.title.trim(),
                time: newEvent.time,
                location: newEvent.location.trim(),
                description: newEvent.description.trim()
              }
            : event
        ));

        toast({
          title: "Event Updated",
          description: "Calendar event updated successfully",
        });
      } else {
        // Create new event
        const eventData = {
          user_id: user.id,
          title: newEvent.title.trim(),
          event_date: selectedDate!.toISOString().split('T')[0],
          event_time: newEvent.time || null,
          location: newEvent.location.trim() || null,
          description: newEvent.description.trim() || null
        };

        console.log('Creating new event:', eventData);

        const { data, error } = await supabase
          .from('calendar_events')
          .insert([eventData])
          .select()
          .single();

        if (error) {
          console.error('Error creating event:', error);
          throw error;
        }

        console.log('Event created:', data);

        const formattedEvent: Event = {
          id: data.id,
          title: data.title,
          date: data.event_date,
          time: data.event_time || '',
          location: data.location || '',
          description: data.description || ''
        };

        setEvents([...events, formattedEvent]);

        toast({
          title: "Event Created",
          description: "Calendar event created successfully",
        });
      }

      // Reset form and close dialog
      setNewEvent({ title: '', time: '', location: '', description: '' });
      setShowEventDialog(false);
      setSelectedDate(null);
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save calendar event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent || !user) return;

    try {
      console.log('Deleting event:', editingEvent.id);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', editingEvent.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        throw error;
      }

      setEvents(events.filter(event => event.id !== editingEvent.id));
      setShowEventDialog(false);
      setEditingEvent(null);

      toast({
        title: "Event Deleted",
        description: "Calendar event deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete calendar event",
        variant: "destructive",
      });
    }
  };

  // Debug info
  useEffect(() => {
    console.log('Calendar component state:', {
      user: user?.id,
      events: events.length,
      selectedDate: selectedDate?.toISOString(),
      showEventDialog,
      editingEvent: editingEvent?.id
    });
  }, [user, events, selectedDate, showEventDialog, editingEvent]);

  return (
    <div className="h-full flex bg-black font-mono text-green-400 relative">
      {/* Background with desktop theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0, 255, 0, 0.02),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0, 255, 0, 0.02),transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0, 255, 0, 0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0, 255, 0, 0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0, 255, 0, 0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-green-300 font-mono">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm hover:border-green-400/50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="bg-green-600/80 hover:bg-green-500/80 text-black px-3 py-1 rounded font-mono text-sm transition-all shadow-green-500/30 shadow-md"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week Headers */}
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-green-400/70 text-sm font-mono">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {getDaysInCalendar().map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                className={`min-h-24 p-2 border border-green-500/20 cursor-pointer hover:bg-black/60 transition-colors backdrop-blur-sm ${
                  isCurrentMonth(date) ? 'bg-black/40' : 'bg-black/20'
                } ${
                  isToday(date) ? 'ring-2 ring-green-400 shadow-green-400/30 shadow-lg' : ''
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className={`text-sm font-medium mb-1 font-mono ${
                  isCurrentMonth(date) 
                    ? isToday(date) 
                      ? 'text-green-300' 
                      : 'text-green-400'
                    : 'text-green-400/50'
                }`}>
                  {date.getDate()}
                </div>
                
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded mb-1 truncate hover:bg-green-600/30 transition-colors font-mono border border-green-500/20"
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.time && <span className="mr-1">{event.time}</span>}
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-green-500/20 p-6 bg-black/40 backdrop-blur-md relative z-10">
        <h3 className="text-lg font-semibold mb-4 text-green-300 font-mono">Today's Events</h3>
        
        <div className="space-y-4">
          {getEventsForDate(today).map(event => (
            <div 
              key={event.id} 
              className="bg-black/60 rounded-lg p-4 border border-green-500/20 cursor-pointer hover:bg-black/80 hover:border-green-400/30 transition-colors backdrop-blur-sm"
              onClick={(e) => handleEventClick(event, e)}
            >
              <h4 className="font-medium mb-2 text-green-300 font-mono">{event.title}</h4>
              <div className="space-y-2 text-sm text-green-400/70">
                {event.time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-mono">{event.location}</span>
                  </div>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-green-400/80 mt-3 font-mono">{event.description}</p>
              )}
            </div>
          ))}
          
          {getEventsForDate(today).length === 0 && (
            <div className="text-center text-green-400/60 py-8">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-mono">No events today</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Dialog */}
      {showEventDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/90 border border-green-500/20 rounded-lg p-6 w-full max-w-md mx-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300 font-mono">
                {editingEvent ? 'Edit Event' : `Create Event - ${selectedDate?.toLocaleDateString()}`}
              </h3>
              <button
                onClick={() => setShowEventDialog(false)}
                className="text-green-400 hover:text-green-300 font-mono text-lg"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full bg-black/60 border border-green-500/20 text-green-400 font-mono text-sm p-3 rounded focus:border-green-400/50 focus:outline-none backdrop-blur-sm"
                disabled={loading}
              />
              <input
                type="time"
                placeholder="Time (optional)"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className="w-full bg-black/60 border border-green-500/20 text-green-400 font-mono text-sm p-3 rounded focus:border-green-400/50 focus:outline-none backdrop-blur-sm"
                disabled={loading}
              />
              <input
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                className="w-full bg-black/60 border border-green-500/20 text-green-400 font-mono text-sm p-3 rounded focus:border-green-400/50 focus:outline-none backdrop-blur-sm"
                disabled={loading}
              />
              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="w-full bg-black/60 border border-green-500/20 text-green-400 font-mono text-sm p-3 rounded focus:border-green-400/50 focus:outline-none backdrop-blur-sm"
                rows={3}
                disabled={loading}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateOrUpdateEvent}
                  disabled={loading || !newEvent.title.trim()}
                  className="flex-1 bg-green-600/80 hover:bg-green-500/80 text-black px-3 py-2 rounded font-mono text-sm transition-all shadow-green-500/30 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                {editingEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    disabled={loading}
                    className="bg-red-600/80 hover:bg-red-500/80 text-white px-3 py-2 rounded font-mono text-sm transition-all shadow-red-500/30 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowEventDialog(false)}
                  disabled={loading}
                  className="bg-black/60 border border-green-500/20 text-green-400 px-3 py-2 rounded font-mono text-sm hover:border-green-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};