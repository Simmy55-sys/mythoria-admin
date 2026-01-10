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
import { Separator } from "@/components/ui/separator";
import type { NovelSeries } from "@/lib/api";
import type { Chapter } from "./novel-detail";

interface ChapterViewerProps {
  chapter: Chapter;
  novel: NovelSeries;
  onBack: () => void;
  onChapterChange: (chapterId: string) => void;
  previousChapterId: string | null;
  nextChapterId: string | null;
}

export function ChapterViewer({
  chapter,
  novel,
  onBack,
  onChapterChange,
  previousChapterId,
  nextChapterId,
}: ChapterViewerProps) {
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapterContent();
  }, [chapter.id]);

  const loadChapterContent = async () => {
    try {
      setLoading(true);
      
      const { getChapterContentAction } = await import("@/server-actions/novel");
      const result = await getChapterContentAction(chapter.id);
      
      if (result.success) {
        setChapterContent(result.data.content || "Content not available");
      } else {
        setChapterContent(result.error || "Failed to load chapter content");
      }
    } catch (err) {
      setChapterContent(
        err instanceof Error ? err.message : "Failed to load content"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              ← Back to Chapters
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{novel.title}</h1>
              <p className="text-muted-foreground text-sm">
                Chapter {chapter.chapterNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {previousChapterId && (
              <Button
                variant="outline"
                onClick={() => onChapterChange(previousChapterId)}
              >
                ← Previous
              </Button>
            )}
            {nextChapterId && (
              <Button
                variant="outline"
                onClick={() => onChapterChange(nextChapterId)}
              >
                Next →
              </Button>
            )}
          </div>
        </div>

        {/* Chapter Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{chapter.title}</CardTitle>
                <CardDescription className="mt-2">
                  Published on {formatDate(chapter.publishDate)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={chapter.isPremium ? "default" : "secondary"}
                >
                  {chapter.isPremium ? "Premium" : "Free"}
                </Badge>
                {chapter.isPremium && (
                  <Badge variant="outline">
                    {chapter.priceInCoins} coins
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Chapter Number</div>
                <div className="font-medium mt-1">#{chapter.chapterNumber}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Read Count</div>
                <div className="font-medium mt-1">{chapter.readCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Language</div>
                <div className="font-medium mt-1">{chapter.language}</div>
              </div>
            </div>
            {chapter.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="text-sm font-medium mb-2">Translator Notes</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {chapter.notes}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chapter Content */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Content</CardTitle>
            <CardDescription>
              Full chapter content (admin view - includes premium content)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading chapter content...</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {chapterContent || "No content available"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

