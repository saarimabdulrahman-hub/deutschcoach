"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface UserRow {
  id: number;
  name: string;
  email: string;
  subscription_tier: string;
  created_at: string | null;
}

const COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "subscription_tier", label: "Tier", sortable: true },
  {
    key: "created_at", label: "Joined", sortable: true,
    render: (u: UserRow) => u.created_at ? new Date(u.created_at).toLocaleDateString() : "—",
  },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  const { data: users, isLoading, error } = useQuery<UserRow[]>({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/user/admin/users"),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-10 w-full rounded-xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load users." onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })} />;
  }

  const filtered = (users || []).filter((u) =>
    u.name?.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <h1 style={{ fontSize: "var(--type-heading-md)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>User Management</h1>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="primary" size="sm">+ Invite User</Button>
        </div>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search users..." variant="table" />

      <Table
        columns={COLUMNS}
        data={filtered}
        getRowKey={(u: UserRow) => String(u.id)}
        emptyMessage="No users found"
      />
    </div>
  );
}
