"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { DashboardData } from "@/types";

const SHADES = [
  { name:"Deep Amethyst (current)", page:"#05040F",card:"#111127",border: "rgba(186,120,255,0.18)",accent:"#A855F7",accent2:"#C084FC",accent3:"#D946EF",gradient:"linear-gradient(135deg,#A855F7,#C084FC,#D946EF)",bgGrad:"radial-gradient(ellipse 900px 500px at 70% -5%,rgba(168,85,247,.10),transparent 60%),#05040F" },
  { name:"Plum Noir", page:"#0A0518",card:"#150F2E",border: "rgba(200,140,255,0.15)",accent:"#9333EA",accent2:"#A855F7",accent3:"#C084FC",gradient:"linear-gradient(135deg,#7E22CE,#9333EA,#A855F7)",bgGrad:"radial-gradient(ellipse at 70% -5%,rgba(147,51,234,.10),transparent 60%),#0A0518" },
  { name:"Lavender Mist", page:"#0D0A28",card:"#1A1540",border: "rgba(210,180,255,0.2)",accent:"#B57BFF",accent2:"#C99BFF",accent3:"#E0C0FF",gradient:"linear-gradient(135deg,#A24BFF,#C07BFF,#E0B0FF)",bgGrad:"radial-gradient(ellipse at 70% -5%,rgba(181,123,255,.10),transparent 60%),#0D0A28" },
  { name:"Twilight Velvet", page:"#08091A",card:"#121330",border: "rgba(170,150,230,0.17)",accent:"#7C3AED",accent2:"#8B5CF6",accent3:"#A78BFA",gradient:"linear-gradient(135deg,#6D28D9,#7C3AED,#8B5CF6)",bgGrad:"radial-gradient(ellipse at 70% -5%,rgba(124,58,237,.10),transparent 60%),#08091A" },
];

