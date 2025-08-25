'use client';

import { CalendarDay as CalendarDayType, TimeSlot } from '@/types';
import TimeSlotComponent from './TimeSlot';
import { timeSlots } from '@/lib/supabase';

interface CalendarDayProps {
  day: CalendarDayType;
  onSlotUpdate: (slotId: string, updates: any) => void;
  onSlotClick?: (date: string, slotIndex: number) => void;
}

export default function CalendarDay({ day, onSlotUpdate, onSlotClick }: CalendarDayProps) {
  const getSlotForIndex = (index: number): TimeSlot | null => {
    return day.slots.find(slot => slot.slot_index === index) || null;
  };

  const dayNumber = new Date(day.date).getDate();
  const isWeekend = day.is_weekend;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-3 min-h-[280px] shadow-sm transition-all duration-200 hover:shadow-md ${
      day.is_today ? 'ring-2 ring-blue-500 shadow-blue-200 dark:shadow-blue-800/50' : ''
    } ${isWeekend ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <div className="text-center font-medium mb-2">
        <span className={`inline-block w-6 h-6 rounded-full text-sm leading-6 ${
          day.is_today 
            ? 'bg-blue-500 text-white' 
            : isWeekend 
            ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {dayNumber}
        </span>
      </div>

      <div className="space-y-1">
        {timeSlots.map((template, index) => {
          const slot = getSlotForIndex(index);
          const shouldShowBadminton = isWeekend === false && index === 7;
          
          if (shouldShowBadminton) {
            return (
              <div
                key={`badminton-${index}`}
                className="text-xs p-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-amber-800 dark:text-amber-200"
              >
                🏸 7:30-10:00 PM
              </div>
            );
          }

          return (
            <TimeSlotComponent
              key={`${day.date}-${index}`}
              slot={slot}
              slotIndex={index}
              date={day.date}
              template={template}
              onUpdate={onSlotUpdate}
              onSlotClick={onSlotClick}
            />
          );
        })}
      </div>

      {day.completion_rate > 0 && (
        <div className="mt-2 text-xs text-center">
          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-400 rounded-full h-1.5 transition-all duration-300"
              style={{ width: `${day.completion_rate}%` }}
            />
          </div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">{Math.round(day.completion_rate)}%</span>
        </div>
      )}
    </div>
  );
}