// src/components/kid/KidCalendar.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../../store/store';
import { getCalendarEvents, clearCalendarError } from '../../store/slices/kidCalendarSlice';

const KidCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) => state.kidCalendar);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    dispatch(getCalendarEvents({ year, month }));
  }, [dispatch, selectedDate]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCalendarError());
    }
  }, [error, dispatch]);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    return events.filter(e => e.date === dateStr);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {dayEvents.some(e => e.type === 'lesson_completed') && (
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        )}
        {dayEvents.some(e => e.type === 'submission_submitted') && (
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        )}
        {dayEvents.some(e => e.type === 'submission_reviewed') && (
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        )}
      </div>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-black font-serif text-purple-900 mb-2">
        My <span className="text-orange-500">Coding Calendar</span>
      </h1>
      <p className="text-gray-500 font-extrabold mb-4">
        Track your learning journey day by day!
      </p>

      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        className="rounded-xl border-none shadow-lg"
      />

      <div className="mt-6 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4 justify-center">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Lesson completed
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            Assignment submitted
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Assignment reviewed
          </span>
        </div>
      </div>

      {events.length === 0 && !loading && (
        <div className="mt-8 text-center text-gray-400 text-sm">
          No activities yet. Complete lessons and submit assignments to see them here!
        </div>
      )}
    </div>
  );
};

export default KidCalendar;