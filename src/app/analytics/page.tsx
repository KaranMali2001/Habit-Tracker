'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/spinner';
import { ArrowLeft, BarChart3, Calendar, PieChart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
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
}

const CATEGORY_COLORS = {
  DSA: '#3B82F6',
  PROJECT: '#10B981',
  WRITING: '#8B5CF6',
  LEARNING: '#F59E0B',
  APPLICATION: '#EF4444',
  INTERVIEW_PREP: '#6366F1',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Since we don't have a dedicated analytics API, we'll fetch data from existing endpoints
      // In a real app, you'd have a dedicated analytics API
      setLoading(true);

      // Mock data for demonstration
      const mockData: AnalyticsData = {
        dailyCompletion: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completionRate: Math.random() * 0.4 + 0.6, // 60-100%
          totalTasks: Math.floor(Math.random() * 5) + 5, // 5-10 tasks
          completedTasks: 0,
        })).map((item) => ({
          ...item,
          completedTasks: Math.floor(item.totalTasks * item.completionRate),
        })),

        categoryDistribution: [
          { category: 'DSA', completed: 45, color: CATEGORY_COLORS.DSA },
          { category: 'PROJECT', completed: 32, color: CATEGORY_COLORS.PROJECT },
          { category: 'WRITING', completed: 18, color: CATEGORY_COLORS.WRITING },
          { category: 'LEARNING', completed: 28, color: CATEGORY_COLORS.LEARNING },
          { category: 'APPLICATION', completed: 12, color: CATEGORY_COLORS.APPLICATION },
          { category: 'INTERVIEW_PREP', completed: 8, color: CATEGORY_COLORS.INTERVIEW_PREP },
        ],

        weeklyProgress: Array.from({ length: 8 }, (_, i) => ({
          week: i + 1,
          completionRate: Math.random() * 0.3 + 0.65, // 65-95%
          totalMinutes: Math.floor(Math.random() * 300) + 200, // 200-500 minutes
        })),

        moodEnergy: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 3) + 3, // 3-5 (NEUTRAL to EXCELLENT)
          energyLevel: Math.floor(Math.random() * 4) + 6, // 6-10
        })),
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading analytics..." fullScreen />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Failed to load analytics data</div>
      </div>
    );
  }

  const totalTasks = data.categoryDistribution.reduce((sum, cat) => sum + cat.completed, 0);
  const avgCompletionRate = data.dailyCompletion.reduce((sum, day) => sum + day.completionRate, 0) / data.dailyCompletion.length;
  const totalMinutes = data.weeklyProgress.reduce((sum, week) => sum + week.totalMinutes, 0);
  const avgEnergyLevel = data.moodEnergy.reduce((sum, day) => sum + day.energyLevel, 0) / data.moodEnergy.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <Link href="/weekly">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Weekly Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Avg Completion</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{Math.round(avgCompletionRate * 100)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Total Tasks</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Total Hours</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{Math.round(totalMinutes / 60)}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Avg Energy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{Math.round(avgEnergyLevel * 10) / 10}/10</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyCompletion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Completion Rate']}
                  />
                  <Line type="monotone" dataKey="completionRate" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="completed"
                    label={({ category, percent }) => `${category} ${(percent?.toFixed(2) ?? 0).toString()}%`}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickFormatter={(week) => `Week ${week}`} />
                  <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                  <Tooltip formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Completion Rate']} />
                  <Bar dataKey="completionRate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mood & Energy Correlation */}
          <Card>
            <CardHeader>
              <CardTitle>Mood & Energy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.moodEnergy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis domain={[1, 10]} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [value, name === 'mood' ? 'Mood' : 'Energy Level']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="energyLevel" stroke="#F59E0B" strokeWidth={2} name="Energy Level" />
                  <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} name="Mood" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
