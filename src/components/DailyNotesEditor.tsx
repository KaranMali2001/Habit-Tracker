'use client'

import { useState } from 'react'
import { DailyNote, Mood } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DailyNotesEditorProps {
  note: DailyNote
  onUpdate: (updates: Partial<DailyNote>) => void
}

export default function DailyNotesEditor({ note, onUpdate }: DailyNotesEditorProps) {
  const [formData, setFormData] = useState({
    userContent: note.userContent || '',
    learnings: note.learnings || '',
    challenges: note.challenges || '',
    tomorrowPlan: note.tomorrowPlan || '',
    energyLevel: note.energyLevel,
    mood: note.mood
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    onUpdate(formData)
    setHasChanges(false)
  }

  const handleChange = (field: keyof typeof formData, value: string | number | Mood) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-card-foreground mb-6">Daily Notes</h2>

      {/* Auto-generated content (read-only) */}
      {note.autoContent && (
        <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Label className="text-sm font-medium text-blue-400">Auto-generated from skipped tasks:</Label>
          <div className="mt-2 text-sm text-blue-300 whitespace-pre-line">
            {note.autoContent}
          </div>
        </div>
      )}

      {/* Mood and Energy */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="energyLevel">Energy Level (1-10)</Label>
          <Input
            id="energyLevel"
            type="number"
            min="1"
            max="10"
            value={formData.energyLevel}
            onChange={(e) => handleChange('energyLevel', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="mood">Mood</Label>
          <Select value={formData.mood} onValueChange={(value) => handleChange('mood', value as Mood)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXCELLENT">Excellent</SelectItem>
              <SelectItem value="GOOD">Good</SelectItem>
              <SelectItem value="NEUTRAL">Neutral</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="TERRIBLE">Terrible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Content */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="userContent">General Notes</Label>
          <Textarea
            id="userContent"
            value={formData.userContent}
            onChange={(e) => handleChange('userContent', e.target.value)}
            placeholder="Write about your day..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="learnings">What did you learn today?</Label>
          <Textarea
            id="learnings"
            value={formData.learnings}
            onChange={(e) => handleChange('learnings', e.target.value)}
            placeholder="Key learnings, insights, or breakthroughs..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="challenges">What challenges did you face?</Label>
          <Textarea
            id="challenges"
            value={formData.challenges}
            onChange={(e) => handleChange('challenges', e.target.value)}
            placeholder="Difficulties, blockers, or areas of struggle..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tomorrowPlan">What's the plan for tomorrow?</Label>
          <Textarea
            id="tomorrowPlan"
            value={formData.tomorrowPlan}
            onChange={(e) => handleChange('tomorrowPlan', e.target.value)}
            placeholder="Goals and priorities for tomorrow..."
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="ml-4"
        >
          Save Notes
        </Button>
      </div>
    </div>
  )
}