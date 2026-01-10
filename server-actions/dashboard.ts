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

export interface DashboardStatistics {
  totalNovels: number;
  totalChapters: number;
  totalTranslators: number;
  totalUsers: number;
  coinsPurchasedThisMonth: number;
}

export async function getDashboardStatisticsAction() {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getDashboardStatistics(cookieHeader);

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

export interface RecentPurchase {
  id: string;
  novel: string;
  chapter: string;
  purchasedBy: string;
  coinsSpent: number;
  date: string;
}

export async function getRecentPurchasedChaptersAction(limit: number = 10) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getRecentPurchasedChapters(
    limit,
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

export interface RecentCoinPurchase {
  id: string;
  user: string;
  packageName: string;
  coinsAmount: number;
  amountPaid: string;
  date: string;
  status: "pending" | "completed" | "failed" | "cancelled";
}

export async function getRecentCoinPurchasesAction(limit: number = 10) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getRecentCoinPurchases(
    limit,
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

