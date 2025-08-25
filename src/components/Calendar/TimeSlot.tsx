'use client';

import { useState } from 'react';
import { TimeSlot as TimeSlotType } from '@/types';
import { Clock, CheckCircle, Play, X } from 'lucide-react';

interface TimeSlotProps {
  slot: TimeSlotType | null;
  slotIndex: number;
  date: string;
  template: { start_time: string; end_time: string };
  onUpdate: (slotId: string, updates: any) => void;
  onSlotClick?: (date: string, slotIndex: number) => void;
}

export default function TimeSlot({ 
  slot, 
  slotIndex, 
  date, 
  template, 
  onUpdate,
  onSlotClick
}: TimeSlotProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(slot?.notes || '');

  const getStatusColor = () => {
    if (!slot || !slot.planned_activity_id) return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    
    switch (slot.completion_status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
      case 'skipped':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
    }
  };

  const getStatusIcon = () => {
    if (!slot || !slot.planned_activity_id) return null;
    
    switch (slot.completion_status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'in_progress':
        return <Play className="w-3 h-3 text-yellow-600" />;
      case 'skipped':
        return <X className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-blue-600" />;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!slot) return;
    
    onUpdate(slot.id, { 
      completionStatus: newStatus,
      completionPercentage: newStatus === 'completed' ? 100 : newStatus === 'skipped' ? 0 : slot.completion_percentage
    });
  };

  const handleNotesSubmit = () => {
    if (!slot) return;
    
    onUpdate(slot.id, { notes });
    setIsEditing(false);
  };

  return (
    <div
      className={`relative text-xs p-2 border-2 rounded-lg transition-all duration-200 ${
        getStatusColor()
      } ${
        !slot?.planned_activity_id ? 'min-h-[32px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600' : ''
      }`}
      onClick={() => {
        if (!slot?.planned_activity_id && onSlotClick) {
          onSlotClick(date, slotIndex);
        }
      }}
    >
      {slot?.planned_activity_id ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1">
              {getStatusIcon()}
              <span 
                className="truncate font-medium"
                style={{ color: slot.planned_activity?.color || '#000' }}
              >
                {slot.planned_activity?.name || 'Unknown Activity'}
              </span>
            </div>
            
            {slot.completion_percentage > 0 && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {slot.completion_percentage}%
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {template.start_time} - {template.end_time}
          </div>

          {slot.actual_duration_minutes && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {slot.actual_duration_minutes}min actual
            </div>
          )}

          <div className="flex gap-1 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('in_progress');
              }}
              className="text-xs px-1 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded"
            >
              Start
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('completed');
              }}
              className="text-xs px-1 py-0.5 bg-green-200 hover:bg-green-300 rounded"
            >
              Done
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('skipped');
              }}
              className="text-xs px-1 py-0.5 bg-red-200 hover:bg-red-300 rounded"
            >
              Skip
            </button>
          </div>

          {isEditing ? (
            <div className="mt-1">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNotesSubmit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 mt-1"
            >
              {notes || 'Add notes...'}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 dark:text-gray-500 py-2">
          <div className="text-xs font-medium">
            {template.start_time} - {template.end_time}
          </div>
          <div className="text-xs mt-1 text-gray-400 dark:text-gray-500 transition-all duration-200">
            Click to assign activity
          </div>
        </div>
      )}
    </div>
  );
}