'use client'

import { DailyNote } from '@prisma/client'
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'
import { formatDuration } from '@/lib/time-utils'

interface MetricsSummaryProps {
  note: DailyNote
}

export default function MetricsSummary({ note }: MetricsSummaryProps) {

  const getCompletionColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-400'
    if (rate >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }


  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Today&apos;s Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Completion Rate */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-muted-foreground">Completion</span>
          </div>
          <div className={`text-2xl font-bold mt-1 ${getCompletionColor(note.completionRate)}`}>
            {Math.round(note.completionRate * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {note.completedTasks}/{note.totalTasks} tasks
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-muted-foreground">Time Spent</span>
          </div>
          <div className="text-2xl font-bold text-card-foreground mt-1">
            {formatDuration(note.totalMinutes)}
          </div>
          <div className="text-xs text-muted-foreground">
            Total focus time
          </div>
        </div>

        {/* Energy Level */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-muted-foreground">Energy</span>
          </div>
          <div className="text-2xl font-bold text-card-foreground mt-1">
            {note.energyLevel}/10
          </div>
          <div className="text-xs text-muted-foreground">
            Energy level
          </div>
        </div>

        {/* Mood */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-muted-foreground">Mood</span>
          </div>
          <div className="text-lg font-semibold text-card-foreground mt-1 capitalize">
            {note.mood.toLowerCase()}
          </div>
          <div className="text-xs text-muted-foreground">
            Overall feeling
          </div>
        </div>
      </div>
    </div>
  )
}