import type React from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, Users, Bell } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navLinks: NavLink[] = [
  {
    label: "Novels",
    href: "/novels",
    icon: <BookOpen className="w-5 h-5" />,
    description: "Manage your novel collection",
  },
  {
    label: "Translators",
    href: "/translators",
    icon: <Users className="w-5 h-5" />,
    description: "Manage translator accounts and assignments",
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: <Bell className="w-5 h-5" />,
    description: "Create and manage announcements",
  },
];

export function NavigationSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group bg-card border border-[#27272A] rounded-lg p-6 hover:border-accent hover:bg-accent/5 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-accent group-hover:scale-110 transition-transform">
              {link.icon}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {link.label}
          </h3>
          {link.description && (
            <p className="text-sm text-muted-foreground">{link.description}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
