'use client';

import MetricsSummary from '@/components/MetricsSummary';
import TaskChecklist from '@/components/TaskChecklist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/spinner';
import { DailyNote, DailyTask } from '@prisma/client';
import { Calendar, ChevronLeft, ChevronRight, LogOut, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [dailyNote, setDailyNote] = useState<DailyNote | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Local state for note content (before saving)
  const [localUserContent, setLocalUserContent] = useState('');
  const [localLearnings, setLocalLearnings] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
        // Only refresh metrics, not the entire task list
        const noteRes = await fetch(`/api/notes/${selectedDate}`);
        if (noteRes.ok) {
          const noteData = await noteRes.json();
          setDailyNote(noteData.note);
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert optimistic update on error
      await fetchDayData();
    }
  };

  const handleTaskCreate = async (taskData: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'completedAt' | 'dailyNoteId'>) => {
    try {
      const response = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        await fetchDayData();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDayData();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
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
        // Update the dailyNote state with the saved content
        setDailyNote((prev) => (prev ? { ...prev, ...updates } : null));
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setSavingNote(false);
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

  if (loading) {
    return <Loader message="Loading your dashboard..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Progress Tracker</h1>
              {user && <span className="text-sm text-muted-foreground">Welcome back, {user.name}</span>}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-32 sm:w-40 text-sm" />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
          {/* Main Column - Task Checklist (Takes priority) */}
          <div className="xl:col-span-2">
            <TaskChecklist
              tasks={tasks}
              date={selectedDate}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
              onTaskDelete={handleTaskDelete}
              onRefresh={fetchDayData}
            />
          </div>

          {/* Right Sidebar - Notes and Metrics */}
          <div className="xl:col-span-2 space-y-4">
            {/* Compact Metrics Summary */}
            {dailyNote && <MetricsSummary note={dailyNote} />}

            {/* Compact Daily Writing Section */}
            {dailyNote && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground">Daily Reflection</h3>
                  <Button
                    onClick={handleNoteSave}
                    disabled={!hasUnsavedChanges || savingNote}
                    size="sm"
                    variant={hasUnsavedChanges ? 'default' : 'outline'}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {savingNote ? 'Saving...' : 'Save'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">How was your day?</label>
                    <textarea
                      value={localUserContent}
                      onChange={(e) => handleNoteContentChange('userContent', e.target.value)}
                      placeholder="Write about your day..."
                      rows={4}
                      className="w-full p-2 text-sm bg-background border border-border rounded-md resize-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">Key learnings or insights</label>
                    <textarea
                      value={localLearnings}
                      onChange={(e) => handleNoteContentChange('learnings', e.target.value)}
                      placeholder="What did you learn today?"
                      rows={3}
                      className="w-full p-2 text-sm bg-background border border-border rounded-md resize-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Click Save to update your notes</span>
                  {hasUnsavedChanges && <span className="text-amber-600 font-medium">Unsaved changes</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
