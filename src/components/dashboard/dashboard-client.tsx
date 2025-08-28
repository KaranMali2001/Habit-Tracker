'use client'

import { useTasks, useUpdateTask, useCreateTask } from '@/hooks/use-tasks'
import { useNotes, useUpdateNote } from '@/hooks/use-notes'
import DashboardLoader from "@/components/loading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import ActiveSession from "@/components/dashboard/ActiveSession"
import CompletedTasks from "@/components/dashboard/CompletedTasks"
import QuickNotes from "@/components/dashboard/QuickNotes"
import StatsCards from "@/components/dashboard/StatsCards"
import TaskQueue from "@/components/dashboard/TaskQueue"
import TodayInsights from "@/components/dashboard/TodayInsights"
import type {
  DailyNote,
  DailyTask,
  Priority,
  TaskCategory,
} from "@prisma/client"
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Home,
  List,
  Pause,
  PieChart,
  Play,
  Plus,
  SkipForward,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

interface DashboardClientProps {
  initialTasks: DailyTask[]
  initialNote: DailyNote
  user: any
}

export default function DashboardClient({ 
  initialTasks, 
  initialNote, 
  user: initialUser 
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [user, setUser] = useState<any>(initialUser)
  const [savingNote, setSavingNote] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [skipModalOpen, setSkipModalOpen] = useState(false)
  const [taskToSkip, setTaskToSkip] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState("")
  const [showAutoFill, setShowAutoFill] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [autoFillDates, setAutoFillDates] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 2 months from now
  })
  const [showSkippedModal, setShowSkippedModal] = useState(false)
  const [startDateCalendarOpen, setStartDateCalendarOpen] = useState(false)
  const [endDateCalendarOpen, setEndDateCalendarOpen] = useState(false)

  // Local state for note content (before saving)
  const [localUserContent, setLocalUserContent] = useState("")
  const [localLearnings, setLocalLearnings] = useState("")

  // Track in-progress tasks and active session
  const [inProgressTaskIds, setInProgressTaskIds] = useState<Set<string>>(
    new Set()
  )
  const [activeSession, setActiveSession] = useState<{
    taskId: string
    title: string
    category: string
    priority: string
    startTime: string
    targetMinutes: number
    actualMinutes: number
    progress: number
  } | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Task creation state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    category: "DSA" as TaskCategory,
    priority: "MEDIUM" as Priority,
    targetMinutes: "",
    scheduledTime: "",
  })

  // React Query hooks
  const { data: tasks = initialTasks, isLoading: tasksLoading } = useTasks(selectedDate)
  const { data: dailyNote = initialNote, isLoading: noteLoading } = useNotes(selectedDate)
  const updateTaskMutation = useUpdateTask()
  const createTaskMutation = useCreateTask()
  const updateNoteMutation = useUpdateNote()

  // Update local state when dailyNote changes
  useEffect(() => {
    if (dailyNote) {
      setLocalUserContent(dailyNote.userContent || "")
      setLocalLearnings(dailyNote.learnings || "")
      setHasUnsavedChanges(false)
    }
  }, [dailyNote])

  // Timer effect for active session
  useEffect(() => {
    if (isTimerRunning && activeSession) {
      timerRef.current = setInterval(() => {
        setActiveSession((prev) => {
          if (!prev) return null
          const newActualMinutes = prev.actualMinutes + 1 / 60 // Add 1 second
          const newProgress = prev.targetMinutes
            ? Math.min((newActualMinutes / prev.targetMinutes) * 100, 100)
            : Math.min(newActualMinutes * 2, 100) // Fallback progress calculation

          // Update backend every minute
          if (Math.floor(newActualMinutes) !== Math.floor(prev.actualMinutes)) {
            updateTaskTime(prev.taskId, Math.floor(newActualMinutes))
          }

          return {
            ...prev,
            actualMinutes: newActualMinutes,
            progress: newProgress,
          }
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, activeSession])

  const handleTaskUpdate = async (
    taskId: string,
    updates: Partial<DailyTask>
  ) => {
    updateTaskMutation.mutate({ taskId, updates })
  }

  const confirmSkipTask = () => {
    if (taskToSkip !== null) {
      moveTaskToSkipped(taskToSkip, skipReason || "No reason provided")
      setSkipModalOpen(false)
      setTaskToSkip(null)
      setSkipReason("")
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(
      currentDate.getDate() + (direction === "next" ? 1 : -1)
    )

    const newDate = currentDate.toISOString().split("T")[0]
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  const handleNoteContentChange = (
    field: "userContent" | "learnings",
    value: string
  ) => {
    if (field === "userContent") {
      setLocalUserContent(value)
    } else {
      setLocalLearnings(value)
    }

    // Check if there are unsaved changes
    const hasChanges =
      (field === "userContent" ? value : localUserContent) !==
        (dailyNote?.userContent || "") ||
      (field === "learnings" ? value : localLearnings) !==
        (dailyNote?.learnings || "")

    setHasUnsavedChanges(hasChanges)
  }

  const handleNoteSave = async () => {
    if (!dailyNote || !hasUnsavedChanges) return

    setSavingNote(true)
    try {
      const updates = {
        userContent: localUserContent,
        learnings: localLearnings,
      }

      await updateNoteMutation.mutateAsync({ 
        date: selectedDate, 
        updates 
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Failed to update note:", error)
      toast.error("Failed to save note")
    } finally {
      setSavingNote(false)
    }
  }

  // Helper function to update task actual minutes
  const updateTaskTime = async (taskId: string, minutes: number) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        updates: { actualMinutes: minutes }
      })
    } catch (error) {
      console.error("Failed to update task time:", error)
    }
  }

  // Session management functions
  const handleStartSession = (task: DailyTask) => {
    if (activeSession && activeSession.taskId !== task.id) {
      // Stop current session first
      handlePauseSession()
    }

    setActiveSession({
      taskId: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      startTime: task.scheduledTime || "10:00",
      targetMinutes: task.targetMinutes || 75,
      actualMinutes: task.actualMinutes || 0,
      progress:
        task.targetMinutes && task.actualMinutes
          ? Math.min((task.actualMinutes / task.targetMinutes) * 100, 100)
          : 0,
    })
    setIsTimerRunning(true)
    moveTaskToProgress(task.id)
  }

  const handlePauseSession = () => {
    setIsTimerRunning(false)
  }

  const handleResumeSession = () => {
    setIsTimerRunning(true)
  }

  const handleCompleteSession = () => {
    if (activeSession) {
      moveTaskToCompleted(activeSession.taskId)
      setActiveSession(null)
      setIsTimerRunning(false)
    }
  }

  // Task status transition functions
  const moveTaskToProgress = (taskId: string) => {
    setInProgressTaskIds((prev) => new Set([...prev, taskId]))
    // Clear any completion/skip status
    handleTaskUpdate(taskId, {
      completed: false,
      skipReason: null,
      completedAt: null,
    })
  }

  const moveTaskToTodo = (taskId: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
    // Clear any completion/skip status
    handleTaskUpdate(taskId, {
      completed: false,
      skipReason: null,
      completedAt: null,
    })
  }

  const moveTaskToCompleted = (taskId: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })

    // If this is the active session task, stop the session
    if (activeSession && activeSession.taskId === taskId) {
      setActiveSession(null)
      setIsTimerRunning(false)
    }

    handleTaskUpdate(taskId, { completed: true, completedAt: new Date() })
  }

  const moveTaskToSkipped = (taskId: string, reason: string) => {
    setInProgressTaskIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
    handleTaskUpdate(taskId, {
      completed: false,
      skipReason: reason,
      completedAt: null,
    })
  }

  // Helper function to get task time order from database scheduledTime field
  const getTaskTimeOrder = (task: DailyTask): number => {
    // First, check if we have a scheduled time from the database
    if (task.scheduledTime) {
      const [hours, minutes] = task.scheduledTime.split(":").map(Number)
      return hours * 100 + minutes // e.g., "09:30" becomes 930
    }

    // If no scheduled time, try to extract from title for backward compatibility
    const taskTitle = task.title.toLowerCase()
    const timeMatch = taskTitle.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)
    if (timeMatch) {
      let hours = Number.parseInt(timeMatch[1])
      const minutes = Number.parseInt(timeMatch[2] || "0")
      const period = timeMatch[3].toLowerCase()

      if (period === "pm" && hours !== 12) hours += 12
      if (period === "am" && hours === 12) hours = 0

      return hours * 100 + minutes
    }

    // Fallback: Use priority and creation order
    const baseTime = (() => {
      switch (task.priority) {
        case "HIGH":
          return 700 // 7:00 AM
        case "MEDIUM":
          return 1300 // 1:00 PM
        case "LOW":
          return 1900 // 7:00 PM
        default:
          return 1200 // 12:00 PM
      }
    })()

    // Add a small offset based on creation time to maintain consistent ordering
    const createdAt = new Date(task.createdAt).getTime()
    const offset = Math.floor((createdAt % 1000) / 100) // Small offset 0-9
    return baseTime + offset
  }

  // Filter tasks for selected date only and sort by time order
  const todayTasks = tasks
    .filter((task) => {
      const taskDate = new Date(task.date).toISOString().split("T")[0]
      return taskDate === selectedDate
    })
    .sort((a, b) => getTaskTimeOrder(a) - getTaskTimeOrder(b))

  // Categorize today's tasks (maintaining time order)
  const todoTasks = todayTasks.filter(
    (task) =>
      !task.completed && !task.skipReason && !inProgressTaskIds.has(task.id)
  )
  const doneTasks = todayTasks.filter((task) => task.completed)
  const skippedTasksList = todayTasks.filter((task) => task.skipReason)

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case "DSA":
        return "bg-rose-400/25 text-rose-200 border-rose-400/40"
      case "PROJECT":
        return "bg-pink-400/25 text-pink-200 border-pink-400/40"
      case "WRITING":
        return "bg-red-400/25 text-red-200 border-red-400/40"
      case "LEARNING":
        return "bg-green-400/25 text-green-200 border-green-400/40"
      case "APPLICATION":
        return "bg-blue-400/25 text-blue-200 border-blue-400/40"
      case "INTERVIEW_PREP":
        return "bg-purple-400/25 text-purple-200 border-purple-400/40"
      default:
        return "bg-neutral-400/25 text-neutral-200 border-neutral-400/40"
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const taskData = {
        title: newTask.title.trim(),
        category: newTask.category,
        priority: newTask.priority,
        targetMinutes: newTask.targetMinutes
          ? Number.parseInt(newTask.targetMinutes)
          : undefined,
        scheduledTime: newTask.scheduledTime || undefined,
        date: selectedDate,
      }

      await createTaskMutation.mutateAsync(taskData)

      // Reset form
      setNewTask({
        title: "",
        category: "DSA",
        priority: "MEDIUM",
        targetMinutes: "",
        scheduledTime: "",
      })
      setShowAddTaskModal(false)
      toast.success("Task created successfully")
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  const handleAutoFillSchedule = async () => {
    setIsAutoFilling(true)
    const toastId = toast.loading("Creating tasks...")

    try {
      const response = await fetch("/api/tasks/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(autoFillDates),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully created ${result.tasksCreated} tasks!`, {
          id: toastId,
        })
        setShowAutoFill(false)
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.error}`, { id: toastId })
      }
    } catch (error) {
      console.error("Auto-fill failed:", error)
      toast.error("Failed to auto-fill tasks. Please try again.", {
        id: toastId,
      })
    } finally {
      setIsAutoFilling(false)
    }
  }

  if (tasksLoading || noteLoading) {
    return <DashboardLoader loadingText="Loading your dashboard..." />
  }

  const handleSkipTaskClick = (taskId: string) => {
    setTaskToSkip(taskId)
    setSkipModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Focused Organizer</h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {selectedDate === new Date().toISOString().split("T")[0] &&
                      " • Today"}
                  </p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary bg-primary/10"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selectedDate === new Date().toISOString().split("T")[0] && (
                    <span className="ml-2 text-primary font-semibold">
                      • Today
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Next
                </Button>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(selectedDate)}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date.toISOString().split("T")[0])
                        setCalendarOpen(false)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Button size="sm" variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddTaskModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
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
                    <h3 className="text-lg font-medium text-rose-200">
                      Bootcamp Journey
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {user.targetRole} • {user.targetSalary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-300">
                    Day{" "}
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(user.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-400 font-medium">
                    Started:{" "}
                    {new Date(user.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-rose-400 font-medium">
                    Target:{" "}
                    {new Date(
                      new Date(user.startDate).getTime() +
                        100 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="relative h-3 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((new Date().getTime() -
                            new Date(user.startDate).getTime()) /
                            (1000 * 60 * 60 * 24) /
                            100) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-neutral-400 mt-2">
                  <span>Day 1</span>
                  <span className="text-neutral-200">
                    {Math.floor(
                      ((new Date().getTime() -
                        new Date(user.startDate).getTime()) /
                        (1000 * 60 * 60 * 24) /
                        100) *
                        100
                    )}
                    % Complete
                  </span>
                  <span>Day 100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <StatsCards todayTasks={todayTasks} doneTasks={doneTasks} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeSession && (
              <ActiveSession
                activeSession={activeSession}
                isTimerRunning={isTimerRunning}
                onPauseSession={handlePauseSession}
                onResumeSession={handleResumeSession}
                onCompleteSession={handleCompleteSession}
              />
            )}

            <TaskQueue
              todoTasks={todoTasks}
              activeSession={activeSession}
              onStartSession={handleStartSession}
              onMoveToCompleted={moveTaskToCompleted}
              onMoveToTodo={moveTaskToTodo}
              onSkipTask={handleSkipTaskClick}
              onUpdateTask={handleTaskUpdate}
              onShowAddTaskModal={() => setShowAddTaskModal(true)}
              onShowAutoFill={() => setShowAutoFill(true)}
            />
          </div>

          <div className="space-y-6">
            <TodayInsights
              todayTasks={todayTasks}
              doneTasks={doneTasks}
              dailyNote={dailyNote}
            />

            <QuickNotes
              localUserContent={localUserContent}
              hasUnsavedChanges={hasUnsavedChanges}
              savingNote={savingNote}
              onContentChange={handleNoteContentChange}
              onSave={handleNoteSave}
            />

            <CompletedTasks doneTasks={doneTasks} />

            {skippedTasksList.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SkipForward className="w-5 h-5 text-orange-500" />
                      Skipped Tasks
                      <Badge variant="secondary">
                        {skippedTasksList.length}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSkippedModal(true)}
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <SkipForward className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm mb-2">
                      {skippedTasksList.length} task
                      {skippedTasksList.length !== 1 ? "s" : ""} skipped today
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSkippedModal(true)}
                    >
                      Manage Skipped Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All the existing modals remain the same */}
        {/* Skip Task Modal */}
        <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
          <DialogContent className="bg-neutral-800 border-neutral-600">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-300">
                <AlertTriangle className="w-5 h-5" />
                Skip Task Confirmation
              </DialogTitle>
              <DialogDescription className="text-neutral-300">
                {taskToSkip !== null &&
                  `Are you sure you want to skip "${
                    tasks.find((t) => t.id === taskToSkip)?.title
                  }"?`}
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
              <Button
                variant="outline"
                onClick={() => setSkipModalOpen(false)}
                className="border-neutral-600 text-neutral-300"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSkipTask}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
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
              <DialogDescription className="text-neutral-300">
                Create a new task for{" "}
                {new Date(selectedDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="taskTitle" className="text-neutral-200">
                  Task Title
                </Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter task title"
                  className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-neutral-200">
                    Category
                  </Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        category: value as TaskCategory,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      <SelectItem value="DSA">DSA</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                      <SelectItem value="WRITING">Writing</SelectItem>
                      <SelectItem value="LEARNING">Learning</SelectItem>
                      <SelectItem value="APPLICATION">Application</SelectItem>
                      <SelectItem value="INTERVIEW_PREP">
                        Interview Prep
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-neutral-200">
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        priority: value as Priority,
                      }))
                    }
                  >
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
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        targetMinutes: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                    className="mt-1 bg-neutral-700 border-neutral-600 text-neutral-200"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddTaskModal(false)}
                className="border-neutral-600 text-neutral-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                className="bg-rose-500 hover:bg-rose-600 text-white"
                disabled={!newTask.title.trim()}
              >
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
              <DialogDescription className="text-neutral-300">
                Create tasks based on your bootcamp routine
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  <strong>📋 Auto-Fill Schedule</strong>
                  <br />
                  Create a full day's tasks with proper timing based on your
                  bootcamp routine. Perfect for maintaining consistency and
                  structure.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const year = today.getFullYear()
                    const month = String(today.getMonth() + 1).padStart(2, "0")
                    const day = String(today.getDate()).padStart(2, "0")
                    const todayFormatted = `${year}-${month}-${day}`
                    setAutoFillDates({
                      startDate: todayFormatted,
                      endDate: todayFormatted,
                    })
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Today Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const nextWeek = new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    )

                    const formatDate = (date: Date) => {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      )
                      const day = String(date.getDate()).padStart(2, "0")
                      return `${year}-${month}-${day}`
                    }

                    setAutoFillDates({
                      startDate: formatDate(today),
                      endDate: formatDate(nextWeek),
                    })
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Next Week
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    const nextMonth = new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    )

                    const formatDate = (date: Date) => {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      )
                      const day = String(date.getDate()).padStart(2, "0")
                      return `${year}-${month}-${day}`
                    }

                    setAutoFillDates({
                      startDate: formatDate(today),
                      endDate: formatDate(nextMonth),
                    })
                  }}
                  className="border-neutral-600 text-neutral-300"
                >
                  Next Month
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-200">Start Date</Label>
                  <Popover
                    open={startDateCalendarOpen}
                    onOpenChange={setStartDateCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-neutral-700 border-neutral-600 text-neutral-200 hover:bg-neutral-600 justify-start"
                      >
                        {new Date(autoFillDates.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-neutral-800 border-neutral-600"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={new Date(autoFillDates.startDate)}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            )
                            const day = String(date.getDate()).padStart(2, "0")
                            const formattedDate = `${year}-${month}-${day}`
                            setAutoFillDates((prev) => ({
                              ...prev,
                              startDate: formattedDate,
                            }))
                            setStartDateCalendarOpen(false)
                          }
                        }}
                        className="bg-neutral-800 text-neutral-200"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-neutral-200">End Date</Label>
                  <Popover
                    open={endDateCalendarOpen}
                    onOpenChange={setEndDateCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-neutral-700 border-neutral-600 text-neutral-200 hover:bg-neutral-600 justify-start"
                      >
                        {new Date(autoFillDates.endDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-neutral-800 border-neutral-600"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={new Date(autoFillDates.endDate)}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear()
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            )
                            const day = String(date.getDate()).padStart(2, "0")
                            const formattedDate = `${year}-${month}-${day}`
                            setAutoFillDates((prev) => ({
                              ...prev,
                              endDate: formattedDate,
                            }))
                            setEndDateCalendarOpen(false)
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
              <Button
                variant="outline"
                onClick={() => setShowAutoFill(false)}
                className="border-neutral-600 text-neutral-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAutoFillSchedule}
                disabled={isAutoFilling}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isAutoFilling ? <>Creating Tasks...</> : "Auto-Fill Tasks"}
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
              <DialogDescription className="text-neutral-300">
                Manage your skipped tasks - you can move them back to your todo
                list
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {skippedTasksList.length === 0 ? (
                <div className="text-center py-8">
                  <SkipForward className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">No skipped tasks</p>
                </div>
              ) : (
                skippedTasksList.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-200 text-sm leading-tight mb-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={getCategoryColor(task.category)}
                            size="sm"
                          >
                            {task.category}
                          </Badge>
                          <span className="text-xs text-orange-300 font-mono">
                            {task.priority}
                          </span>
                          {task.targetMinutes && (
                            <span className="text-xs text-orange-300">
                              {task.targetMinutes}min
                            </span>
                          )}
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
                            handleTaskUpdate(task.id, { skipReason: null })
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
              <Button
                variant="outline"
                onClick={() => setShowSkippedModal(false)}
                className="border-neutral-600 text-neutral-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}