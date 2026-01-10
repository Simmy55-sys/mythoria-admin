"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementActions } from "./announcement-actions";
import type { Announcement } from "./index";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  onEdit: (announcement: Announcement) => void;
  onRefresh: () => void;
}

export function AnnouncementList({
  announcements,
  loading,
  onEdit,
  onRefresh,
}: AnnouncementListProps) {
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filterActive === "active") return announcement.isActive;
    if (filterActive === "inactive") return !announcement.isActive;
    return true;
  });

  const activeCount = announcements.filter((a) => a.isActive).length;
  const inactiveCount = announcements.filter((a) => !a.isActive).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeColor = (type: Announcement["type"]) => {
    switch (type) {
      case "info":
        return "default";
      case "success":
        return "default";
      case "warning":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  const isExpired = (announcement: Announcement) => {
    if (!announcement.endDate) return false;
    return new Date(announcement.endDate) < new Date();
  };

  const isScheduled = (announcement: Announcement) => {
    return new Date(announcement.startDate) > new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `${announcements.length} announcement${
                    announcements.length !== 1 ? "s" : ""
                  } • ${activeCount} active • ${inactiveCount} inactive`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterActive === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("all")}
            >
              All
            </Button>
            <Button
              variant={filterActive === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("active")}
            >
              Active
            </Button>
            <Button
              variant={filterActive === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No announcements found.</p>
            {filterActive !== "all" && (
              <p className="text-sm mt-2">Try adjusting your filter.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`${
                  !announcement.isActive ? "opacity-60" : ""
                } transition-opacity`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">
                            {announcement.title}
                          </h3>
                          <Badge variant={getTypeColor(announcement.type)}>
                            {announcement.type}
                          </Badge>
                          {announcement.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                          {isExpired(announcement) && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                          {isScheduled(announcement) && (
                            <Badge variant="secondary">Scheduled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {announcement.content.length > 150
                            ? `${announcement.content.substring(0, 150)}...`
                            : announcement.content}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Start Date</div>
                        <div className="font-medium">
                          {formatDate(announcement.startDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">End Date</div>
                        <div className="font-medium">
                          {announcement.endDate
                            ? formatDate(announcement.endDate)
                            : "No expiration"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="font-medium">
                          {formatDateTime(announcement.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Updated</div>
                        <div className="font-medium">
                          {formatDateTime(announcement.updatedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(announcement)}
                      >
                        Edit
                      </Button>
                      <AnnouncementActions
                        announcement={announcement}
                        onUpdate={onRefresh}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

