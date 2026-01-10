"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { AnnouncementForm } from "./announcement-form";
import { AnnouncementList } from "./announcement-list";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsComponent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { getAllAnnouncementsAction } = await import(
        "@/server-actions/announcement"
      );
      const result = await getAllAnnouncementsAction();

      if (result.success) {
        setAnnouncements(result.data);
      } else {
        setError(result.error || "Failed to load announcements");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadAnnouncements();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateForm(true);
  };

  const handleEditCancel = () => {
    setEditingAnnouncement(null);
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    setEditingAnnouncement(null);
    setShowCreateForm(false);
    loadAnnouncements();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Announcements</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage announcements that appear on the main site
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingAnnouncement(null);
            }}
            variant={showCreateForm ? "outline" : "default"}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {showCreateForm ? "Cancel" : "Create Announcement"}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive text-sm">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnnouncements}
                className="mt-2"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSuccess={
              editingAnnouncement ? handleEditSuccess : handleCreateSuccess
            }
            onCancel={handleEditCancel}
          />
        )}

        {/* Announcements List */}
        <AnnouncementList
          announcements={announcements}
          loading={loading}
          onEdit={handleEdit}
          onRefresh={loadAnnouncements}
        />
      </div>
    </div>
  );
}
