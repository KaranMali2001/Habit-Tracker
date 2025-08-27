'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyTask } from "@prisma/client";
import { CheckCircle } from "lucide-react";

interface CompletedTasksProps {
  doneTasks: DailyTask[];
}

export default function CompletedTasks({ doneTasks }: CompletedTasksProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Completed Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {doneTasks.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No completed tasks yet
              </p>
            </div>
          ) : (
            doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded bg-green-500/10"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{task.title}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}