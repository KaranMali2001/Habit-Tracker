'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, BarChart3, Brain, CheckCircle, Clock, Play, Target, TrendingUp, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function FeatureShowcasePage({ isDarkMode }: { isDarkMode: true }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    console.log('handleGetStarted', isAuthenticated);
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <Badge
                className={`${isDarkMode ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300'}`}
              >
                For Coding Bootcamp Students
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Master Your
                <span className={`block ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Coding Journey</span>
              </h1>
              <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Track DSA practice, project milestones, and daily learning habits. Build consistency that transforms bootcamp students into confident
                developers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className={`text-lg px-8 py-6 animate-pulse-hover ${
                  isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                onClick={handleGetStarted}
                disabled={loading}
              >
                {loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Tracking Your Habits!'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`text-lg px-8 py-6 ${
                  isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-100' : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
              >
                Watch Demo
                <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div
              className={`rounded-3xl p-8 animate-float ${
                isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'
              }`}
            >
              <div className={`rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Today's Progress</h3>
                    <Badge className={`${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>75%</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { task: 'Binary Tree Practice', completed: true, time: '45m' },
                      { task: 'React Component Build', completed: true, time: '90m' },
                      { task: 'Algorithm Analysis', completed: false, time: '30m' },
                    ].map((item, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <CheckCircle
                          className={`h-4 w-4 ${
                            item.completed ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        />
                        <span className={item.completed ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}` : ''}>{item.task}</span>
                        <Badge variant="outline" className="ml-auto">
                          {item.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Trusted by 10,000+ bootcamp students from top programs
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Lambda School', 'General Assembly', 'Flatiron School', 'App Academy', 'Hack Reactor'].map((school, index) => (
              <div key={index} className={`text-lg font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {school}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={`container mx-auto px-6 py-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comprehensive tools designed for coding bootcamp success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />,
              title: 'Smart Task Management',
              description: 'Organize DSA practice, projects, and learning goals with intelligent categorization and priority tracking.',
            },
            {
              icon: <TrendingUp className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
              title: 'Streak Tracking',
              description: 'Build momentum with visual streak counters that motivate consistent daily practice and learning.',
            },
            {
              icon: <Brain className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />,
              title: 'Mood & Energy Correlation',
              description: 'Track your mental state alongside productivity to optimize your learning schedule and performance.',
            },
            {
              icon: <BarChart3 className={`h-8 w-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />,
              title: 'Progress Analytics',
              description: 'Visualize your growth with detailed charts showing completion rates, time spent, and skill development.',
            },
            {
              icon: <Clock className={`h-8 w-8 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />,
              title: 'Time Tracking',
              description: 'Log actual vs expected time to improve estimation skills and optimize your study schedule.',
            },
            {
              icon: <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />,
              title: 'Achievement System',
              description: 'Earn badges and celebrate milestones to maintain motivation throughout your coding journey.',
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className={`p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up ${
                isDarkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-lg w-fit ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start free, upgrade when you're ready to accelerate your growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className={`p-8 relative ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <CardHeader className="text-center pb-8">
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Basic habit tracking', 'Daily task management', 'Simple progress charts', '7-day streak tracking', 'Mobile app access'].map(
                (feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className="text-sm">{feature}</span>
                  </div>
                )
              )}
              <Button variant="outline" className="w-full mt-8 bg-transparent" onClick={handleGetStarted} disabled={loading}>
                {loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`p-8 relative border-2 ${isDarkMode ? 'bg-gray-900 border-purple-500' : 'bg-white border-purple-500'}`}>
            <div
              className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
              }`}
            >
              Most Popular
            </div>
            <CardHeader className="text-center pb-8">
              <h3 className="text-2xl font-bold">Premium</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Everything in Free',
                'Advanced analytics & insights',
                'Mood & energy correlation',
                'Unlimited streak tracking',
                'Weekly automated reports',
                'Goal setting & milestones',
                'Priority support',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              <Button
                className={`w-full mt-8 ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                onClick={handleGetStarted}
                disabled={loading}
              >
                {loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Premium Trial'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`container mx-auto px-6 py-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Everything you need to know about HabitFlow</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: 'How does HabitFlow help with coding bootcamp success?',
              answer:
                'HabitFlow is specifically designed for coding students. It tracks DSA practice, project work, and learning habits while providing insights on your productivity patterns and mood correlation.',
            },
            {
              question: 'Can I track different types of coding tasks?',
              answer:
                'Yes! HabitFlow supports multiple categories including DSA practice, project development, technical writing, learning new concepts, and more. Each category provides tailored analytics.',
            },
            {
              question: 'What makes the analytics different from other habit trackers?',
              answer:
                'Our analytics focus on coding-specific metrics like time estimation accuracy, task complexity correlation, and mood-productivity patterns that directly impact your learning efficiency.',
            },
            {
              question: 'Is there a mobile app?',
              answer:
                'Yes, HabitFlow works seamlessly across all devices. Track your habits on desktop during coding sessions and update on mobile throughout the day.',
            },
            {
              question: 'Can I cancel my premium subscription anytime?',
              answer:
                'Absolutely. You can cancel your premium subscription at any time and continue using the free version with all your data intact.',
            },
          ].map((faq, index) => (
            <Card key={index} className={`p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
          <h2 className="text-4xl font-bold">Ready to Transform Your Coding Journey?</h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of bootcamp students who've built successful habits with HabitFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className={`text-lg px-12 py-6 animate-pulse-hover ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              onClick={handleGetStarted}
              disabled={loading}
            >
              {loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Tracking Your Habits!'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`text-lg px-8 py-6 ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-100' : 'border-gray-300 hover:bg-gray-50 text-gray-900'
              }`}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
