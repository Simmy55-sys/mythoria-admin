import type React from "react";
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  return (
    <div className="bg-card border border-[#27272A] rounded-lg p-6 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        {icon && <div className="text-accent opacity-75">{icon}</div>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span
            className={
              trend.direction === "up" ? "text-green-500" : "text-red-500"
            }
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        </div>
      )}
    </div>
  );
}
