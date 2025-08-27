'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DailyNote, DailyTask } from "@prisma/client";
import { PieChart } from "lucide-react";

interface TodayInsightsProps {
  todayTasks: DailyTask[];
  doneTasks: DailyTask[];
  dailyNote: DailyNote | null;
}

export default function TodayInsights({
  todayTasks,
  doneTasks,
  dailyNote,
}: TodayInsightsProps) {
  const focusTimeHours = Math.round(
    (todayTasks.reduce(
      (sum, task) => sum + (task.actualMinutes || 0),
      0
    ) / 60) * 10
  ) / 10;

  const completionRate = todayTasks.length > 0
    ? Math.round((doneTasks.length / todayTasks.length) * 100)
    : 0;

  const energyLevel = dailyNote?.energyLevel ?? 5;
  const energyLabel = energyLevel > 7 ? "High" : energyLevel > 4 ? "Medium" : "Low";

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Today's Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Focus Time</span>
              <span>{focusTimeHours}h</span>
            </div>
            <Progress
              value={(todayTasks.reduce(
                (sum, task) => sum + (task.actualMinutes || 0),
                0
              ) / 480) * 100}
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Rate</span>
              <span>{completionRate}%</span>
            </div>
            <Progress
              value={completionRate}
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Energy Level</span>
              <span>{energyLabel}</span>
            </div>
            <Progress
              value={energyLevel * 10}
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}