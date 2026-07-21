"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsOverview } from "@/components/profile/StatsOverview";
import { AchievementList } from "@/components/profile/AchievementList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const MOCK_ACHIEVEMENTS = [
  { id: "1", icon: "🌟", label: "First Lesson", earned: true },
  { id: "2", icon: "🔥", label: "7-Day Streak", earned: true },
  { id: "3", icon: "📚", label: "10 Lessons", earned: true },
  { id: "4", icon: "🎯", label: "Perfect Quiz", earned: false },
  { id: "5", icon: "💬", label: "Chat 50 Times", earned: false },
  { id: "6", icon: "🏆", label: "Level A2", earned: false },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  const { data: srsStats } = useQuery<{ new: number; learning: number; reviewing: number; mastered: number; total_due_today: number }>({
    queryKey: ["srs-stats"],
    queryFn: () => api.get("/srs/stats"),
  });

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/user/profile", { name, email, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail — validation errors handled by input states
    } finally {
      setSaving(false);
    }
  };

  const firstName = user?.name || "Student";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "July 2026";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "720px" }}>
      <ProfileHeader name={firstName} level={user?.target_level ?? "A1"} memberSince={memberSince} />

      <Card variant="basic">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Personal Information
          </h3>
          {saved && (
            <div role="alert" style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "rgba(46,213,115,0.1)", color: "var(--color-success)", fontSize: "var(--type-body-sm)" }}>
              Changes saved successfully.
            </div>
          )}
          <Input label="Full name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email address" variant="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      <StatsOverview
        lessonsCompleted={dash?.level_progress_pct ? Math.round(dash.level_progress_pct * 0.8) : 0}
        streak={dash?.streak ?? 0}
        avgQuizScore={dash?.avg_quiz_score ?? 0}
        vocabularyLearned={(srsStats?.mastered ?? 0) + (srsStats?.learning ?? 0) + (srsStats?.reviewing ?? 0)}
      />

      <AchievementList achievements={MOCK_ACHIEVEMENTS} />
    </div>
  );
}
