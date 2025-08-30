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
  // Format minutes to display as MM:SS
  const formatTime = (minutes: number) => {
    const totalSeconds = Math.floor(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTargetTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className={`bg-card border-border ${isTimerRunning ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`h-5 w-5 text-primary ${isTimerRunning ? 'animate-pulse' : ''}`} />
          Active Session
          {isTimerRunning && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-normal text-muted-foreground">LIVE</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`rounded-lg p-4 border transition-all duration-300 ${
          isTimerRunning 
            ? 'bg-primary/10 border-primary/30' 
            : 'bg-primary/5 border-primary/20'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{activeSession.title}</h3>
            <Badge className="bg-primary text-primary-foreground">
              {activeSession.priority}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Time Spent</p>
              <p className="font-mono font-bold text-lg text-primary">
                {formatTime(activeSession.actualMinutes)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium">
                {formatTargetTime(activeSession.targetMinutes)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Progress</p>
              <p className="font-medium">
                {Math.round(activeSession.progress)}%
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0m</span>
              <span>{formatTargetTime(activeSession.targetMinutes)}</span>
            </div>
            <Progress
              value={activeSession.progress}
              className="h-3"
            />
          </div>
          
          <div className="flex gap-2">
            {isTimerRunning ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onPauseSession}
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
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
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
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