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
import type { Translator } from "@/lib/api";
import { getAllTranslatorsAction } from "@/server-actions/translator";

interface AssignSeriesFormProps {
  onSuccess: (assignmentId: string, seriesTitle: string) => void;
  onCancel: () => void;
}

export function AssignSeriesForm({
  onSuccess,
  onCancel,
}: AssignSeriesFormProps) {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loadingTranslators, setLoadingTranslators] = useState(true);
  const [formData, setFormData] = useState({
    seriesTitle: "",
    translatorId: "",
    adminRating: "",
  });
  const [formErrors, setFormErrors] = useState<{
    seriesTitle?: string;
    translatorId?: string;
    adminRating?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTranslators();
  }, []);

  const loadTranslators = async () => {
    try {
      setLoadingTranslators(true);
      const result = await getAllTranslatorsAction();
      if (result.success) {
        // Filter to only active translators
        setTranslators(result.data.filter((t) => t.status === "active"));
      }
    } catch (err) {
      console.error("Failed to load translators:", err);
    } finally {
      setLoadingTranslators(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: typeof formErrors = {};
    if (!formData.seriesTitle.trim()) {
      errors.seriesTitle = "Series title is required";
    }
    if (!formData.translatorId) {
      errors.translatorId = "Please select a translator";
    }
    if (formData.adminRating && isNaN(Number(formData.adminRating))) {
      errors.adminRating = "Rating must be a number";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});

      const { assignSeriesAction } = await import("@/server-actions/novel");
      const result = await assignSeriesAction({
        translatorId: formData.translatorId,
        seriesName: formData.seriesTitle.trim(),
        adminRating: formData.adminRating
          ? Number(formData.adminRating)
          : undefined,
      });

      if (result.success) {
        onSuccess(result.data.assignmentId, formData.seriesTitle.trim());
      } else {
        setFormErrors({
          translatorId: result.error || "Failed to create series assignment",
        });
      }
    } catch (err) {
      setFormErrors({
        translatorId:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Series Assignment</CardTitle>
        <CardDescription>
          Create a new novel series and assign it to a translator. The
          translator will use the assignment ID to complete the series details
          and add chapters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="seriesTitle">Series Title</FieldLabel>
              <Input
                id="seriesTitle"
                type="text"
                placeholder="Enter the novel series title"
                value={formData.seriesTitle}
                onChange={(e) =>
                  setFormData({ ...formData, seriesTitle: e.target.value })
                }
                disabled={isSubmitting}
                aria-invalid={!!formErrors.seriesTitle}
                className="bg-transparent border-[#27272A]"
              />
              {formErrors.seriesTitle && (
                <FieldError>{formErrors.seriesTitle}</FieldError>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                The translator will complete the rest of the series details
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="translator">Translator</FieldLabel>
              {loadingTranslators ? (
                <div className="text-sm text-muted-foreground">
                  Loading translators...
                </div>
              ) : translators.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No active translators available
                </div>
              ) : (
                <select
                  id="translator"
                  value={formData.translatorId}
                  onChange={(e) =>
                    setFormData({ ...formData, translatorId: e.target.value })
                  }
                  disabled={isSubmitting}
                  aria-invalid={!!formErrors.translatorId}
                  className="w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 border-[#27272A]"
                >
                  <option value="">Select a translator</option>
                  {translators.map((translator) => (
                    <option key={translator.id} value={translator.id}>
                      {translator.username} ({translator.email})
                    </option>
                  ))}
                </select>
              )}
              {formErrors.translatorId && (
                <FieldError>{formErrors.translatorId}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="adminRating">
                Admin Rating (Optional)
              </FieldLabel>
              <Input
                id="adminRating"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={formData.adminRating}
                onChange={(e) =>
                  setFormData({ ...formData, adminRating: e.target.value })
                }
                disabled={isSubmitting}
                aria-invalid={!!formErrors.adminRating}
                className="bg-transparent border-[#27272A]"
              />
              {formErrors.adminRating && (
                <FieldError>{formErrors.adminRating}</FieldError>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Optional rating from 1-10 for this series
              </p>
            </Field>

            <Field>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Series Assignment"}
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
