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
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import type { Announcement } from "./index";

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({
  announcement,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "warning" | "success" | "error",
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        isActive: announcement.isActive,
        startDate: announcement.startDate.split("T")[0],
        endDate: announcement.endDate
          ? announcement.endDate.split("T")[0]
          : "",
      });
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: typeof formErrors = {};
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      errors.content = "Content is required";
    }
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      errors.endDate = "End date must be after start date";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});

      const { createAnnouncementAction, updateAnnouncementAction } = await import("@/server-actions/announcement");
      const result = announcement
        ? await updateAnnouncementAction(announcement.id, formData)
        : await createAnnouncementAction(formData);
      
      if (result.success) {
        onSuccess();
      } else {
        setFormErrors({ content: result.error || "Failed to save announcement" });
      }
    } catch (err) {
      setFormErrors({
        content:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {announcement ? "Edit Announcement" : "Create New Announcement"}
        </CardTitle>
        <CardDescription>
          {announcement
            ? "Update the announcement details below"
            : "Fill in the details to create a new announcement that will appear on the main site"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isSubmitting}
                aria-invalid={!!formErrors.title}
                className="bg-transparent border-[#27272A]"
              />
              {formErrors.title && (
                <FieldError>{formErrors.title}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="content">Content</FieldLabel>
              <textarea
                id="content"
                rows={6}
                placeholder="Announcement content (supports markdown)"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                disabled={isSubmitting}
                aria-invalid={!!formErrors.content}
                className="w-full min-h-[150px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
              {formErrors.content && (
                <FieldError>{formErrors.content}</FieldError>
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="type">Type</FieldLabel>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Announcement["type"],
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </Field>

              <Field>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-input"
                  />
                  <FieldLabel htmlFor="isActive" className="cursor-pointer">
                    Active (visible on site)
                  </FieldLabel>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.startDate}
                  className="bg-transparent border-[#27272A]"
                />
                {formErrors.startDate && (
                  <FieldError>{formErrors.startDate}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">
                  End Date (Optional)
                </FieldLabel>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.endDate}
                  className="bg-transparent border-[#27272A]"
                />
                {formErrors.endDate && (
                  <FieldError>{formErrors.endDate}</FieldError>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration
                </p>
              </Field>
            </div>

            <Field>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? announcement
                      ? "Updating..."
                      : "Creating..."
                    : announcement
                    ? "Update Announcement"
                    : "Create Announcement"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

