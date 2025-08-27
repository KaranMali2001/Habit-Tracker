'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';

interface QuickNotesProps {
  localUserContent: string;
  hasUnsavedChanges: boolean;
  savingNote: boolean;
  onContentChange: (field: "userContent" | "learnings", value: string) => void;
  onSave: () => void;
}

export default function QuickNotes({
  localUserContent,
  hasUnsavedChanges,
  savingNote,
  onContentChange,
  onSave,
}: QuickNotesProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Quick Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={localUserContent}
          onChange={(e) =>
            onContentChange("userContent", e.target.value)
          }
          placeholder="Capture thoughts, ideas, or reflections..."
          className="min-h-[120px] resize-none"
        />
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={onSave}
          disabled={!hasUnsavedChanges || savingNote}
        >
          {savingNote ? "Saving..." : "Save Note"}
        </Button>
        {hasUnsavedChanges && (
          <p className="text-xs text-amber-500 mt-1">Unsaved changes</p>
        )}
      </CardContent>
    </Card>
  );
}