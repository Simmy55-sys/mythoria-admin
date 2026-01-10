"use client";

import { useState } from "react";
import { NovelList } from "./novel-list";
import { NovelDetail } from "./novel-detail";
import type { NovelSeries } from "@/lib/api";

export default function NovelsPage() {
  const [selectedNovel, setSelectedNovel] = useState<NovelSeries | null>(null);

  if (selectedNovel) {
    return (
      <NovelDetail
        novel={selectedNovel}
        onBack={() => setSelectedNovel(null)}
      />
    );
  }

  return <NovelList onSelectNovel={setSelectedNovel} />;
}