function DemoDashboard({ shade, data }: { shade: typeof SHADES[0]; data: DashboardData | null }) {
  const router = useRouter();
  const firstName = "admin";
  const greeting = "Guten Morgen";
  const d = data;
  const pct = d?.level_progress_pct || 0;

  return (
    <div style={{ background: shade.bgGrad, borderRadius: 24, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.04)", minWidth: 0, overflow: "hidden" }}>
      {/* Label */}
      <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 16, textAlign: "center" }}>{shade.name}</p>

      {/* Greeting */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
        <div>
          <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:".13em", color:"rgba(255,255,255,.35)", margin:0 }}>SATURDAY, JULY 11</p>
          <p style={{ fontSize:20, fontWeight:800, color:"#fff", margin:"2px 0" }}>{greeting}, {firstName}! 👋</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:0 }}>Kleine Schritte jeden Tag…</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <div style={{ background:shade.card, borderRadius:14, padding:"8px 14px", border:`1px solid ${shade.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:"rgba(245,158,11,.14)", color:"#F59E0B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>🔥</div>
              <span style={{ fontSize:10, fontWeight:500, textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}>Day Streak</span>
            </div>
            <p style={{ fontSize:20, fontWeight:700, color:"#fff", margin:"4px 0 0" }}>{d?.streak||0}</p>
          </div>
          <div style={{ background:shade.card, borderRadius:14, padding:"8px 14px", border:`1px solid ${shade.border}` }}>
            <span style={{ fontSize:10, fontWeight:500, textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}>Current Level</span>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:shade.gradient, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800 }}>A1</div>
              <b style={{ fontSize:12, color:"#fff" }}>A1 Beginner</b>
            </div>
            <div style={{ height:4, borderRadius:99, background:"#2A2A45", marginTop:6, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:shade.gradient, borderRadius:99 }} />
            </div>
            <p style={{ fontSize:9, color:"rgba(255,255,255,.35)", marginTop:4 }}>120 / 300 XP to A2</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ height:100, borderRadius:16, marginBottom:12, background:`linear-gradient(120deg,${shade.accent}44,${shade.accent3}33,${shade.accent}22)`, border:`1px solid ${shade.border}`, display:"flex", alignItems:"center", padding:"0 20px" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(255,255,255,.5)", margin:0 }}>Welcome to DeutschFlow</p>
          <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:"3px 0 0", lineHeight:1.1 }}>Your German learning journey starts here</p>
          <p style={{ fontSize:9, color:"rgba(255,255,255,.4)", margin:"3px 0 0" }}>✓ Beginner-friendly | ⏱ 10 min | 📚 80+ lessons</p>
        </div>
        <div style={{ background:"rgba(0,0,0,.25)", backdropFilter:"blur(16px)", borderRadius:14, padding:"10px 16px", border:`1px solid ${shade.border}`, flexShrink:0 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#fff", margin:0 }}>Ready to begin?</p>
          <div style={{ marginTop:6, padding:"7px 14px", borderRadius:10, background:shade.gradient, color:"#fff", fontSize:10, fontWeight:700, textAlign:"center" }}>Start Your First Lesson →</div>
        </div>
      </div>

      {/* Cards row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {["Your First Lesson","German Grammar","Practice Speaking"].map((t,i) => (
          <div key={i} style={{ background:shade.card, borderRadius:12, padding:"10px 12px", border:`1px solid ${shade.border}` }}>
            <div style={{ width:26, height:26, borderRadius:7, background:[ "rgba(59,130,246,.14)","rgba(168,85,247,.14)","rgba(217,70,239,.14)"][i], color:[ "#3B82F6","#A855F7","#D946EF"][i], display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, marginBottom:6 }}>
              {["📘","Aa","🎤"][i]}
            </div>
            <p style={{ fontSize:10, fontWeight:600, color:"#fff", margin:0 }}>{t}</p>
            <p style={{ fontSize:8, color:"rgba(255,255,255,.35)", margin:"1px 0 0" }}>{["Greetings & Introductions","Understand sentences","Chat with Emma"][i]}</p>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:8, color:"rgba(255,255,255,.3)" }}>{["10 min","Articles & pronouns","No exp needed"][i]}</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>›</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress + KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:8, marginTop:8 }}>
        <div style={{ background:shade.card, borderRadius:12, padding:"12px", border:`1px solid ${shade.border}`, textAlign:"center" }}>
          <div style={{ position:"relative", width:60, height:60, margin:"0 auto 6px" }}>
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke={shade.accent} strokeWidth="5" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="251" />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:16, fontWeight:800, color:"#fff" }}>0%</span>
            </div>
          </div>
          <p style={{ fontSize:11, fontWeight:700, color:"#fff", margin:0 }}>Ready to begin</p>
          <div style={{ marginTop:6, padding:"4px 10px", borderRadius:8, border:`1px solid ${shade.border}`, fontSize:9, color:shade.accent2, background:"transparent", textAlign:"center" }}>View Roadmap</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[{icon:"📘",bg:"rgba(59,130,246,.14)",c:"#3B82F6",v:"0 / 80",l:"Lessons"},{icon:"🌿",bg:"rgba(34,197,94,.14)",c:"#22C55E",v:"0",l:"Vocabulary"},{icon:"🧩",bg:shade.gradient,c:"#fff",v:"80+",l:"Grammar"},{icon:"🎯",bg:"rgba(245,158,11,.14)",c:"#F59E0B",v:"0%",l:"Accuracy"}].map((k,j)=>(
            <div key={j} style={{ background:shade.card, borderRadius:10, padding:"8px", border:`1px solid ${shade.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:20, height:20, borderRadius:5, background:k.bg, color:k.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>{k.icon}</div>
                <span style={{ fontSize:9, textTransform:"uppercase", color:"rgba(255,255,255,.35)", fontWeight:500 }}>{k.l}</span>
              </div>
              <p style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"4px 0 0" }}>{k.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
        <div style={{ background:shade.card, borderRadius:12, padding:"10px", border:`1px solid ${shade.border}`, textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <div style={{ width:20, height:20, borderRadius:5, background:"rgba(59,130,246,.14)", color:"#3B82F6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>📋</div>
            <span style={{ fontSize:9, textTransform:"uppercase", color:"rgba(255,255,255,.35)", fontWeight:500 }}>Recent Activity</span>
          </div>
          <span style={{ fontSize:24 }}>🌱</span>
          <p style={{ fontSize:10, fontWeight:600, color:"#fff", margin:"4px 0" }}>Your journey begins</p>
          <div style={{ padding:"5px 12px", borderRadius:8, background:shade.gradient, color:"#fff", fontSize:9, fontWeight:700, display:"inline-block" }}>Start Lesson →</div>
        </div>
        <div style={{ background:shade.card, borderRadius:12, padding:"10px", border:`1px solid ${shade.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <div style={{ width:20, height:20, borderRadius:5, background:"rgba(245,158,11,.14)", color:"#F59E0B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>💡</div>
              <span style={{ fontSize:9, textTransform:"uppercase", color:"rgba(255,255,255,.35)", fontWeight:500 }}>Tip of the Day</span>
            </div>
            <p style={{ fontSize:9, color:"rgba(255,255,255,.5)", lineHeight:1.3, margin:0 }}>Review before bed — sleep helps your brain consolidate.</p>
            <span style={{ fontSize:9, color:shade.accent2, marginTop:4, display:"inline-block" }}>Browse lessons →</span>
          </div>
          <div style={{ width:48, height:48, borderRadius:10, background:`radial-gradient(circle at 40% 35%,${shade.accent}44,${shade.accent3}22 60%,transparent)`, border:`1px solid ${shade.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📖</div>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const { user } = useAuth();
  const { data } = useQuery<DashboardData>({ queryKey: ["dashboard"], queryFn: () => api.get("/dashboard") });
  return (
    <div style={{ background: "#030312", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 }}>4 Violet Shades — Real Dashboard UI Side by Side</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Each column shows the EXACT same dashboard with a different violet palette. Pick one.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
          {SHADES.map((shade) => (
            <DemoDashboard key={shade.name} shade={shade} data={data || null} />
          ))}
        </div>
      </div>
    </div>
  );
}
