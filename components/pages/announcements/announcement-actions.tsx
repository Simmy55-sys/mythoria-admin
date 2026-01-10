"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Announcement } from "./index";

interface AnnouncementActionsProps {
  announcement: Announcement;
  onUpdate: () => void;
}

export function AnnouncementActions({
  announcement,
  onUpdate,
}: AnnouncementActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleActive = async () => {
    try {
      setIsLoading(true);
      
      const { toggleAnnouncementActiveAction } = await import("@/server-actions/announcement");
      const result = await toggleAnnouncementActiveAction(announcement.id, !announcement.isActive);
      
      if (result.success) {
        onUpdate();
      } else {
        alert(result.error || "Failed to update announcement");
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
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      
      const { deleteAnnouncementAction } = await import("@/server-actions/announcement");
      const result = await deleteAnnouncementAction(announcement.id);
      
      if (result.success) {
        onUpdate();
      } else {
        alert(result.error || "Failed to delete announcement");
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
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleActive}
        disabled={isLoading}
      >
        {announcement.isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
      >
        Delete
      </Button>
    </>
  );
}

