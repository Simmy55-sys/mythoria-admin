"use client";

import { useState, useEffect } from "react";
import { KPICard } from "./kpi-card";
import { DataTable } from "./data-table";
import { NavigationSection } from "./navigation-section";
import { BookOpen, FileText, Coins, Users, Globe } from "lucide-react";
import {
  getDashboardStatisticsAction,
  getRecentPurchasedChaptersAction,
  getRecentCoinPurchasesAction,
} from "@/server-actions/dashboard";
import type {
  DashboardStatistics,
  RecentPurchase,
  RecentCoinPurchase,
} from "@/server-actions/dashboard";

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errorPurchases, setErrorPurchases] = useState<string | null>(null);
  const [recentCoinPurchases, setRecentCoinPurchases] = useState<
    RecentCoinPurchase[]
  >([]);
  const [loadingCoinPurchases, setLoadingCoinPurchases] = useState(true);
  const [errorCoinPurchases, setErrorCoinPurchases] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDashboardStatisticsAction();
        if (result.success) {
          setStatistics(result.data);
        } else {
          setError(result.error || "Failed to load statistics");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  useEffect(() => {
    const loadRecentPurchases = async () => {
      try {
        setLoadingPurchases(true);
        setErrorPurchases(null);
        const result = await getRecentPurchasedChaptersAction(10);
        if (result.success) {
          console.log(result.data)
          setRecentPurchases(result.data);
        } else {
          setErrorPurchases(result.error || "Failed to load recent purchases");
        }
      } catch (err) {
        setErrorPurchases(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoadingPurchases(false);
      }
    };

    loadRecentPurchases();
  }, []);

  useEffect(() => {
    const loadRecentCoinPurchases = async () => {
      try {
        setLoadingCoinPurchases(true);
        setErrorCoinPurchases(null);
        const result = await getRecentCoinPurchasesAction(10);
        if (result.success) {
          setRecentCoinPurchases(result.data);
        } else {
          setErrorCoinPurchases(
            result.error || "Failed to load recent coin purchases"
          );
        }
      } catch (err) {
        setErrorCoinPurchases(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoadingCoinPurchases(false);
      }
    };

    loadRecentCoinPurchases();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your platform performance and user activity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-[#27272A] rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-full bg-card border border-destructive rounded-lg p-6">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : statistics ? (
            <>
              <KPICard
                title="Total Novels"
                value={statistics.totalNovels}
                icon={<BookOpen className="w-6 h-6" />}
              />
              <KPICard
                title="Total Chapters"
                value={statistics.totalChapters}
                icon={<FileText className="w-6 h-6" />}
              />
              <KPICard
                title="Coins Purchased"
                value={
                  statistics.coinsPurchasedThisMonth >= 1000
                    ? `${(statistics.coinsPurchasedThisMonth / 1000).toFixed(
                        1
                      )}k`
                    : statistics.coinsPurchasedThisMonth
                }
                subtitle="This month"
                icon={<Coins className="w-6 h-6" />}
              />
              <KPICard
                title="Total Translators"
                value={statistics.totalTranslators}
                icon={<Globe className="w-6 h-6" />}
              />
              <KPICard
                title="Total Users"
                value={statistics.totalUsers}
                icon={<Users className="w-6 h-6" />}
              />
            </>
          ) : null}
        </div>

        {/* Data Tables Section */}
        <div className="space-y-8 mb-12">
          {/* Purchased Chapters Table */}
          {loadingPurchases ? (
            <div className="bg-card border border-[#27272A] rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : errorPurchases ? (
            <div className="bg-card border border-destructive rounded-lg p-6">
              <p className="text-destructive">Error: {errorPurchases}</p>
            </div>
          ) : (
            <DataTable
              title="Recently Purchased Chapters"
              columns={[
                { key: "novel", label: "Novel" },
                { key: "chapter", label: "Chapter" },
                { key: "purchasedBy", label: "Purchased By" },
                { key: "coinsSpent", label: "Coins Spent" },
                { key: "date", label: "Date" },
              ]}
              data={recentPurchases}
            />
          )}

          {/* Coin Purchases Table */}
          {loadingCoinPurchases ? (
            <div className="bg-card border border-[#27272A] rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : errorCoinPurchases ? (
            <div className="bg-card border border-destructive rounded-lg p-6">
              <p className="text-destructive">Error: {errorCoinPurchases}</p>
            </div>
          ) : (
            <DataTable
              title="Coin Purchases"
              columns={[
                { key: "user", label: "User" },
                { key: "packageName", label: "Package" },
                { key: "coinsAmount", label: "Coins" },
                { key: "amountPaid", label: "Amount Paid" },
                { key: "date", label: "Date" },
                {
                  key: "status",
                  label: "Status",
                  render: (status: string) => {
                    const statusConfig = {
                      completed: {
                        className:
                          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      },
                      pending: {
                        className:
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                      },
                      failed: {
                        className:
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      },
                      cancelled: {
                        className:
                          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                      },
                    };

                    const config =
                      statusConfig[status as keyof typeof statusConfig] ||
                      statusConfig.completed;

                    return (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    );
                  },
                },
              ]}
              data={recentCoinPurchases}
            />
          )}
        </div>

        {/* Navigation Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Quick Navigation
          </h2>
          <NavigationSection />
        </div>
      </div>
    </main>
  );
}
