"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  SkipForward,
  StickyNote,
  Target,
} from "lucide-react";

interface DashboardLoaderProps {
  loadingText?: string;
}

export default function DashboardLoader({
  loadingText = "Loading your dashboard...",
}: DashboardLoaderProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-primary">
                Power Board
              </h1>
              <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Loading indicator */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-rose-300 animate-spin mr-2" />
            <p className="text-neutral-300">{loadingText}</p>
          </div>
          <div className="w-64 h-2 bg-neutral-700 rounded-full mx-auto overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>

          {/* Bootcamp Timeline */}
          <div className="bg-neutral-800/60 border border-neutral-600/50 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-rose-300" />
              <h3 className="text-sm font-medium text-rose-200">
                Bootcamp Journey
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <div className="text-green-400 font-mono">Started</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="relative h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-rose-500 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <div className="text-center mt-1"></div>
              </div>
              <div className="text-center">
                <div className="text-rose-400 font-mono">Ends</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="h-6 w-64 bg-neutral-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-neutral-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Circle, label: "To Do" },
            { icon: Clock, label: "In Progress" },
            { icon: CheckCircle, label: "Completed" },
            { icon: SkipForward, label: "Skipped" },
          ].map((item, index) => (
            <Card
              key={index}
              className="bg-neutral-800/60 border-neutral-600/50 animate-pulse"
            >
              <CardContent className="p-4 text-center">
                <item.icon className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <div className="h-8 w-8 bg-neutral-700 rounded mx-auto mb-2"></div>
                <div className="h-3 w-12 bg-neutral-700 rounded mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Columns Skeleton */}
            {["To Do", "In Progress", "Completed"].map((title, index) => (
              <Card
                key={title}
                className="bg-neutral-800/60 border-neutral-600/50"
              >
                <div className="p-4 border-b border-neutral-600/50">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-neutral-700 rounded"></div>
                    <div className="h-5 w-16 bg-neutral-700 rounded"></div>
                    <div className="h-5 w-8 bg-neutral-700 rounded"></div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[...Array(2)].map((_, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="p-4 bg-card/40 rounded-lg border border-border animate-pulse"
                      >
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-neutral-700 rounded"></div>
                          <div className="h-3 w-16 bg-neutral-700 rounded"></div>
                          <div className="flex gap-2">
                            <div className="h-3 w-8 bg-neutral-700 rounded"></div>
                            <div className="h-3 w-12 bg-neutral-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes Section Skeleton */}
          <div className="space-y-6">
            <Card className="bg-neutral-800/60 border-neutral-600/50">
              <div className="p-4 border-b border-neutral-600/50">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-rose-300" />
                  <div className="h-5 w-24 bg-neutral-700 rounded"></div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="h-4 w-28 bg-neutral-700 rounded mb-2"></div>
                    <div className="h-24 w-full bg-neutral-700/40 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-neutral-700 rounded mb-2"></div>
                    <div className="h-24 w-full bg-neutral-700/40 rounded"></div>
                  </div>
                  <div className="h-8 w-16 bg-rose-500/20 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
