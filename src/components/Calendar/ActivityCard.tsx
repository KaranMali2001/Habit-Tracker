'use client';

import { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  onActivityClick?: (activity: Activity) => void;
}

export default function ActivityCard({ activity, isSelected = false, onActivityClick }: ActivityCardProps) {

  const getPriorityIcon = () => {
    switch (activity.priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '💤';
      default:
        return '';
    }
  };

  const getCategoryIcon = () => {
    switch (activity.category) {
      case 'learning':
        return '📚';
      case 'development':
        return '💻';
      case 'health':
        return '🏃';
      case 'productivity':
        return '📋';
      default:
        return '📝';
    }
  };

  const combinedStyle = {
    backgroundColor: activity.color + '15',
    borderColor: activity.color,
    color: activity.color,
  };

  return (
    <div
      style={combinedStyle}
      onClick={() => onActivityClick?.(activity)}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? 'shadow-xl scale-105 ring-2 ring-blue-400 dark:ring-blue-500'
          : 'hover:shadow-lg hover:scale-105 hover:-rotate-1'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {getCategoryIcon()}
        </span>
        <div className="flex-1">
          <div className="font-medium text-sm line-clamp-2">
            {activity.name}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs opacity-75">
              {activity.category}
            </span>
            <span className="text-sm">
              {getPriorityIcon()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}