'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/spinner';
import { useLogout, useUser } from '@/hooks/use-auth';
import { useAnalytics } from '@/hooks/use-dashboard';
import { AnalyticsData } from '@/lib/analytics';
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  LogOut, 
  PieChart, 
  TrendingUp, 
  Target, 
  Activity, 
  Clock,
  Trophy,
  Zap,
  Award,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';

interface AnalyticsClientProps {
  initialAnalyticsData: AnalyticsData | null;
  user: any;
}

export default function AnalyticsClient({ 
  initialAnalyticsData, 
  user: initialUser 
}: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState('30');
  
  const { data: user } = useUser();
  const { data, isLoading: analyticsLoading, error } = useAnalytics(dateRange);
  const logoutMutation = useLogout();

  const analyticsData = data || initialAnalyticsData;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (analyticsLoading && !analyticsData) {
    return <Loader message="Loading analytics..." fullScreen />;
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-400 mb-4">
            {error?.message || 'Failed to load analytics data'}
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900">
      {/* Modern Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Performance Analytics
                  </h1>
                  <p className="text-sm text-gray-400">
                    Deep insights into your productivity patterns
                  </p>
                </div>
              </div>
              <nav className="hidden lg:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/weekly">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                size="sm" 
                className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-blue-800/10 border-blue-500/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Math.round((analyticsData.summary.avgCompletionRate || 0) * 100)}%
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    {analyticsData.summary.completedTasks} / {analyticsData.summary.totalTasks} tasks
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border-emerald-500/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm font-medium">Current Streak</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {analyticsData.streakAnalysis.currentStreak}
                  </p>
                  <p className="text-emerald-300 text-xs mt-1">
                    Best: {analyticsData.streakAnalysis.longestStreak} days
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Trophy className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-purple-800/10 border-purple-500/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {analyticsData.summary.totalHours || 0}h
                  </p>
                  <p className="text-purple-300 text-xs mt-1">
                    {Math.round((analyticsData.summary.totalMinutes || 0) / (analyticsData.summary.totalTasks || 1))}m avg per task
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-600/20 to-amber-800/10 border-amber-500/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm font-medium">Energy Level</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Math.round((analyticsData.summary.avgEnergyLevel || 5) * 10) / 10}
                  </p>
                  <p className="text-amber-300 text-xs mt-1">
                    Mood: {Math.round((analyticsData.summary.avgMood || 5) * 10) / 10}/10
                  </p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Zap className="h-8 w-8 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Daily Productivity Trend */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Daily Productivity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analyticsData.dailyCompletion}>
                  <defs>
                    <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Completion Rate']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#productivityGradient)"
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="completed"
                    label={({ category, percent }: any) => 
                      percent && percent > 8 ? `${category}` : ''
                    }
                    animationDuration={1200}
                  >
                    {analyticsData.categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} tasks`, 'Completed']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Priority Performance */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Priority Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.priorityAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="priority"
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Completion Rate']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Bar 
                    dataKey="completionRate" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1200}
                  >
                    {analyticsData.priorityAnalysis.map((entry: any, index: number) => (
                      <Cell key={`priority-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mood vs Productivity */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Mood vs Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analyticsData.moodEnergy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[1, 10]}
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => {
                      if (name === 'productivity') return [`${Math.round(value)}%`, 'Productivity'];
                      if (name === 'mood') return [value, 'Mood'];
                      return [value, 'Energy Level'];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    name="Productivity" 
                    dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                    animationDuration={1600}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="energyLevel" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    name="Energy Level" 
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                    animationDuration={1300}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    name="Mood" 
                    dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Panel */}
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              Key Insights & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Trophy className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {analyticsData.streakAnalysis.longestStreak}
                </div>
                <div className="text-emerald-200 text-sm">Longest Streak (days)</div>
              </div>
              <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {new Date(analyticsData.summary.mostProductiveDay).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-blue-200 text-sm">Most Productive Day</div>
              </div>
              <div className="text-center p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {analyticsData.summary.bestCategory}
                </div>
                <div className="text-purple-200 text-sm">Top Performing Category</div>
              </div>
            </div>
            
            {analyticsData.summary.improvementAreas.length > 0 && (
              <div className="mt-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="h-5 w-5 text-orange-400" />
                  <h4 className="text-lg font-medium text-orange-200">Areas for Improvement</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData.summary.improvementAreas.map((area: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                      <span className="text-orange-100 text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}