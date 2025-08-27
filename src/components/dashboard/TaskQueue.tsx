'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyTask } from "@prisma/client";
import {
  Calendar,
  Circle,
  Plus,
} from "lucide-react";
import TaskCard from "./TaskCard";

interface TaskQueueProps {
  todoTasks: DailyTask[];
  activeSession: { taskId: string } | null;
  onStartSession: (task: DailyTask) => void;
  onMoveToCompleted: (taskId: string) => void;
  onMoveToTodo: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<DailyTask>) => void;
  onShowAddTaskModal: () => void;
  onShowAutoFill: () => void;
}

export default function TaskQueue({
  todoTasks,
  activeSession,
  onStartSession,
  onMoveToCompleted,
  onMoveToTodo,
  onSkipTask,
  onUpdateTask,
  onShowAddTaskModal,
  onShowAutoFill,
}: TaskQueueProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Task Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todoTasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No tasks for today
              </p>
              <p className="text-muted-foreground text-xs mb-3">
                Get started by adding tasks or use auto-fill
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowAddTaskModal}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowAutoFill}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Auto-Fill
                </Button>
              </div>
            </div>
          ) : (
            todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                status="todo"
                isActiveSession={activeSession?.taskId === task.id}
                onStartSession={onStartSession}
                onMoveToCompleted={onMoveToCompleted}
                onMoveToTodo={onMoveToTodo}
                onSkipTask={onSkipTask}
                onUpdateTask={onUpdateTask}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}