'use client'

import { useState } from 'react'
import { DailyTask, TaskCategory, Priority } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Clock, AlertCircle, Calendar } from 'lucide-react'
import { formatTimeToAMPM } from '@/lib/time-utils'
import toast from 'react-hot-toast'

interface TaskChecklistProps {
  tasks: DailyTask[]
  date: string
  onTaskUpdate: (taskId: string, updates: Partial<DailyTask>) => void
  onTaskCreate: (task: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'completedAt' | 'dailyNoteId'>) => void
  onTaskDelete: (taskId: string) => void
  onRefresh?: () => void
}

const categoryColors = {
  DSA: 'bg-blue-500',
  PROJECT: 'bg-green-500',
  WRITING: 'bg-purple-500',
  LEARNING: 'bg-yellow-500',
  APPLICATION: 'bg-red-500',
  INTERVIEW_PREP: 'bg-indigo-500'
}

const priorityIcons = {
  LOW: null,
  MEDIUM: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  HIGH: <AlertCircle className="w-4 h-4 text-red-500" />
}

export default function TaskChecklist({ tasks, date, onTaskUpdate, onTaskCreate, onTaskDelete, onRefresh }: TaskChecklistProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAutoFill, setShowAutoFill] = useState(false)
  const [skipTaskId, setSkipTaskId] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState('')
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'DSA' as TaskCategory,
    priority: 'MEDIUM' as Priority,
    targetMinutes: undefined as number | undefined
  })
  const [autoFillDates, setAutoFillDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 months from now
  })

  const handleTaskComplete = (task: DailyTask, completed: boolean) => {
    onTaskUpdate(task.id, { completed })
  }

  const handleTimeUpdate = (taskId: string, actualMinutes: number) => {
    onTaskUpdate(taskId, { actualMinutes })
  }

  const handleSkipTask = (taskId: string, reason: string) => {
    onTaskUpdate(taskId, { skipReason: reason, completed: false })
    setSkipTaskId(null)
    setSkipReason('')
  }

  const handleAddTask = () => {
    if (!newTask.title) return
    
    onTaskCreate({
      ...newTask,
      targetMinutes: newTask.targetMinutes ?? null,
      date: new Date(date),
      completed: false,
      skipReason: null,
      actualMinutes: null
    })
    
    setNewTask({
      title: '',
      category: 'DSA',
      priority: 'MEDIUM',
      targetMinutes: undefined
    })
    setShowAddTask(false)
  }

  const handleAutoFill = async () => {
    setIsAutoFilling(true)
    const toastId = toast.loading('Creating tasks...')
    
    try {
      const response = await fetch('/api/tasks/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoFillDates)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully created ${result.tasksCreated} tasks!`, { id: toastId })
        setShowAutoFill(false)
        // Refresh the data without page reload
        if (onRefresh) onRefresh()
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.error}`, { id: toastId })
      }
    } catch (error) {
      console.error('Auto-fill failed:', error)
      toast.error('Failed to auto-fill tasks. Please try again.', { id: toastId })
    } finally {
      setIsAutoFilling(false)
    }
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Daily Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {completedTasks}/{tasks.length} completed ({completionRate}%)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAutoFill(true)} size="sm" variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Auto-Fill
          </Button>
          <Button onClick={() => setShowAddTask(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg border border-border ${
            task.skipReason ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            task.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            'bg-muted/50'
          }`}>
            <Checkbox
              checked={task.completed}
              disabled={!!task.skipReason}
              onCheckedChange={(checked) => handleTaskComplete(task, checked as boolean)}
            />
            
            <div className={`w-3 h-3 rounded-full ${categoryColors[task.category]}`} />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  task.completed ? 'line-through text-muted-foreground' : 
                  task.skipReason ? 'text-orange-700 dark:text-orange-300' :
                  'text-card-foreground'
                }`}>
                  {task.title}
                  {task.skipReason && (
                    <span className="text-xs block text-orange-600 dark:text-orange-400 mt-1">
                      Skipped: {task.skipReason}
                    </span>
                  )}
                </span>
                {priorityIcons[task.priority]}
              </div>
              
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                {task.targetMinutes && (
                  <div>Target: {task.targetMinutes} min</div>
                )}
                {/* Show time range if available from schedule */}
                {(() => {
                  const scheduleItem = [
                    { title: 'Wake up', time: '7:45' },
                    { title: 'Exercise', time: '8:00-9:00' },
                    { title: 'Breakfast, cleaning and bath', time: '9:00-10:00' },
                    { title: 'DSA Practice', time: '10:00-11:15' },
                    { title: 'Break', time: '11:15-11:30' },
                    { title: 'Work/Project Development', time: '11:30-12:45' },
                    { title: 'Lunch', time: '12:45-1:45' },
                    { title: 'Work Session', time: '2:00-3:15' },
                    { title: 'Work Session', time: '3:30-4:45' },
                    { title: 'Project Time', time: '5:00-7:00' },
                    { title: 'Badminton, dinner, bath etc', time: '7:00-11:00' },
                    { title: 'Daily reflection writing', time: '11:00-12:00' },
                  ].find(item => task.title.includes(item.title) || item.title.includes(task.title))
                  
                  return scheduleItem ? (
                    <div className="text-blue-600 dark:text-blue-400">
                      🕐 {formatTimeToAMPM(scheduleItem.time)}
                    </div>
                  ) : null
                })()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {task.completed && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={task.actualMinutes || ''}
                    onChange={(e) => handleTimeUpdate(task.id, parseInt(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              )}
              
              {!task.completed && (
                <>
                  {task.skipReason ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTaskUpdate(task.id, { skipReason: null })}
                      className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                    >
                      Un-skip
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkipTaskId(task.id)}
                    >
                      Skip
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskDelete(task.id)}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as TaskCategory }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Priority }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetMinutes">Target Minutes (Optional)</Label>
              <Input
                id="targetMinutes"
                type="number"
                value={newTask.targetMinutes || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, targetMinutes: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Expected time to spend"
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddTask} className="flex-1">
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Reason Modal */}
      <Dialog open={!!skipTaskId} onOpenChange={() => setSkipTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why are you skipping this task?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Enter reason for skipping..."
            />
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => skipTaskId && handleSkipTask(skipTaskId, skipReason)} 
                className="flex-1"
                disabled={!skipReason.trim()}
              >
                Skip Task
              </Button>
              <Button variant="outline" onClick={() => setSkipTaskId(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-Fill Tasks Modal */}
      <Dialog open={showAutoFill} onOpenChange={setShowAutoFill}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Fill Bootcamp Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create daily tasks based on your bootcamp schedule for the selected date range.
              Existing tasks will not be duplicated.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={autoFillDates.startDate}
                  onChange={(e) => setAutoFillDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={autoFillDates.endDate}
                  onChange={(e) => setAutoFillDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-muted p-3 rounded text-xs text-muted-foreground">
              <strong>Daily Schedule:</strong>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <div>• Wake up ({formatTimeToAMPM('7:45')})</div>
                <div>• Exercise ({formatTimeToAMPM('8:00-9:00')})</div>
                <div>• Breakfast & cleaning ({formatTimeToAMPM('9:00-10:00')})</div>
                <div>• DSA Practice ({formatTimeToAMPM('10:00-11:15')})</div>
                <div>• Work/Project ({formatTimeToAMPM('11:30-12:45')})</div>
                <div>• Lunch ({formatTimeToAMPM('12:45-1:45')})</div>
                <div>• Work Session ({formatTimeToAMPM('2:00-3:15')})</div>
                <div>• Work Session ({formatTimeToAMPM('3:30-4:45')})</div>
                <div>• Project Time ({formatTimeToAMPM('5:00-7:00')})</div>
                <div>• Recreation & Dinner ({formatTimeToAMPM('7:00-11:00')})</div>
                <div>• Daily Reflection ({formatTimeToAMPM('11:00-12:00')})</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleAutoFill} 
                className="flex-1"
                disabled={isAutoFilling}
              >
                {isAutoFilling ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating Tasks...
                  </>
                ) : (
                  'Auto-Fill Tasks'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAutoFill(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}