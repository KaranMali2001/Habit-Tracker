'use client';

import { Card, CardContent } from "@/components/ui/card";
import type { DailyTask } from "@prisma/client";
import {
  CheckCircle,
  Clock,
  List,
  TrendingUp,
} from "lucide-react";

interface StatsCardsProps {
  todayTasks: DailyTask[];
  doneTasks: DailyTask[];
}

export default function StatsCards({ todayTasks, doneTasks }: StatsCardsProps) {
  const focusTimeHours = Math.round(
    (todayTasks.reduce(
      (sum, task) => sum + (task.actualMinutes || 0),
      0
    ) / 60) * 10
  ) / 10;

  const completionRate = todayTasks.length > 0
    ? Math.round((doneTasks.length / todayTasks.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Tasks Today
              </p>
              <p className="text-2xl font-bold mt-1">{todayTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <List className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Completed
              </p>
              <p className="text-2xl font-bold mt-1">{doneTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Focus Time
              </p>
              <p className="text-2xl font-bold mt-1">{focusTimeHours}h</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Completion Rate
              </p>
              <p className="text-2xl font-bold mt-1">{completionRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}