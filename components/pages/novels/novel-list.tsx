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
import { FieldLabel } from "@/components/ui/field";
import { AssignSeriesForm } from "./assign-series-form";
import { Pagination } from "../dashboard/pagination";
import type { NovelSeries } from "@/lib/api";

interface NovelListProps {
  onSelectNovel: (novel: NovelSeries) => void;
}

export function NovelList({ onSelectNovel }: NovelListProps) {
  const [novels, setNovels] = useState<NovelSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningSeries, setAssigningSeries] = useState<NovelSeries | null>(
    null
  );
  const [assignmentResult, setAssignmentResult] = useState<{
    seriesName: string;
    assignmentId: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const itemsPerPage = 10;

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Load novels when page or search changes
  useEffect(() => {
    loadNovels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const loadNovels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { getAllNovelsAction } = await import("@/server-actions/novel");
      const result = await getAllNovelsAction({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      });

      if (result.success) {
        setNovels(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || "Failed to load novels");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = (assignmentId: string, seriesTitle: string) => {
    setAssignmentResult({
      seriesName: seriesTitle,
      assignmentId,
    });
    setAssigningSeries(null);
    loadNovels(); // Refresh to show the new series
  };

  const handleAssignCancel = () => {
    setAssigningSeries(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Novels</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all novels, chapters, and their content
            </p>
          </div>
          <Button
            onClick={() => {
              setAssigningSeries({} as NovelSeries);
              setAssignmentResult(null);
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Create New Series Assignment
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search novels by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md border-[#27272A]"
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive text-sm">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadNovels}
                className="mt-2"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Series Assignment Form */}
        {assigningSeries !== null && (
          <AssignSeriesForm
            onSuccess={handleAssignSuccess}
            onCancel={handleAssignCancel}
          />
        )}

        {/* Assignment Result Display */}
        {assignmentResult && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Series Assignment Created Successfully</CardTitle>
              <CardDescription>
                A new series "{assignmentResult.seriesName}" has been created
                and assigned. Copy the assignment ID below and share it with the
                translator so they can complete the series details and add
                chapters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <FieldLabel className="text-sm text-muted-foreground">
                    Assignment ID
                  </FieldLabel>
                  <div className="mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                      value={assignmentResult.assignmentId}
                      readOnly
                      className="font-mono flex-1 border-none bg-primary-foreground"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(assignmentResult.assignmentId)
                      }
                      className="w-full sm:w-auto"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setAssignmentResult(null)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Novels Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Novels</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : pagination
                ? `${pagination.total} novel${
                    pagination.total !== 1 ? "s" : ""
                  } found${
                    pagination.totalPages > 1
                      ? ` (page ${pagination.page} of ${pagination.totalPages})`
                      : ""
                  }`
                : "No novels found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading novels...</p>
              </div>
            ) : novels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No novels found.</p>
                {searchQuery && (
                  <p className="text-sm mt-2">
                    Try adjusting your search query.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Chapters
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Translator
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Categories
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {novels.map((novel) => (
                        <tr
                          key={novel.id}
                          className="border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => onSelectNovel(novel)}
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium">{novel.title}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                novel.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {novel.status === "completed"
                                ? "Completed"
                                : "Ongoing"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">{novel.totalChapters}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-muted-foreground">
                              {novel.translator || "Unassigned"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {novel.categories.slice(0, 2).map((cat, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cat}
                                </Badge>
                              ))}
                              {novel.categories.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{novel.categories.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNovel(novel);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {novels.map((novel) => (
                    <Card
                      key={novel.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onSelectNovel(novel)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {novel.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge
                                variant={
                                  novel.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {novel.status === "completed"
                                  ? "Completed"
                                  : "Ongoing"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {novel.totalChapters} chapters
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Translator:{" "}
                              </span>
                              <span>{novel.translator || "Unassigned"}</span>
                            </div>
                            {novel.categories.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">
                                  Categories:{" "}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {novel.categories.map((cat, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNovel(novel);
                              }}
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 border-t border-[#27272A] pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={pagination.total}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
