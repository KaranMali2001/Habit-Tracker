'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle,
  Pause,
  Play,
} from "lucide-react";

interface ActiveSessionProps {
  activeSession: {
    taskId: string;
    title: string;
    category: string;
    priority: string;
    startTime: string;
    targetMinutes: number;
    actualMinutes: number;
    progress: number;
  };
  isTimerRunning: boolean;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCompleteSession: () => void;
}

export default function ActiveSession({
  activeSession,
  isTimerRunning,
  onPauseSession,
  onResumeSession,
  onCompleteSession,
}: ActiveSessionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Active Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{activeSession.title}</h3>
            <Badge className="bg-primary text-primary-foreground">
              {activeSession.priority}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Time</p>
              <p className="font-medium">{activeSession.startTime}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {activeSession.targetMinutes} minutes
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Progress</p>
              <p className="font-medium">
                {Math.round(activeSession.progress)}%
              </p>
            </div>
          </div>
          <Progress
            value={activeSession.progress}
            className="h-2 mb-4"
          />
          <div className="flex gap-2">
            {isTimerRunning ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onPauseSession}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={onResumeSession}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onCompleteSession}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}