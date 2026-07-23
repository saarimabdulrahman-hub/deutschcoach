"use client";

import { useRouter } from "next/navigation";

interface PlanCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  footer: string;
  href: string;
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
  border: "1px solid rgba(186, 120, 255, 0.18)",
  borderRadius: 20,
  boxShadow: "0 0 35px rgba(168,85,247,.08)",
  transition: "transform .2s ease, border-color .2s ease",
};

export function PlanCard({ icon, iconBg, iconColor, title, subtitle, footer, href }: PlanCardProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="text-left rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 w-full border-none cursor-pointer"
      style={cardStyle}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate" style={{ color: "#fff" }}>{title}</p>
          <p className="text-[13px] truncate" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
          <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: iconColor }}>{footer}</p>
        </div>
        <span className="text-lg flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>›</span>
      </div>
    </button>
  );
}
