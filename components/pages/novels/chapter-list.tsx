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
import { Input } from "@/components/ui/input";
import { ChapterActions } from "./chapter-actions";
import type { Chapter } from "./novel-detail";

interface ChapterListProps {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  onSelectChapter: (chapter: Chapter) => void;
  onRefresh: () => void;
}

export function ChapterList({
  chapters,
  loading,
  error,
  onSelectChapter,
  onRefresh,
}: ChapterListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPremium, setFilterPremium] = useState<"all" | "premium" | "free">("all");

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch = chapter.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterPremium === "all" ||
      (filterPremium === "premium" && chapter.isPremium) ||
      (filterPremium === "free" && !chapter.isPremium);
    return matchesSearch && matchesFilter;
  });

  const premiumCount = chapters.filter((c) => c.isPremium).length;
  const freeCount = chapters.filter((c) => !c.isPremium).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chapters</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `${chapters.length} chapter${
                    chapters.length !== 1 ? "s" : ""
                  } • ${premiumCount} premium • ${freeCount} free`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-[#27272A]"
          />
          <div className="flex gap-2">
            <Button
              variant={filterPremium === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPremium("all")}
            >
              All
            </Button>
            <Button
              variant={filterPremium === "premium" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPremium("premium")}
            >
              Premium
            </Button>
            <Button
              variant={filterPremium === "free" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPremium("free")}
            >
              Free
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-destructive text-sm mb-4">{error}</div>
        )}

        {/* Chapters Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading chapters...</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No chapters found.</p>
            {(searchQuery || filterPremium !== "all") && (
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Chapter
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Reads
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Published
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredChapters
                  .sort((a, b) => b.chapterNumber - a.chapterNumber)
                  .map((chapter) => (
                    <tr
                      key={chapter.id}
                      className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          #{chapter.chapterNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{chapter.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={chapter.isPremium ? "default" : "secondary"}
                        >
                          {chapter.isPremium ? "Premium" : "Free"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {chapter.isPremium
                            ? `${chapter.priceInCoins} coins`
                            : "Free"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{chapter.readCount}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(chapter.publishDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectChapter(chapter)}
                          >
                            View
                          </Button>
                          <ChapterActions
                            chapter={chapter}
                            onUpdate={onRefresh}
                          />
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
  );
}

