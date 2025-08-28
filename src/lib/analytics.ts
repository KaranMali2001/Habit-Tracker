import { prisma } from '@/lib/prisma';

export interface AnalyticsData {
  dailyCompletion: Array<{ 
    date: string; 
    completionRate: number; 
    totalTasks: number; 
    completedTasks: number;
    skippedTasks: number;
    productivity: number;
  }>;
  categoryDistribution: Array<{ category: string; completed: number; total: number; color: string; percentage: number }>;
  weeklyProgress: Array<{ week: number; completionRate: number; totalMinutes: number; avgDailyTasks: number }>;
  moodEnergy: Array<{ date: string; mood: number; energyLevel: number; productivity: number }>;
  priorityAnalysis: Array<{ priority: string; completed: number; total: number; completionRate: number; color: string }>;
  timeDistribution: Array<{ category: string; minutes: number; hours: number; color: string; percentage: number }>;
  streakAnalysis: {
    currentStreak: number;
    longestStreak: number;
    streakDates: string[];
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    avgCompletionRate: number;
    totalMinutes: number;
    totalHours: number;
    avgEnergyLevel: number;
    avgMood: number;
    mostProductiveDay: string;
    bestCategory: string;
    improvementAreas: string[];
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: '#ef4444',           // Red
  PROJECT: '#ec4899',       // Pink  
  WRITING: '#f97316',       // Orange
  LEARNING: '#22c55e',      // Green
  APPLICATION: '#3b82f6',   // Blue
  INTERVIEW_PREP: '#8b5cf6', // Violet
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#dc2626',     // Red-600
  MEDIUM: '#f59e0b',   // Amber-500
  LOW: '#10b981',      // Emerald-500
};

// Convert Mood enum to number for analytics
const MOOD_TO_NUMBER: Record<string, number> = {
  TERRIBLE: 1,
  LOW: 3,
  NEUTRAL: 5,
  GOOD: 7,
  EXCELLENT: 9,
};

// Helper function to calculate streaks
function calculateStreaks(dailyData: Array<{ date: string; completionRate: number }>): {
  currentStreak: number;
  longestStreak: number;
  streakDates: string[];
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const streakDates: string[] = [];
  
  // Sort by date to ensure proper order
  const sortedData = dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (let i = sortedData.length - 1; i >= 0; i--) {
    const day = sortedData[i];
    if (day.completionRate >= 0.7) { // 70% completion threshold
      if (i === sortedData.length - 1) { // Most recent day
        currentStreak++;
        streakDates.unshift(day.date);
      } else {
        // Check if it's consecutive
        const nextDate = new Date(sortedData[i + 1].date);
        const currentDate = new Date(day.date);
        const dayDiff = Math.abs(nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1 && currentStreak > 0) {
          currentStreak++;
          streakDates.unshift(day.date);
        } else if (currentStreak === 0) {
          // Start counting from the most recent completed day
          break;
        }
      }
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
      if (i === sortedData.length - 1) break; // If most recent day is incomplete
    }
  }
  
  return { currentStreak, longestStreak, streakDates };
}

export async function getAnalyticsData(userId: string, days: number = 30): Promise<AnalyticsData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Fetch tasks within the date range
  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      completed: true,
      skipReason: true,
      targetMinutes: true,
      actualMinutes: true,
      completedAt: true,
      date: true,
      createdAt: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Fetch daily notes for mood/energy data
  const notes = await prisma.dailyNote.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      mood: true,
      energyLevel: true,
      completedTasks: true,
      totalTasks: true,
      completionRate: true,
      totalMinutes: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Calculate daily completion rates with enhanced metrics
  const dailyCompletion = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayTasks = tasks.filter((task: any) => {
      const taskDate = new Date(task.date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter((task: any) => task.completed).length;
    const skippedTasks = dayTasks.filter((task: any) => task.skipReason).length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    // Productivity score: (completed - skipped) / total * 100
    const productivity = totalTasks > 0 ? ((completedTasks - skippedTasks * 0.5) / totalTasks) * 100 : 0;

    dailyCompletion.push({
      date: dateStr,
      completionRate,
      totalTasks,
      completedTasks,
      skippedTasks,
      productivity: Math.max(0, productivity), // Ensure non-negative
    });
  }

  // Enhanced category distribution with totals and percentages
  const categoryStats: Record<string, { completed: number; total: number }> = {};
  tasks.forEach((task: any) => {
    if (!categoryStats[task.category]) {
      categoryStats[task.category] = { completed: 0, total: 0 };
    }
    categoryStats[task.category].total++;
    if (task.completed) {
      categoryStats[task.category].completed++;
    }
  });

  const totalCompletedTasks = Object.values(categoryStats).reduce((sum, cat) => sum + cat.completed, 0);
  
  const categoryDistribution = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    completed: stats.completed,
    total: stats.total,
    percentage: totalCompletedTasks > 0 ? (stats.completed / totalCompletedTasks) * 100 : 0,
    color: CATEGORY_COLORS[category] || '#6b7280',
  }));

  // Priority analysis
  const priorityStats: Record<string, { completed: number; total: number }> = {};
  tasks.forEach((task: any) => {
    if (!priorityStats[task.priority]) {
      priorityStats[task.priority] = { completed: 0, total: 0 };
    }
    priorityStats[task.priority].total++;
    if (task.completed) {
      priorityStats[task.priority].completed++;
    }
  });

  const priorityAnalysis = Object.entries(priorityStats).map(([priority, stats]) => ({
    priority,
    completed: stats.completed,
    total: stats.total,
    completionRate: stats.total > 0 ? stats.completed / stats.total : 0,
    color: PRIORITY_COLORS[priority] || '#6b7280',
  }));

  // Calculate enhanced weekly progress
  const weeklyProgress = [];
  const weeksToShow = Math.ceil(days / 7);

  for (let week = 0; week < weeksToShow; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekTasks = tasks.filter((task: any) => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    const totalTasks = weekTasks.length;
    const completedTasks = weekTasks.filter((task: any) => task.completed).length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    const weekNotes = notes.filter((note: any) => {
      const noteDate = new Date(note.date);
      return noteDate >= weekStart && noteDate <= weekEnd;
    });

    const totalMinutes = weekNotes.reduce((sum: number, note: any) => sum + (note.totalMinutes || 0), 0);
    const activeDays = weekNotes.length;
    const avgDailyTasks = activeDays > 0 ? totalTasks / activeDays : 0;

    weeklyProgress.push({
      week: week + 1,
      completionRate,
      totalMinutes,
      avgDailyTasks,
    });
  }

  // Time distribution by category
  const timeStats: Record<string, number> = {};
  tasks.forEach((task: any) => {
    if (task.completed && task.actualMinutes) {
      timeStats[task.category] = (timeStats[task.category] || 0) + task.actualMinutes;
    }
  });

  const totalMinutesSpent = Object.values(timeStats).reduce((sum, minutes) => sum + minutes, 0);
  
  const timeDistribution = Object.entries(timeStats).map(([category, minutes]) => ({
    category,
    minutes,
    hours: Math.round((minutes / 60) * 10) / 10, // Round to 1 decimal
    percentage: totalMinutesSpent > 0 ? (minutes / totalMinutesSpent) * 100 : 0,
    color: CATEGORY_COLORS[category] || '#6b7280',
  }));

  // Mood and energy data with productivity correlation
  const moodEnergyComplete = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayNote = notes.find((note: any) => 
      new Date(note.date).toISOString().split('T')[0] === dateStr
    );
    
    const dayCompletionData = dailyCompletion.find((day) => day.date === dateStr);
    
    // Convert mood enum to number
    const moodNumber = dayNote?.mood ? MOOD_TO_NUMBER[dayNote.mood.toString()] || 5 : 5;
    
    moodEnergyComplete.push({
      date: dateStr,
      mood: moodNumber,
      energyLevel: dayNote?.energyLevel || 5,
      productivity: dayCompletionData?.productivity || 0,
    });
  }

  // Streak analysis
  const streakAnalysis = calculateStreaks(dailyCompletion);

  // Advanced summary with insights
  const completedTasksList = tasks.filter((t: any) => t.completed);
  const skippedTasksList = tasks.filter((t: any) => t.skipReason);
  
  // Find most productive day
  const mostProductiveDay = dailyCompletion.reduce((prev, current) => 
    prev.productivity > current.productivity ? prev : current
  ).date;

  // Find best performing category
  const bestCategory = categoryDistribution.reduce((prev, current) => 
    prev.completed > current.completed ? prev : current
  )?.category || 'N/A';

  // Identify improvement areas
  const improvementAreas = [];
  if (skippedTasksList.length > completedTasksList.length * 0.2) {
    improvementAreas.push('High skip rate');
  }
  if (moodEnergyComplete.reduce((sum, day) => sum + day.energyLevel, 0) / moodEnergyComplete.length < 6) {
    improvementAreas.push('Low energy levels');
  }
  if (dailyCompletion.reduce((sum, day) => sum + day.completionRate, 0) / dailyCompletion.length < 0.7) {
    improvementAreas.push('Low completion rate');
  }

  const totalMinutesFromNotes = notes.reduce((sum: number, note: any) => sum + (note.totalMinutes || 0), 0);
  const avgMoodScore = moodEnergyComplete.reduce((sum, item) => sum + item.mood, 0) / (moodEnergyComplete.length || 1);
  const avgEnergyScore = moodEnergyComplete.reduce((sum, item) => sum + item.energyLevel, 0) / (moodEnergyComplete.length || 1);

  return {
    dailyCompletion,
    categoryDistribution,
    weeklyProgress,
    moodEnergy: moodEnergyComplete,
    priorityAnalysis,
    timeDistribution,
    streakAnalysis,
    summary: {
      totalTasks: tasks.length,
      completedTasks: completedTasksList.length,
      skippedTasks: skippedTasksList.length,
      avgCompletionRate: dailyCompletion.reduce((sum, day) => sum + day.completionRate, 0) / (dailyCompletion.length || 1),
      totalMinutes: totalMinutesFromNotes,
      totalHours: Math.round((totalMinutesFromNotes / 60) * 10) / 10,
      avgEnergyLevel: avgEnergyScore,
      avgMood: avgMoodScore,
      mostProductiveDay,
      bestCategory,
      improvementAreas,
    },
  };
}