'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/spinner';
import { ArrowLeft, BarChart3, Calendar, PieChart, TrendingUp, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
} from 'recharts';

interface AnalyticsData {
  dailyCompletion: Array<{ date: string; completionRate: number; totalTasks: number; completedTasks: number }>;
  categoryDistribution: Array<{ category: string; completed: number; color: string }>;
  weeklyProgress: Array<{ week: number; completionRate: number; totalMinutes: number }>;
  moodEnergy: Array<{ date: string; mood: number; energyLevel: number }>;
  summary: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    avgCompletionRate: number;
    totalMinutes: number;
    avgEnergyLevel: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [dateRange, user]);

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

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/analytics?days=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
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

  if (loading) {
    return <Loader message="Loading analytics..." fullScreen />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-400 mb-4">{error || 'Failed to load analytics data'}</div>
          <Button onClick={fetchAnalyticsData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
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
              <h1 className="text-lg sm:text-xl font-semibold text-rose-300">Analytics Dashboard</h1>
              {user && <span className="hidden md:inline text-sm text-neutral-400">Welcome, {user.name}</span>}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-sm text-neutral-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <div className="flex space-x-2">
                <Link href="/weekly">
                  <Button variant="outline" size="sm" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Weekly Reports</span>
                    <span className="sm:hidden">Weekly</span>
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} size="sm" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-neutral-300">Avg Completion</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-neutral-100 mt-1 sm:mt-2">
                {Math.round((data.summary.avgCompletionRate || 0) * 100)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-neutral-300">Total Tasks</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-neutral-100 mt-1 sm:mt-2">
                {data.summary.totalTasks || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="text-xs sm:text-sm font-medium text-neutral-300">Total Hours</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-neutral-100 mt-1 sm:mt-2">
                {Math.round((data.summary.totalMinutes || 0) / 60)}h
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="text-xs sm:text-sm font-medium text-neutral-300">Avg Energy</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-neutral-100 mt-1 sm:mt-2">
                {Math.round((data.summary.avgEnergyLevel || 5) * 10) / 10}/10
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Daily Completion Trend */}
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base text-neutral-200">Daily Completion Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-2">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.dailyCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Completion Rate']}
                    contentStyle={{ 
                      backgroundColor: '#404040', 
                      border: '1px solid #525252',
                      borderRadius: '6px',
                      color: '#e5e5e5'
                    }}
                  />
                  <Line type="monotone" dataKey="completionRate" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base text-neutral-200">Task Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-2">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="completed"
                    label={({ category, percent }) => `${category} ${(percent ? percent.toFixed(1) : '0')}%`}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#404040', 
                      border: '1px solid #525252',
                      borderRadius: '6px',
                      color: '#e5e5e5'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base text-neutral-200">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-2">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={(week) => `Week ${week}`}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Completion Rate']}
                    contentStyle={{ 
                      backgroundColor: '#404040', 
                      border: '1px solid #525252',
                      borderRadius: '6px',
                      color: '#e5e5e5'
                    }}
                  />
                  <Bar dataKey="completionRate" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mood & Energy Correlation */}
          <Card className="bg-neutral-800/60 border-neutral-600/50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base text-neutral-200">Mood & Energy Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-2">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.moodEnergy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <YAxis 
                    domain={[1, 10]}
                    tick={{ fontSize: 12, fill: '#a3a3a3' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={{ stroke: '#525252' }}
                  />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [value, name === 'mood' ? 'Mood' : 'Energy Level']}
                    contentStyle={{ 
                      backgroundColor: '#404040', 
                      border: '1px solid #525252',
                      borderRadius: '6px',
                      color: '#e5e5e5'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#a3a3a3', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="energyLevel" stroke="#f59e0b" strokeWidth={2} name="Energy Level" dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} />
                  <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} name="Mood" dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
