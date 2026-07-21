"use client";

interface KpiCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string | number;
  unit: string;
  label: string;
}

export function KpiCard({ icon, iconBg, iconColor, value, unit, label }: KpiCardProps) {
  return (
    <div
      className="rounded-xl p-2.5 flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 50%), #111127",
        border: "1px solid rgba(186,120,255,0.18)",
        borderRadius: 14,
        boxShadow: "0 0 35px rgba(168,85,247,.06)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-6 h-6 rounded-[7px] flex items-center justify-center text-xs" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <p className="text-[11px] uppercase tracking-[.06em] font-medium" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      </div>
      <p className="text-2xl font-bold leading-none" style={{ color: "#fff" }}>
        {value}<span className="text-sm ml-0.5" style={{ color: "var(--color-text-muted)" }}>{unit}</span>
      </p>
    </div>
  );
}
