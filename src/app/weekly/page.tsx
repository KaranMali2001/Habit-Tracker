'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WeeklyReport } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/spinner'
import { ArrowLeft, FileText, TrendingUp, Calendar, BarChart3, LogOut } from 'lucide-react'

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [blogDraft, setBlogDraft] = useState('')
  const [reflections, setReflections] = useState('')
  const [nextWeekGoals, setNextWeekGoals] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

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
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

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
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      {/* Header */}
      <header className="bg-neutral-800/60 border-b border-neutral-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-neutral-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-rose-300">
                Weekly Reports
              </h1>
              {user && <span className="hidden md:inline text-sm text-neutral-400">Welcome, {user.name}</span>}
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} size="sm" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Week Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-neutral-200">Bootcamp Weeks</CardTitle>
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
                            ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40' 
                            : 'text-neutral-300 hover:bg-neutral-700/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Week {week}</span>
                          <div className="flex items-center space-x-1">
                            {report?.published && (
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                            )}
                            {report && (
                              <span className="text-xs text-neutral-400">
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
              <div className="space-y-4 sm:space-y-6">
                {/* Week Summary */}
                <Card className="bg-neutral-800/60 border-neutral-600/50">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <CardTitle className="flex items-center space-x-2 text-neutral-200">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-base sm:text-lg">Week {selectedReport.weekNumber} Summary</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {selectedReport.published ? (
                          <span className="px-2 py-1 bg-green-400/20 text-green-300 border border-green-400/40 rounded-full text-xs font-medium">
                            Published
                          </span>
                        ) : (
                          <Button onClick={publishReport} size="sm" className="bg-rose-500 hover:bg-rose-600">
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center p-3 bg-neutral-700/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-blue-400">
                          {Math.round(selectedReport.avgCompletionRate * 100)}%
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400">Completion Rate</div>
                      </div>
                      <div className="text-center p-3 bg-neutral-700/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-green-400">
                          {selectedReport.completedTasks}
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400">Tasks Completed</div>
                      </div>
                      <div className="text-center p-3 bg-neutral-700/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-purple-400">
                          {Math.floor(selectedReport.totalMinutes / 60)}h
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400">Total Time</div>
                      </div>
                      <div className="text-center p-3 bg-neutral-700/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-orange-400">
                          {selectedReport.dsaTasksCompleted + selectedReport.projectTasksCompleted + selectedReport.writingTasksCompleted}
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400">Category Tasks</div>
                      </div>
                    </div>

                    <div className="bg-neutral-700/40 rounded-lg p-3 sm:p-4 mb-4">
                      <h4 className="font-medium text-neutral-200 mb-2 text-sm sm:text-base">Auto-generated Summary:</h4>
                      <p className="text-neutral-300 text-xs sm:text-sm">{selectedReport.autoSummary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-blue-400/10 border border-blue-400/20 rounded">
                        <div className="font-semibold text-blue-400 text-sm sm:text-base">{selectedReport.dsaTasksCompleted}</div>
                        <div className="text-xs text-blue-400/80">DSA Tasks</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-green-400/10 border border-green-400/20 rounded">
                        <div className="font-semibold text-green-400 text-sm sm:text-base">{selectedReport.projectTasksCompleted}</div>
                        <div className="text-xs text-green-400/80">Project Tasks</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-purple-400/10 border border-purple-400/20 rounded">
                        <div className="font-semibold text-purple-400 text-sm sm:text-base">{selectedReport.writingTasksCompleted}</div>
                        <div className="text-xs text-purple-400/80">Writing Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Draft */}
                <Card className="bg-neutral-800/60 border-neutral-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-neutral-200">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-base sm:text-lg">Weekly Blog Draft</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={blogDraft}
                      onChange={(e) => setBlogDraft(e.target.value)}
                      onBlur={() => updateReport({ blogDraft })}
                      placeholder="Write your weekly blog post here..."
                      rows={8}
                      className="bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400 resize-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                  </CardContent>
                </Card>

                {/* Reflections and Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-neutral-800/60 border-neutral-600/50">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-neutral-200">Reflections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={reflections}
                        onChange={(e) => setReflections(e.target.value)}
                        onBlur={() => updateReport({ reflections })}
                        placeholder="What went well? What could be improved?"
                        rows={6}
                        className="bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400 resize-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-800/60 border-neutral-600/50">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-neutral-200">Next Week Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={nextWeekGoals}
                        onChange={(e) => setNextWeekGoals(e.target.value)}
                        onBlur={() => updateReport({ nextWeekGoals })}
                        placeholder="What are your goals for next week?"
                        rows={6}
                        className="bg-neutral-700/40 border-neutral-600/50 text-neutral-200 placeholder:text-neutral-400 resize-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-neutral-800/60 border-neutral-600/50">
                <CardContent className="py-8 sm:py-12 text-center">
                  <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-500 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-neutral-200 mb-2">
                    Select a Week
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400">
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