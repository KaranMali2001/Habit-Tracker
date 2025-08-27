'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DailyTask } from "@prisma/client";
import {
  CheckCircle,
  Circle,
  Play,
  SkipForward,
  X,
} from "lucide-react";

interface TaskCardProps {
  task: DailyTask;
  status: string;
  isActiveSession?: boolean;
  onStartSession: (task: DailyTask) => void;
  onMoveToCompleted: (taskId: string) => void;
  onMoveToTodo: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<DailyTask>) => void;
}

export default function TaskCard({
  task,
  status,
  isActiveSession = false,
  onStartSession,
  onMoveToCompleted,
  onMoveToTodo,
  onSkipTask,
  onUpdateTask,
}: TaskCardProps) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        isActiveSession
          ? "bg-primary/5 border border-primary/20"
          : "bg-muted/30 hover:bg-muted/50"
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-muted" />
      <div className="flex-1">
        <h4 className="font-medium">{task.title}</h4>
        <p className="text-sm text-muted-foreground">
          {task.scheduledTime
            ? (() => {
                const [hours, minutes] = task.scheduledTime
                  .split(":")
                  .map(Number);
                const displayHour =
                  hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
                const period = hours >= 12 ? "PM" : "AM";
                return `${displayHour}:${minutes
                  .toString()
                  .padStart(2, "0")} ${period}`;
              })()
            : "Unscheduled"}{" "}
          • {task.targetMinutes ? `${task.targetMinutes}min` : "No limit"}
        </p>
      </div>
      <Badge
        variant={task.priority === "HIGH" ? "destructive" : "secondary"}
        size="sm"
      >
        {task.priority}
      </Badge>
      <div className="flex gap-1">
        {status === "todo" && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStartSession(task)}
              title="Start task"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveToCompleted(task.id)}
              title="Mark complete"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSkipTask(task.id)}
              title="Skip task"
            >
              <SkipForward className="h-4 w-4 text-orange-500" />
            </Button>
          </>
        )}

        {status === "progress" && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveToTodo(task.id)}
              title="Move back to todo"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveToCompleted(task.id)}
              title="Mark complete"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSkipTask(task.id)}
              title="Skip task"
            >
              <SkipForward className="h-4 w-4 text-orange-500" />
            </Button>
          </>
        )}

        {status === "done" && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveToTodo(task.id)}
              title="Move back to todo"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </>
        )}

        {status === "skipped" && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onUpdateTask(task.id, { skipReason: null });
              }}
              title="Move back to todo"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <X className="h-4 w-4 text-orange-500" />
          </>
        )}
      </div>
    </div>
  );
}