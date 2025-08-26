'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLoader from '@/components/loading';
import { Textarea } from '@/components/ui/textarea';
import { DailyNote, DailyTask, Priority, TaskCategory } from '@prisma/client';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  LogOut,
  Plus,
  Save,
  SkipForward,
  StickyNote,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Dashboard({ task, note }: { task: DailyTask[]; note: DailyNote }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>(task);
  const [dailyNote, setDailyNote] = useState<DailyNote | null>(note);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillDates, setAutoFillDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 months from now
  });
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [startDateCalendarOpen, setStartDateCalendarOpen] = useState(false);
  const [endDateCalendarOpen, setEndDateCalendarOpen] = useState(false);

  // Local state for note content (before saving)
  const [localUserContent, setLocalUserContent] = useState('');
  const [localLearnings, setLocalLearnings] = useState('');

  // Track in-progress tasks (you might want to add this to your schema later)
  const [inProgressTaskIds, setInProgressTaskIds] = useState<Set<string>>(new Set());

  // Task creation state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'DSA' as TaskCategory,
    priority: 'MEDIUM' as Priority,
    targetMinutes: '',
    scheduledTime: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && selectedDate !== new Date().toISOString().split('T')[0]) {
      fetchDayData();
    }
  }, [selectedDate, user]);

  // Update local state when dailyNote changes
  useEffect(() => {
    if (dailyNote) {
      setLocalUserContent(dailyNote.userContent || '');
      setLocalLearnings(dailyNote.learnings || '');
      setHasUnsavedChanges(false);
    }
  }, [dailyNote]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      router.push('/login');
    }
  };

  const fetchDayData = async () => {
    setLoading(true);
    try {
      const [tasksRes, noteRes] = await Promise.all([fetch(`/api/tasks/daily/${selectedDate}`), fetch(`/api/notes/${selectedDate}`)]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks);
      }

      if (noteRes.ok) {
        const noteData = await noteRes.json();
        setDailyNote(noteData.note);
      }
    } catch (error) {
      console.error('Failed to fetch day data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<DailyTask>) => {
    // Optimistic update
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchDayData();
      } else {
        // Refresh notes to update metrics
        const noteRes = await fetch(`/api/notes/${selectedDate}`);
        if (noteRes.ok) {
          const noteData = await noteRes.json();
          setDailyNote(noteData.note);
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      await fetchDayData();
    }
  };

  const confirmSkipTask = () => {
    if (taskToSkip !== null) {
      moveTaskToSkipped(taskToSkip, skipReason || 'No reason provided');
      setSkipModalOpen(false);
      setTaskToSkip(null);
      setSkipReason('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleNoteContentChange = (field: 'userContent' | 'learnings', value: string) => {
    if (field === 'userContent') {
      setLocalUserContent(value);
    } else {
      setLocalLearnings(value);
    }

    // Check if there are unsaved changes
    const hasChanges =
      (field === 'userContent' ? value : localUserContent) !== (dailyNote?.userContent || '') ||
      (field === 'learnings' ? value : localLearnings) !== (dailyNote?.learnings || '');

    setHasUnsavedChanges(hasChanges);
  };

  const handleNoteSave = async () => {
    if (!dailyNote || !hasUnsavedChanges) return;

    setSavingNote(true);
    try {
      const updates = {
        userContent: localUserContent,
        learnings: localLearnings,
      };

      const response = await fetch(`/api/notes/${selectedDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setDailyNote((prev) => (prev ? { ...prev, ...updates } : null));
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  // Task status transition functions
  const moveTaskToProgress = (taskId: string) => {
    setInProgressTaskIds((prev) => new Set([...prev, taskId]));
    // Clear any completion/skip status
    handleTaskUpdate(taskId, { completed: false, skipReason: null, completedAt: null });
  };

  const moveTaskToTodo = (taskId: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    // Clear any completion/skip status
    handleTaskUpdate(taskId, { completed: false, skipReason: null, completedAt: null });
  };

  const moveTaskToCompleted = (taskId: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    handleTaskUpdate(taskId, { completed: true, completedAt: new Date() });
  };

  const moveTaskToSkipped = (taskId: string, reason: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    handleTaskUpdate(taskId, { completed: false, skipReason: reason, completedAt: null });
  };

  // Helper function to get task time order from database scheduledTime field
  const getTaskTimeOrder = (task: DailyTask): number => {
    // First, check if we have a scheduled time from the database
    if (task.scheduledTime) {
      const [hours, minutes] = task.scheduledTime.split(':').map(Number);
      return hours * 100 + minutes; // e.g., "09:30" becomes 930
    }

    // If no scheduled time, try to extract from title for backward compatibility
    const taskTitle = task.title.toLowerCase();
    const timeMatch = taskTitle.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const period = timeMatch[3].toLowerCase();

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return hours * 100 + minutes;
    }

    // Fallback: Use priority and creation order
    const baseTime = (() => {
      switch (task.priority) {
        case 'HIGH':
          return 700; // 7:00 AM
        case 'MEDIUM':
          return 1300; // 1:00 PM
        case 'LOW':
          return 1900; // 7:00 PM
        default:
          return 1200; // 12:00 PM
      }
    })();

    // Add a small offset based on creation time to maintain consistent ordering
    const createdAt = new Date(task.createdAt).getTime();
    const offset = Math.floor((createdAt % 1000) / 100); // Small offset 0-9
    return baseTime + offset;
  };

  // Filter tasks for today only and sort by time order
  const todayTasks = tasks
    .filter((task) => {
      const taskDate = new Date(task.date).toISOString().split('T')[0];
      return taskDate === selectedDate;
    })
    .sort((a, b) => getTaskTimeOrder(a) - getTaskTimeOrder(b));

  // Categorize today's tasks (maintaining time order)
  const todoTasks = todayTasks.filter((task) => !task.completed && !task.skipReason && !inProgressTaskIds.has(task.id));
  const progressTasks = todayTasks.filter((task) => !task.completed && !task.skipReason && inProgressTaskIds.has(task.id));
  const doneTasks = todayTasks.filter((task) => task.completed);
  const skippedTasksList = todayTasks.filter((task) => task.skipReason);

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'DSA':
        return 'bg-rose-400/25 text-rose-200 border-rose-400/40';
      case 'PROJECT':
        return 'bg-pink-400/25 text-pink-200 border-pink-400/40';
      case 'WRITING':
        return 'bg-red-400/25 text-red-200 border-red-400/40';
      case 'LEARNING':
        return 'bg-green-400/25 text-green-200 border-green-400/40';
      case 'APPLICATION':
        return 'bg-blue-400/25 text-blue-200 border-blue-400/40';
      case 'INTERVIEW_PREP':
        return 'bg-purple-400/25 text-purple-200 border-purple-400/40';
      default:
        return 'bg-neutral-400/25 text-neutral-200 border-neutral-400/40';
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        title: newTask.title.trim(),
        category: newTask.category,
        priority: newTask.priority,
        targetMinutes: newTask.targetMinutes ? parseInt(newTask.targetMinutes) : null,
        scheduledTime: newTask.scheduledTime || null,
        date: selectedDate,
      };

      const response = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        // Reset form
        setNewTask({
          title: '',
          category: 'DSA',
          priority: 'MEDIUM',
          targetMinutes: '',
          scheduledTime: '',
        });
        setShowAddTaskModal(false);

        // Refresh data
        await fetchDayData();
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    const toastId = toast.loading('Creating tasks...');

    try {
      const response = await fetch('/api/tasks/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoFillDates),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully created ${result.tasksCreated} tasks!`, { id: toastId });
        setShowAutoFill(false);
        // Refresh the data
        await fetchDayData();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`, { id: toastId });
      }
    } catch (error) {
      console.error('Auto-fill failed:', error);
      toast.error('Failed to auto-fill tasks. Please try again.', { id: toastId });
    } finally {
      setIsAutoFilling(false);
    }
  };

  if (loading) {
    return <DashboardLoader loadingText="Loading your dashboard..." />;
  }

  const TaskCard = ({ task, status }: { task: DailyTask; status: string }) => (
    <div className="p-4 bg-card/60 rounded-lg border border-border hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-neutral-50 text-sm leading-tight">{task.title}</h4>
        <div className="flex gap-1 ml-2">
          {status === 'todo' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-pink-400/20"
                onClick={() => moveTaskToProgress(task.id)}
                title="Start task"
              >
                <Clock className="w-4 h-4 text-pink-300" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-green-400/20"
                onClick={() => moveTaskToCompleted(task.id)}
                title="Mark complete"
              >
                <CheckCircle className="w-4 h-4 text-green-300" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-orange-400/20"
                onClick={() => {
                  setTaskToSkip(task.id);
                  setSkipModalOpen(true);
                }}
                title="Skip task"
              >
                <SkipForward className="w-3 h-3 text-orange-300" />
              </Button>
            </>
          )}

          {status === 'progress' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-neutral-400/20"
                onClick={() => moveTaskToTodo(task.id)}
                title="Move back to todo"
              >
                <Circle className="w-4 h-4 text-neutral-300" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-green-400/20"
                onClick={() => moveTaskToCompleted(task.id)}
                title="Mark complete"
              >
                <CheckCircle className="w-4 h-4 text-green-300" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-orange-400/20"
                onClick={() => {
                  setTaskToSkip(task.id);
                  setSkipModalOpen(true);
                }}
                title="Skip task"
              >
                <SkipForward className="w-3 h-3 text-orange-300" />
              </Button>
            </>
          )}

          {status === 'done' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-neutral-400/20"
                onClick={() => moveTaskToTodo(task.id)}
                title="Move back to todo"
              >
                <Circle className="w-4 h-4 text-neutral-300" />
              </Button>
              <CheckCircle className="w-4 h-4 text-green-300" />
            </>
          )}

          {status === 'skipped' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-neutral-400/20"
                onClick={() => {
                  handleTaskUpdate(task.id, { skipReason: null });
                }}
                title="Move back to todo"
              >
                <Circle className="w-4 h-4 text-neutral-300" />
              </Button>
              <X className="w-4 h-4 text-orange-300" />
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Badge className={getCategoryColor(task.category)} size="sm">
          {task.category}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <span className="font-mono text-rose-200">{task.priority}</span>
          {task.targetMinutes && (
            <>
              <span>•</span>
              <span>{task.targetMinutes}min</span>
            </>
          )}
          <span>•</span>
          <span className="text-blue-300">
            {task.scheduledTime
              ? // Display actual scheduled time from database
                (() => {
                  const [hours, minutes] = task.scheduledTime.split(':').map(Number);
                  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                  const period = hours >= 12 ? 'PM' : 'AM';
                  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                })()
              : // Fallback display for calculated time
                (() => {
                  const timeOrder = getTaskTimeOrder(task);
                  const hours = Math.floor(timeOrder / 100);
                  const minutes = timeOrder % 100;
                  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                  const period = hours >= 12 ? 'PM' : 'AM';
                  return `~${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                })()}
          </span>
        </div>

        {task.skipReason && (
          <div className="mt-2 p-2 bg-orange-900/20 border border-orange-600/30 rounded text-xs text-orange-200">
            <strong>Skipped:</strong> {task.skipReason}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-primary">Power Board</h1>
              {user && <span className="text-sm text-muted-foreground">Welcome back, {user.name}</span>}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-32 sm:w-40 text-sm bg-neutral-700 border-neutral-600 text-neutral-200 hover:bg-neutral-600"
                    >
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-600" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={new Date(selectedDate)}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date.toISOString().split('T')[0]);
                          setCalendarOpen(false);
                        }
                      }}
                      className="bg-neutral-800 text-neutral-200"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
                Today
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Link href="/weekly">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Weekly Reports
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Analytics
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-xl font-medium text-rose-200 mb-2">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {selectedDate === new Date().toISOString().split('T')[0] && (
              <span className="ml-2 text-sm bg-rose-500 text-white px-2 py-1 rounded">Today</span>
            )}
          </h2>
          <p className="text-neutral-300">Manage your daily tasks and track progress</p>
        </div>

        {/* Bootcamp Timeline */}
        {user && user.startDate && (
          <Card className="bg-neutral-800/60 border-neutral-600/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-rose-200">Bootcamp Journey</h3>
                    <p className="text-sm text-neutral-400">{user.targetRole} • {user.targetSalary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-300">
                    Day {Math.floor((new Date().getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-400 font-medium">
                    Started: {new Date(user.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="text-rose-400 font-medium">
                    Target: {new Date(new Date(user.startDate).getTime() + (100 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="relative h-3 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24)) / 100 * 100))}%`
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-neutral-400 mt-2">
                  <span>Day 1</span>
                  <span className="text-neutral-200">
                    {Math.floor(((new Date().getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24)) / 100 * 100)}% Complete
                  </span>
                  <span>Day 100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 text-center">
              <Circle className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
              <p className="text-2xl font-bold text-neutral-200">{todoTasks.length}</p>
              <p className="text-sm text-neutral-300">To Do</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-pink-300 mx-auto mb-2" />
              <p className="text-2xl font-bold text-pink-300">{progressTasks.length}</p>
              <p className="text-sm text-neutral-300">In Progress</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-300 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-300">{doneTasks.length}</p>
              <p className="text-sm text-neutral-300">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 text-center">
              <SkipForward className="w-6 h-6 text-orange-300 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-300">{skippedTasksList.length}</p>
              <p className="text-sm text-neutral-300">Skipped</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-neutral-200">
                  <div className="flex items-center gap-2">
                    <Circle className="w-5 h-5 text-neutral-300" />
                    To Do
                    <Badge className="bg-neutral-600/60 text-neutral-200">{todoTasks.length}</Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAutoFill(true)}
                      className="h-6 w-6 p-0 hover:bg-blue-400/20 text-neutral-400 hover:text-blue-300"
                      title="Auto-Fill Schedule"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddTaskModal(true)}
                      className="h-6 w-6 p-0 hover:bg-rose-400/20 text-neutral-400 hover:text-rose-300"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {todoTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Circle className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm">No tasks for today</p>
                      <p className="text-neutral-500 text-xs mb-3">Get started by adding tasks or use auto-fill</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddTaskModal(true)}
                          className="border-neutral-600 text-neutral-300 hover:bg-rose-500/10 hover:border-rose-400"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAutoFill(true)}
                          className="border-neutral-600 text-neutral-300 hover:bg-blue-500/10 hover:border-blue-400"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Auto-Fill
                        </Button>
                      </div>
                    </div>
                  ) : (
                    todoTasks.map((task) => <TaskCard key={task.id} task={task} status="todo" />)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-300">
                  <Clock className="w-5 h-5" />
                  In Progress
                  <Badge className="bg-pink-400/25 text-pink-200 border-pink-400/40">{progressTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {progressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} status="progress" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  Completed
                  <Badge className="bg-green-400/25 text-green-200 border-green-400/40">{doneTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {doneTasks.map((task) => (
                    <TaskCard key={task.id} task={task} status="done" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-200">
                  <StickyNote className="w-5 h-5 text-rose-300" />
                  Daily Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-2">How was your day?</label>
                    <Textarea
                      placeholder="Write about your day..."
                      value={localUserContent}
                      onChange={(e) => handleNoteContentChange('userContent', e.target.value)}
                      className="min-h-[100px] bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-2">Key learnings</label>
                    <Textarea
                      placeholder="What did you learn today?"
                      value={localLearnings}
                      onChange={(e) => handleNoteContentChange('learnings', e.target.value)}
                      className="min-h-[100px] bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handleNoteSave}
                      disabled={!hasUnsavedChanges || savingNote}
                      size="sm"
                      variant={hasUnsavedChanges ? 'default' : 'outline'}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingNote ? 'Saving...' : 'Save'}
                    </Button>
                    {hasUnsavedChanges && <span className="text-xs text-amber-400">Unsaved changes</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {skippedTasksList.length > 0 && (
              <Card className="bg-neutral-800/60 border-neutral-600/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-orange-300">
                    <div className="flex items-center gap-2">
                      <SkipForward className="w-5 h-5" />
                      Skipped Tasks
                      <Badge className="bg-orange-400/25 text-orange-200 border-orange-400/40">{skippedTasksList.length}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSkippedModal(true)}
                      className="border-orange-400/40 text-orange-300 hover:bg-orange-400/10"
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center py-4">
                    <SkipForward className="w-8 h-8 text-orange-400/60 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm mb-2">
                      {skippedTasksList.length} task{skippedTasksList.length !== 1 ? 's' : ''} skipped today
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSkippedModal(true)}
                      className="border-orange-400/40 text-orange-300 hover:bg-orange-400/10"
                    >
                      Manage Skipped Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
          <DialogContent className="bg-neutral-800 border-neutral-600">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-300">
                <AlertTriangle className="w-5 h-5" />
                Skip Task Confirmation
              </DialogTitle>
              <DialogDescription className="text-neutral-300">
                {taskToSkip !== null && `Are you sure you want to skip "${tasks.find((t) => t.id === taskToSkip)?.title}"?`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Why are you skipping this task? (optional)"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSkipModalOpen(false)} className="border-neutral-600 text-neutral-300">
                Cancel
              </Button>
              <Button onClick={confirmSkipTask} className="bg-orange-500 hover:bg-orange-600 text-white">
                Skip Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Task Modal */}
        <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
          <DialogContent className="bg-neutral-800 border-neutral-600">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-300">
                <Plus className="w-5 h-5" />
                Add New Task
              </DialogTitle>
              <DialogDescription className="text-neutral-300">Create a new task for {new Date(selectedDate).toLocaleDateString()}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="taskTitle" className="text-neutral-200">
                  Task Title
                </Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-neutral-200">
                    Category
                  </Label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value as TaskCategory }))}>
                    <SelectTrigger className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      <SelectItem value="DSA">DSA</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                      <SelectItem value="WRITING">Writing</SelectItem>
                      <SelectItem value="LEARNING">Learning</SelectItem>
                      <SelectItem value="APPLICATION">Application</SelectItem>
                      <SelectItem value="INTERVIEW_PREP">Interview Prep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-neutral-200">
                    Priority
                  </Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value as Priority }))}>
                    <SelectTrigger className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetMinutes" className="text-neutral-200">
                    Target Minutes
                  </Label>
                  <Input
                    id="targetMinutes"
                    type="number"
                    value={newTask.targetMinutes}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, targetMinutes: e.target.value }))}
                    placeholder="Expected time"
                    className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200"
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledTime" className="text-neutral-200">
                    Scheduled Time
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={newTask.scheduledTime}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                    className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTaskModal(false)} className="border-neutral-600 text-neutral-300">
                Cancel
              </Button>
              <Button onClick={handleCreateTask} className="bg-rose-500 hover:bg-rose-600 text-white" disabled={!newTask.title.trim()}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auto-Fill Tasks Modal */}
        <Dialog open={showAutoFill} onOpenChange={setShowAutoFill}>
          <DialogContent className="bg-neutral-800 border-neutral-600 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-300">
                <Calendar className="w-5 h-5" />
                Auto-Fill Bootcamp Schedule
              </DialogTitle>
              <DialogDescription className="text-neutral-300">Create tasks based on your bootcamp routine</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  <strong>📅 Auto-Fill Schedule</strong>
                  <br />
                  Create a full day's tasks with proper timing based on your bootcamp routine. Perfect for maintaining consistency and structure.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const todayFormatted = `${year}-${month}-${day}`;
                    setAutoFillDates({ startDate: todayFormatted, endDate: todayFormatted });
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Today Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    
                    const formatDate = (date: Date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    };
                    
                    setAutoFillDates({ 
                      startDate: formatDate(today), 
                      endDate: formatDate(nextWeek) 
                    });
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Next Week
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    const formatDate = (date: Date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    };
                    
                    setAutoFillDates({ 
                      startDate: formatDate(today), 
                      endDate: formatDate(nextMonth) 
                    });
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Next Month
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-200">Start Date</Label>
                  <Popover open={startDateCalendarOpen} onOpenChange={setStartDateCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-neutral-700 border-neutral-600 text-neutral-200 hover:bg-neutral-600 justify-start"
                      >
                        {new Date(autoFillDates.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-600" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={new Date(autoFillDates.startDate)}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day}`;
                            setAutoFillDates((prev) => ({ ...prev, startDate: formattedDate }));
                            setStartDateCalendarOpen(false);
                          }
                        }}
                        className="bg-neutral-800 text-neutral-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-neutral-200">End Date</Label>
                  <Popover open={endDateCalendarOpen} onOpenChange={setEndDateCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-neutral-700 border-neutral-600 text-neutral-200 hover:bg-neutral-600 justify-start"
                      >
                        {new Date(autoFillDates.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-neutral-800 border-neutral-600" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={new Date(autoFillDates.endDate)}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day}`;
                            setAutoFillDates((prev) => ({ ...prev, endDate: formattedDate }));
                            setEndDateCalendarOpen(false);
                          }
                        }}
                        className="bg-neutral-800 text-neutral-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="bg-neutral-700/40 p-3 rounded text-xs text-neutral-300">
                <strong>📋 Schedule Preview:</strong>
                <div className="grid grid-cols-1 gap-1 mt-2 max-h-32 overflow-y-auto">
                  <div>🌅 7:45 AM - Wake up</div>
                  <div>💪 8:00 AM - Exercise (60 min)</div>
                  <div>🍳 9:00 AM - Breakfast & cleaning (60 min)</div>
                  <div>🧠 10:00 AM - DSA Practice (75 min)</div>
                  <div>☕ 11:15 AM - Break (15 min)</div>
                  <div>💻 11:30 AM - Work/Project Development (75 min)</div>
                  <div>🍽️ 12:45 PM - Lunch (60 min)</div>
                  <div>⚡ 2:00 PM - Work Session (75 min)</div>
                  <div>☕ 3:15 PM - Break (15 min)</div>
                  <div>💼 3:30 PM - Work Session (75 min)</div>
                  <div>🚀 5:00 PM - Project Time (120 min)</div>
                  <div>🏸 7:00 PM - Badminton & dinner (240 min)</div>
                  <div>📝 11:00 PM - Daily reflection (60 min)</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutoFill(false)} className="border-neutral-600 text-neutral-300">
                Cancel
              </Button>
              <Button onClick={handleAutoFill} disabled={isAutoFilling} className="bg-blue-500 hover:bg-blue-600 text-white">
                {isAutoFilling ? <>Creating Tasks...</> : 'Auto-Fill Tasks'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Skipped Tasks Modal */}
        <Dialog open={showSkippedModal} onOpenChange={setShowSkippedModal}>
          <DialogContent className="bg-neutral-800 border-neutral-600 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-300">
                <SkipForward className="w-5 h-5" />
                Skipped Tasks ({skippedTasksList.length})
              </DialogTitle>
              <DialogDescription className="text-neutral-300">Manage your skipped tasks - you can move them back to your todo list</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {skippedTasksList.length === 0 ? (
                <div className="text-center py-8">
                  <SkipForward className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">No skipped tasks</p>
                </div>
              ) : (
                skippedTasksList.map((task) => (
                  <div key={task.id} className="p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-200 text-sm leading-tight mb-1">{task.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(task.category)} size="sm">
                            {task.category}
                          </Badge>
                          <span className="text-xs text-orange-300 font-mono">{task.priority}</span>
                          {task.targetMinutes && <span className="text-xs text-orange-300">{task.targetMinutes}min</span>}
                        </div>
                        {task.skipReason && (
                          <div className="text-xs text-orange-400 bg-orange-900/30 p-2 rounded border border-orange-600/20">
                            <strong>Reason:</strong> {task.skipReason}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleTaskUpdate(task.id, { skipReason: null });
                          }}
                          className="border-green-600 text-green-300 hover:bg-green-500/10 hover:border-green-500"
                        >
                          <Circle className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkippedModal(false)} className="border-neutral-600 text-neutral-300">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
