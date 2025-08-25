'use client';

import { useState, useMemo } from 'react';
import { Activity } from '@/types';
import ActivityCard from './ActivityCard';
import { Search, Filter } from 'lucide-react';

interface ActivitySidebarProps {
  activities: Activity[];
  selectedActivity?: Activity | null;
  onActivitySelect?: (activity: Activity) => void;
}

export default function ActivitySidebar({ activities, selectedActivity, onActivitySelect }: ActivitySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || activity.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [activities, searchTerm, selectedCategory, selectedPriority]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {
      learning: [],
      development: [],
      health: [],
      productivity: [],
    };

    filteredActivities.forEach(activity => {
      groups[activity.category].push(activity);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });
    });

    return groups;
  }, [filteredActivities]);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'development', label: 'Development', icon: '💻' },
    { value: 'health', label: 'Health', icon: '🏃' },
    { value: 'productivity', label: 'Productivity', icon: '📋' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority', icon: '🔥' },
    { value: 'medium', label: 'Medium Priority', icon: '⚡' },
    { value: 'low', label: 'Low Priority', icon: '💤' },
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto shadow-sm">
      <div className="sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Activities
        </h2>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="flex-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.icon} {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>💡</span>
          <span>Click to select, then click time slots</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([category, categoryActivities]) => {
          if (categoryActivities.length === 0) return null;
          
          const categoryInfo = categories.find(c => c.value === category);
          
          return (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span>{categoryInfo?.icon}</span>
                <span className="capitalize">{category}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({categoryActivities.length})</span>
              </h3>
              
              <div className="space-y-3">
                {categoryActivities.map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    isSelected={selectedActivity?.id === activity.id}
                    onActivityClick={onActivitySelect}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No activities found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <span className="flex items-center justify-center gap-2">
            <span>+</span>
            <span>Add Custom Activity</span>
          </span>
        </button>
      </div>
    </div>
  );
}