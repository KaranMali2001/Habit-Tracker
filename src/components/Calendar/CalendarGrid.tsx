'use client';

import { Activity, CalendarDay } from '@/types';
import CalendarDayComponent from './CalendarDay';

interface CalendarGridProps {
  days: CalendarDay[];
  activities: Activity[];
  onSlotUpdate: (slotId: string, updates: any) => void;
  onPlanUpdate: (date: string, slots: Array<{ slotIndex: number; activityId: number | null }>) => void;
  selectedActivity?: Activity | null;
  onActivitySelect?: (activity: Activity | null) => void;
}

export default function CalendarGrid({ 
  days, 
  activities, 
  onSlotUpdate, 
  onPlanUpdate,
  selectedActivity,
  onActivitySelect
}: CalendarGridProps) {

  const handleSlotClick = (date: string, slotIndex: number) => {
    if (selectedActivity) {
      onPlanUpdate(date, [{
        slotIndex: slotIndex,
        activityId: selectedActivity.id,
      }]);
      onActivitySelect?.(null);
    }
  };

  return (
    <div>
      {selectedActivity && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Click on a time slot to assign:
              </span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedActivity.name}
              </span>
            </div>
            <button
              onClick={() => onActivitySelect?.(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-2 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center font-semibold p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm">
            {day}
          </div>
        ))}
        
        {days.map(day => (
          <CalendarDayComponent
            key={day.date}
            day={day}
            onSlotUpdate={onSlotUpdate}
            onSlotClick={handleSlotClick}
          />
        ))}
      </div>
    </div>
  );
}