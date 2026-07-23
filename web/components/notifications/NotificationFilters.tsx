/**
 * NotificationFilters — Category tabs for notifications
 */

"use client";

import { Tabs } from "@/components/ui/Tabs";

type FilterKey = "all" | "unread" | "read";

interface NotificationFiltersProps {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
  counts: { all: number; unread: number; read: number };
}

export function NotificationFilters({ active, onChange, counts }: NotificationFiltersProps) {
  const tabs = [
    { key: "all", label: `All (${counts.all})` },
    { key: "unread", label: `Unread (${counts.unread})` },
    { key: "read", label: `Read (${counts.read})` },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeKey={active}
      onChange={(key) => onChange(key as FilterKey)}
      variant="pill"
    />
  );
}
