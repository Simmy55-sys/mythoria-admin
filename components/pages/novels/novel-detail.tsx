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
import { ChapterList } from "./chapter-list";
import { ChapterViewer } from "./chapter-viewer";
import { AssignSeriesForm } from "./assign-series-form";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { NovelSeries } from "@/lib/api";

export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  isPremium: boolean;
  publishDate: string;
  language: string;
  priceInCoins: number;
  readCount: number;
  content?: string;
  notes?: string;
}

interface NovelDetailProps {
  novel: NovelSeries;
  onBack: () => void;
}

export function NovelDetail({ novel, onBack }: NovelDetailProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{
    assignmentId: string;
  } | null>(null);

  useEffect(() => {
    loadChapters();
  }, [novel.id]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { getNovelChaptersAction } = await import("@/server-actions/novel");
      const result = await getNovelChaptersAction(novel.id);
      
      if (result.success) {
        setChapters(result.data);
      } else {
        setError(result.error || "Failed to load chapters");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNovel = async () => {
    if (!confirm("Are you sure you want to delete this novel? All chapters will also be deleted.")) {
      return;
    }

    try {
      const { deleteNovelAction } = await import("@/server-actions/novel");
      const result = await deleteNovelAction(novel.id);
      
      if (result.success) {
        onBack();
      } else {
        alert(result.error || "Failed to delete novel");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const handleAssignSuccess = (assignmentId: string, seriesTitle: string) => {
    setAssignmentResult({ assignmentId });
    setShowAssignForm(false);
    // Refresh to show updated translator
    window.location.reload();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (selectedChapter) {
    return (
      <ChapterViewer
        chapter={selectedChapter}
        novel={novel}
        onBack={() => setSelectedChapter(null)}
        onChapterChange={(chapterId) => {
          const chapter = chapters.find((c) => c.id === chapterId);
          if (chapter) setSelectedChapter(chapter);
        }}
        previousChapterId={
          chapters.findIndex((c) => c.id === selectedChapter.id) > 0
            ? chapters[chapters.findIndex((c) => c.id === selectedChapter.id) - 1].id
            : null
        }
        nextChapterId={
          chapters.findIndex((c) => c.id === selectedChapter.id) < chapters.length - 1
            ? chapters[chapters.findIndex((c) => c.id === selectedChapter.id) + 1].id
            : null
        }
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{novel.title}</h1>
              <p className="text-muted-foreground mt-1">
                Manage chapters and content for this novel
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteNovel}
              className="w-full sm:w-auto"
            >
              Delete Novel
            </Button>
          </div>
        </div>

        {/* Assignment Result Display */}
        {assignmentResult && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Series Assignment Created Successfully</CardTitle>
              <CardDescription>
                Copy the assignment ID below and share it with the translator
                so they can complete the series details and add chapters.
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
                      className="font-mono bg-background flex-1"
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

        {/* Novel Info */}
        <Card>
          <CardHeader>
            <CardTitle>Novel Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge
                  variant={
                    novel.status === "completed" ? "default" : "secondary"
                  }
                  className="mt-1"
                >
                  {novel.status === "completed" ? "Completed" : "Ongoing"}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Chapters
                </div>
                <div className="text-lg font-semibold mt-1">
                  {novel.totalChapters}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Translator</div>
                <div className="text-sm mt-1">
                  {novel.translator || "Unassigned"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {novel.categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters */}
        <ChapterList
          chapters={chapters}
          loading={loading}
          error={error}
          onSelectChapter={setSelectedChapter}
          onRefresh={loadChapters}
        />
      </div>
    </div>
  );
}

