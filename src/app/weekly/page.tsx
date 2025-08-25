'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WeeklyReport } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/spinner'
import { ArrowLeft, FileText, TrendingUp, Calendar, BarChart3 } from 'lucide-react'

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [blogDraft, setBlogDraft] = useState('')
  const [reflections, setReflections] = useState('')
  const [nextWeekGoals, setNextWeekGoals] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekReport(selectedWeek)
    }
  }, [selectedWeek])

  const fetchReports = async () => {
    try {
      // Generate reports for all 8 weeks
      const allReports: WeeklyReport[] = []
      
      for (let week = 1; week <= 8; week++) {
        try {
          const response = await fetch(`/api/reports/weekly/generate/${week}`, {
            method: 'POST'
          })
          if (response.ok) {
            const data = await response.json()
            allReports.push(data.report)
          }
        } catch (error) {
          console.error(`Failed to generate week ${week} report:`, error)
        }
      }
      
      setReports(allReports.sort((a, b) => a.weekNumber - b.weekNumber))
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeekReport = async (weekNumber: number) => {
    try {
      const response = await fetch(`/api/reports/weekly/${weekNumber}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedReport(data.report)
        setBlogDraft(data.report.blogDraft || '')
        setReflections(data.report.reflections || '')
        setNextWeekGoals(data.report.nextWeekGoals || '')
      }
    } catch (error) {
      console.error('Failed to fetch week report:', error)
    }
  }

  const updateReport = async (updates: Partial<WeeklyReport>) => {
    if (!selectedWeek) return

    try {
      const response = await fetch(`/api/reports/weekly/${selectedWeek}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchWeekReport(selectedWeek)
        fetchReports() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update report:', error)
    }
  }

  const publishReport = async () => {
    await updateReport({ published: true })
  }

  if (loading) {
    return <Loader message="Loading weekly reports..." fullScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                Weekly Reports
              </h1>
            </div>
            <Link href="/analytics">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Week Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bootcamp Weeks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
                    const report = reports.find(r => r.weekNumber === week)
                    const isSelected = selectedWeek === week
                    
                    return (
                      <button
                        key={week}
                        onClick={() => setSelectedWeek(week)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Week {week}</span>
                          <div className="flex items-center space-x-1">
                            {report?.published && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                            {report && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(report.avgCompletionRate * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            {selectedReport ? (
              <div className="space-y-6">
                {/* Week Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Week {selectedReport.weekNumber} Summary</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {selectedReport.published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Published
                          </span>
                        ) : (
                          <Button onClick={publishReport} size="sm">
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(selectedReport.avgCompletionRate * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.completedTasks}
                        </div>
                        <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor(selectedReport.totalMinutes / 60)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Total Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedReport.dsaTasksCompleted + selectedReport.projectTasksCompleted + selectedReport.writingTasksCompleted}
                        </div>
                        <div className="text-sm text-muted-foreground">Category Tasks</div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Auto-generated Summary:</h4>
                      <p className="text-muted-foreground text-sm">{selectedReport.autoSummary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded">
                        <div className="font-semibold text-blue-400">{selectedReport.dsaTasksCompleted}</div>
                        <div className="text-xs text-blue-400/80">DSA Tasks</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded">
                        <div className="font-semibold text-green-400">{selectedReport.projectTasksCompleted}</div>
                        <div className="text-xs text-green-400/80">Project Tasks</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded">
                        <div className="font-semibold text-purple-400">{selectedReport.writingTasksCompleted}</div>
                        <div className="text-xs text-purple-400/80">Writing Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Draft */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Weekly Blog Draft</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={blogDraft}
                      onChange={(e) => setBlogDraft(e.target.value)}
                      onBlur={() => updateReport({ blogDraft })}
                      placeholder="Write your weekly blog post here..."
                      rows={8}
                      className="mb-4"
                    />
                  </CardContent>
                </Card>

                {/* Reflections and Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reflections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={reflections}
                        onChange={(e) => setReflections(e.target.value)}
                        onBlur={() => updateReport({ reflections })}
                        placeholder="What went well? What could be improved?"
                        rows={6}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Next Week Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={nextWeekGoals}
                        onChange={(e) => setNextWeekGoals(e.target.value)}
                        onBlur={() => updateReport({ nextWeekGoals })}
                        placeholder="What are your goals for next week?"
                        rows={6}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Select a Week
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a week from the sidebar to view and edit your weekly report
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}