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
import type { Translator } from "@/lib/api";
import {
  getAllTranslatorsAction,
  createTranslatorAction,
  toggleTranslatorStatusAction,
  deleteTranslatorAction,
} from "@/server-actions/translator";

export default function ManageTranslatorsComponent() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  // Load translators on mount
  useEffect(() => {
    loadTranslators();
  }, []);

  const loadTranslators = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllTranslatorsAction();
      if (result.success) {
        setTranslators(result.data);
      } else {
        setError(result.error || "Failed to load translators");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTranslator = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: { username?: string; email?: string } = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});
      const result = await createTranslatorAction(formData);

      if (result.success) {
        // Store credentials to display
        setCreatedCredentials({
          username: result.data.username,
          email: result.data.email,
          password: result.data.password,
        });
        // Reset form and reload translators
        setFormData({ username: "", email: "" });
        setFormErrors({});
        setShowCreateForm(false);
        await loadTranslators();
      } else {
        setFormErrors({
          email: result.error || "Failed to create translator",
        });
      }
    } catch (err) {
      setFormErrors({
        email:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setActionLoading(id);
      const result = await toggleTranslatorStatusAction(id);

      if (result.success) {
        // Reload translators to get updated status
        await loadTranslators();
      } else {
        alert(result.error || "Failed to toggle translator status");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTranslator = async (id: string) => {
    if (!confirm("Are you sure you want to delete this translator?")) {
      return;
    }

    try {
      setActionLoading(id);
      const result = await deleteTranslatorAction(id);

      if (result.success) {
        // Remove translator from list
        setTranslators((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(result.error || "Failed to delete translator");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Translators</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all translators on the platform
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setCreatedCredentials(null);
            }}
            variant={showCreateForm ? "outline" : "default"}
            disabled={loading}
          >
            {showCreateForm ? "Cancel" : "Create Translator"}
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
                onClick={loadTranslators}
                className="mt-2"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Translator Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Translator</CardTitle>
              <CardDescription>
                Add a new translator to the platform. The password will be
                displayed after creation for you to copy and share with the
                translator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTranslator}>
                <FieldGroup className="flex flex-row gap-4">
                  <Field className="max-w-md">
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      placeholder="translator_username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.username}
                      className="border-[#27272A]"
                    />
                    {formErrors.username && (
                      <FieldError>{formErrors.username}</FieldError>
                    )}
                  </Field>
                  <Field className="max-w-md">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="translator@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.email}
                      className="border-[#27272A]"
                    />
                    {formErrors.email && (
                      <FieldError>{formErrors.email}</FieldError>
                    )}
                  </Field>
                </FieldGroup>

                <div className="mt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Translator"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Created Credentials Display */}
        {createdCredentials && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Translator Created Successfully</CardTitle>
              <CardDescription>
                Copy the password below and share it with the translator at{" "}
                <strong>{createdCredentials.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <FieldLabel className="text-sm text-muted-foreground">
                    Username
                  </FieldLabel>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={createdCredentials.username}
                      readOnly
                      className="font-mono bg-background border-[#27272A]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(createdCredentials.username)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <FieldLabel className="text-sm text-muted-foreground">
                    Password
                  </FieldLabel>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="text"
                      value={createdCredentials.password}
                      readOnly
                      className="font-mono border-none bg-primary-foreground"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(createdCredentials.password)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreatedCredentials(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translators Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Translators</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `${translators.length} translator${
                    translators.length !== 1 ? "s" : ""
                  } on the platform`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading translators...</p>
              </div>
            ) : translators.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No translators found.</p>
                <p className="text-sm mt-2">
                  Create your first translator to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Username
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Assigned Series
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Chapters Translated
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Joined Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {translators.map((translator, index) => (
                      <tr
                        key={translator.id}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {translator.username}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-muted-foreground">
                            {translator.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              translator.status === "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {translator.status === "active"
                              ? "Active"
                              : "Suspended"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {translator.assignedSeries}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {translator.chaptersTranslated}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(translator.joinedDate)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(translator.id)}
                              disabled={actionLoading === translator.id}
                            >
                              {actionLoading === translator.id
                                ? "Loading..."
                                : translator.status === "active"
                                ? "Suspend"
                                : "Activate"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteTranslator(translator.id)
                              }
                              disabled={actionLoading === translator.id}
                            >
                              {actionLoading === translator.id
                                ? "Loading..."
                                : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
