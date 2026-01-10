"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Chapter } from "./novel-detail";

interface ChapterActionsProps {
  chapter: Chapter;
  onUpdate: () => void;
}

export function ChapterActions({ chapter, onUpdate }: ChapterActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePremium = async () => {
    try {
      setIsLoading(true);
      
      const { toggleChapterPremiumAction } = await import("@/server-actions/novel");
      const result = await toggleChapterPremiumAction(chapter.id, !chapter.isPremium);
      
      if (result.success) {
        onUpdate();
      } else {
        alert(result.error || "Failed to update chapter");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      
      const { deleteChapterAction } = await import("@/server-actions/novel");
      const result = await deleteChapterAction(chapter.id);
      
      if (result.success) {
        onUpdate();
      } else {
        alert(result.error || "Failed to delete chapter");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTogglePremium}
        disabled={isLoading}
      >
        {chapter.isPremium ? "Make Free" : "Make Premium"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
      >
        Delete
      </Button>
    </div>
  );
}

