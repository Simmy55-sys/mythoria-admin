"use server";

import apiClientManager from "@/api/interface";
import { cookies } from "next/headers";

/**
 * Get cookie header string from Next.js cookies
 */
async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const cookiePairs: string[] = [];

  cookieStore.getAll().forEach((cookie) => {
    cookiePairs.push(`${cookie.name}=${cookie.value}`);
  });

  return cookiePairs.join("; ");
}

export async function getAllNovelsAction(options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  translator?: string;
}) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getSeries(options, cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data.data,
    pagination: response.data.pagination,
  } as const;
}

export async function getNovelChaptersAction(seriesId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getSeriesChapters(
    seriesId,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getChapterContentAction(chapterId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getChapterContent(
    chapterId,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function deleteNovelAction(seriesId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.deleteSeries(seriesId, cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function toggleChapterPremiumAction(
  chapterId: string,
  isPremium: boolean
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.toggleChapterPremium(
    chapterId,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function deleteChapterAction(chapterId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.deleteChapter(
    chapterId,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function assignSeriesAction(data: {
  translatorId: string;
  seriesName: string;
  adminRating?: number;
}) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.assignSeries(data, cookieHeader);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}
