const { useState, useEffect } = React;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap";

const DEFAULT_L0 = [
  { id: "l0-1", label: "Kickoff", color: "#6366f1" },
  { id: "l0-2", label: "Discovery", color: "#8b5cf6" },
  { id: "l0-3", label: "Configuration", color: "#0ea5e9" },
  { id: "l0-4", label: "Artifact Migration", color: "#14b8a6" },
  { id: "l0-5", label: "Rollout", color: "#f59e0b" },
  { id: "l0-6", label: "Decommission", color: "#22c55e" },
];

const DEFAULT_TIERS = [
  { id: "t1", label: "Enterprise", color: "#a78bfa" },
  { id: "t2", label: "Growth", color: "#38bdf8" },
  { id: "t3", label: "Starter", color: "#8b8fa3" },
];

const RAG_LABELS = { green: "Green", amber: "Amber", red: "Red", blue: "Blue" };
const RAG_COLORS = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6" };

function mkL1(id, label, status, rag, sd, ed, notes, ptg) {
  return { id, label, status: status||"upcoming", rag: rag||"green", startDate: sd||null, endDate: ed||null, notes: notes||"", pathToGreen: ptg||"" };
}

function mkCustomerMilestones(tmpl) {
  return tmpl.map(l0 => ({ ...l0, status: "upcoming", rag: "green", startDate: null, endDate: null, notes: "", pathToGreen: "", children: [] }));
}

// ─── Samples with realistic overlapping dates ───
const SAMPLES = [
  {
    id: "c1", name: "Acme Corp", logo: "AC", tier: "Enterprise",
    startDate: "2025-12-01", targetDate: "2026-03-15",
    baselineCompletion: "2026-03-15", forecastCompletion: "2026-03-22",
    onboardingManager: "You",
    owner: "You",
    stakeholder: "Jamie Chen (VP Eng)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "green", startDate: "2025-12-01", endDate: "2025-12-05", notes: "Strong alignment on goals", pathToGreen: "", children: [
        mkL1("c1-1", "Intro & stakeholder mapping", "complete", "green", "2025-12-01", "2025-12-03"),
        mkL1("c1-2", "Define success criteria", "complete", "green", "2025-12-03", "2025-12-05", "ARR protection + time-to-value targets"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "green", startDate: "2025-12-06", endDate: "2025-12-20", notes: "Full audit done", pathToGreen: "", children: [
        mkL1("c1-3", "Current tooling audit", "complete", "green", "2025-12-06", "2025-12-10", "Artifactory + S3 buckets"),
        mkL1("c1-4", "Package format inventory", "complete", "green", "2025-12-10", "2025-12-15", "npm, Docker, Maven, Helm"),
        mkL1("c1-5", "Compliance & access review", "complete", "green", "2025-12-15", "2025-12-20", "SOC2 requirements documented"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "green", startDate: "2025-12-21", endDate: "2026-01-15", notes: "SSO + repos configured", pathToGreen: "", children: [
        mkL1("c1-6", "SSO / SAML setup", "complete", "green", "2025-12-21", "2026-01-05"),
        mkL1("c1-7", "Repository structure design", "complete", "green", "2026-01-02", "2026-01-10", "Mono-repo per team"),
        mkL1("c1-8", "Upstream proxy configuration", "complete", "green", "2026-01-10", "2026-01-15"),
      ]},
      { ...DEFAULT_L0[3], status: "in-progress", rag: "amber", startDate: "2026-01-13", endDate: "2026-02-28", notes: "GitHub Actions done, Jenkins WIP", pathToGreen: "Need infra team to unblock Jenkins access by Feb 20", children: [
        mkL1("c1-9", "npm migration (150 packages)", "complete", "green", "2026-01-13", "2026-01-25"),
        mkL1("c1-10", "Docker image migration", "in-progress", "green", "2026-01-20", "2026-02-14", "80/120 images moved"),
        mkL1("c1-11", "Maven artifact migration", "upcoming", "green", "2026-02-10", "2026-02-25"),
        mkL1("c1-12", "CI/CD pipeline rewiring", "in-progress", "amber", "2026-01-25", "2026-02-28", "GH Actions done, Jenkins WIP", "Escalate to Acme infra team lead re: Jenkins credentials"),
      ]},
      // Rollout overlaps with Artifact Migration
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-02-15", endDate: "2026-03-10", notes: "", pathToGreen: "", children: [
        mkL1("c1-13", "Pilot team rollout", "upcoming", "green", "2026-02-15", "2026-02-22"),
        mkL1("c1-14", "Full org rollout", "upcoming", "green", "2026-02-22", "2026-03-05"),
        mkL1("c1-15", "Training sessions", "upcoming", "green", "2026-02-25", "2026-03-10"),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-03-05", endDate: "2026-03-15", notes: "", pathToGreen: "", children: [
        mkL1("c1-16", "Legacy read-only period", "upcoming", "green", "2026-03-05", "2026-03-12"),
        mkL1("c1-17", "Artifactory shutdown", "upcoming", "green", "2026-03-12", "2026-03-15"),
      ]},
    ],
    transcripts: [
      { id: "t1", date: "2025-12-03", title: "Kickoff Call", summary: "Discussed timeline, key stakeholders, and success metrics. Jamie wants full migration by Q1 end.", text: "Full transcript of kickoff call..." },
      { id: "t2", date: "2026-01-10", title: "Migration Review", summary: "Reviewed repo migration progress. 150/200 repos done. Blockers around legacy Artifactory configs.", text: "Full transcript of migration review..." },
      { id: "t3", date: "2026-02-05", title: "CI/CD Check-in", summary: "GitHub Actions pipelines complete. Jenkins integration has dependency on their infra team's availability. Target mid-Feb.", text: "Full transcript of CI/CD check-in..." },
    ],
    weeklyUpdates: [],
  },
  {
    id: "c2", name: "NovaTech", logo: "NT", tier: "Growth",
    startDate: "2026-01-15", targetDate: "2026-04-30",
    baselineCompletion: "2026-04-30", forecastCompletion: "2026-04-30",
    onboardingManager: "You",
    owner: "You",
    stakeholder: "Sam Rivera (DevOps Lead)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "green", startDate: "2026-01-15", endDate: "2026-01-17", notes: "Small team, fast-moving", pathToGreen: "", children: [
        mkL1("c2-1", "Kickoff & goals alignment", "complete", "green", "2026-01-15", "2026-01-17"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "green", startDate: "2026-01-18", endDate: "2026-01-25", notes: "", pathToGreen: "", children: [
        mkL1("c2-2", "Tooling audit", "complete", "green", "2026-01-18", "2026-01-22", "Just npm + Docker"),
      ]},
      { ...DEFAULT_L0[2], status: "in-progress", rag: "green", startDate: "2026-01-25", endDate: "2026-02-15", notes: "30 repos, straightforward", pathToGreen: "", children: [
        mkL1("c2-3", "Repo setup", "complete", "green", "2026-01-25", "2026-02-05"),
        mkL1("c2-4", "API token provisioning", "in-progress", "green", "2026-02-05", "2026-02-15"),
      ]},
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-02-15", endDate: "2026-03-20", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-03-15", endDate: "2026-04-20", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-04-15", endDate: "2026-04-30", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t4", date: "2026-01-17", title: "Kickoff", summary: "Lean team, want quick onboarding. Focused on npm and Docker registries.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
  },
  {
    id: "c3", name: "FinanceFlow", logo: "FF", tier: "Enterprise",
    startDate: "2025-11-01", targetDate: "2026-02-28",
    baselineCompletion: "2026-02-28", forecastCompletion: "2026-03-14",
    onboardingManager: "Sarah K",
    owner: "You",
    stakeholder: "Dr. Priya Patel (CTO)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "green", startDate: "2025-11-01", endDate: "2025-11-05", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[1], status: "complete", rag: "green", startDate: "2025-11-06", endDate: "2025-11-20", notes: "", pathToGreen: "", children: [
        mkL1("c3-1", "Security requirements deep-dive", "complete", "green", "2025-11-06", "2025-11-15", "SOC2 + HIPAA"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "green", startDate: "2025-11-20", endDate: "2025-12-15", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "complete", rag: "green", startDate: "2025-12-10", endDate: "2026-01-10", notes: "", pathToGreen: "", children: [] },
      // Rollout overlapping with late migration
      { ...DEFAULT_L0[4], status: "in-progress", rag: "red", startDate: "2026-01-05", endDate: "2026-02-22", notes: "Compliance team training delayed", pathToGreen: "1) Reschedule compliance training for w/c Feb 17. 2) Run parallel UAT with pilot team. 3) Escalate to CTO if no response by Feb 14.", children: [
        mkL1("c3-2", "Pilot team go-live", "complete", "green", "2026-01-05", "2026-02-01"),
        mkL1("c3-3", "Compliance team training", "in-progress", "red", "2026-02-01", "2026-02-18", "Delayed \u2014 team availability", "Book dedicated 2hr slot with compliance lead, bypass calendar via CTO"),
        mkL1("c3-4", "Full org rollout", "upcoming", "red", "2026-02-10", "2026-02-22", "Blocked by training", "Cannot start until training complete"),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "amber", startDate: "2026-02-20", endDate: "2026-02-28", notes: "May miss Feb 28 target", pathToGreen: "Contingency: extend legacy access by 2 weeks while rollout completes", children: [] },
    ],
    transcripts: [],
    weeklyUpdates: [],
  },
];

// ─── Derivation ───
function deriveL0Rag(ch, fb) { if(!ch.length) return fb; if(ch.some(c=>c.rag==="red")) return "red"; if(ch.some(c=>c.rag==="amber")) return "amber"; if(ch.some(c=>c.rag==="green")) return "green"; return "blue"; }
function deriveL0Status(ch, fb) { if(!ch.length) return fb; if(ch.every(c=>c.status==="complete")) return "complete"; if(ch.some(c=>c.status==="in-progress"||c.status==="complete")) return "in-progress"; return "upcoming"; }
function deriveCustomerRag(ms) { if(ms.some(m=>m.rag==="red"||m.children.some(c=>c.rag==="red"))) return "red"; if(ms.some(m=>m.rag==="amber"||m.children.some(c=>c.rag==="amber"))) return "amber"; if(ms.some(m=>m.rag==="green"||m.children.some(c=>c.rag==="green"))) return "green"; return "blue"; }

function getL0Progress(l0) { if(!l0.children.length) return l0.status==="complete"?100:l0.status==="in-progress"?50:0; return Math.round((l0.children.filter(c=>c.status==="complete").length/l0.children.length)*100); }
function getTotalProgress(ms) { const a=ms.flatMap(l=>l.children.length?l.children:[l]); const d=a.filter(i=>i.status==="complete").length; return a.length?Math.round((d/a.length)*100):0; }

function fmtDate(d) { if(!d) return "\u2014"; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
function fmtRange(sd, ed) { if(!sd && !ed) return "\u2014"; if(sd && ed) return `${fmtDate(sd)} \u2013 ${fmtDate(ed)}`; return fmtDate(sd || ed); }
function weeksBetween(a,b) { return Math.ceil((new Date(b)-new Date(a))/(7*24*60*60*1000)); }
function weekLabel(s,i) { const d=new Date(s); d.setDate(d.getDate()+i*7); return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
function today() { return new Date().toISOString().split("T")[0]; }

const STATUS_CYCLE=["upcoming","in-progress","complete"];
function nextStatus(s) { return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s)+1)%STATUS_CYCLE.length]; }
const RAG_CYCLE=["green","amber","red","blue"];
function nextRag(r) { return RAG_CYCLE[(RAG_CYCLE.indexOf(r)+1)%RAG_CYCLE.length]; }
function StatusIcon({status}) { if(status==="complete") return "\u2713"; if(status==="in-progress") return "\u25C9"; return ""; }

// ─── Styles ───
const styles = `
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
  * { margin:0; padding:0; box-sizing:border-box; }
  body,html,#root { font-family:'DM Sans',sans-serif; background:#0c0e14; color:#e2e4eb; height:100%; overflow:hidden; }
  .app { display:grid; grid-template-columns:260px 1fr; height:100vh; overflow:hidden; }

  .sidebar { background:#10131b; border-right:1px solid #1e2230; display:flex; flex-direction:column; overflow:hidden; }
  .sidebar-header { padding:24px 20px 16px; border-bottom:1px solid #1e2230; }
  .sidebar-brand { display:flex; align-items:center; gap:10px; margin-bottom:4px; }
  .sidebar-brand-icon { width:32px; height:32px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:white; }
  .sidebar-brand h1 { font-size:15px; font-weight:600; letter-spacing:-0.3px; color:#f0f1f5; }
  .sidebar-brand-sub { font-size:11px; color:#565b6e; margin-top:2px; margin-left:42px; }
  .sidebar-nav { padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; cursor:pointer; font-size:13.5px; font-weight:400; color:#8b8fa3; transition:all 0.15s; border:none; background:none; width:100%; text-align:left; }
  .nav-item:hover { background:#181b26; color:#c5c8d6; }
  .nav-item.active { background:#1a1d2a; color:#e2e4eb; font-weight:500; }
  .nav-item.active .nav-icon { color:#818cf8; }
  .nav-icon { font-size:16px; width:20px; text-align:center; }
  .sidebar-customers { padding:8px 10px; flex:1; overflow-y:auto; }
  .sidebar-section-title { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.2px; color:#464b5e; padding:8px 12px 6px; }
  .customer-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:13px; color:#8b8fa3; transition:all 0.15s; border:none; background:none; width:100%; text-align:left; }
  .customer-item:hover { background:#181b26; color:#c5c8d6; }
  .customer-item.active { background:#1a1d2a; color:#e2e4eb; }
  .customer-avatar { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:white; flex-shrink:0; }
  .rag-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .rag-dot-sm { width:6px; height:6px; }
  .add-customer-sidebar { padding:8px 10px; border-top:1px solid #1e2230; }

  .main { overflow-y:auto; }
  .main-header { position:sticky; top:0; z-index:10; background:rgba(12,14,20,0.85); backdrop-filter:blur(16px); border-bottom:1px solid #1e2230; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }
  .main-title { font-size:18px; font-weight:600; letter-spacing:-0.3px; color:#f0f1f5; }
  .main-subtitle { font-size:12px; color:#565b6e; margin-top:2px; }
  .main-body { padding:28px 32px 48px; animation:fadeIn 0.3s ease; }

  .card { background:#13161f; border:1px solid #1e2230; border-radius:12px; padding:20px; margin-bottom:16px; }
  .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .card-title { font-size:13px; font-weight:600; color:#a0a4b6; text-transform:uppercase; letter-spacing:0.8px; }

  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .stat-card { background:#13161f; border:1px solid #1e2230; border-radius:12px; padding:18px 20px; }
  .stat-label { font-size:11px; color:#565b6e; text-transform:uppercase; letter-spacing:0.8px; font-weight:500; margin-bottom:8px; }
  .stat-value { font-size:28px; font-weight:700; letter-spacing:-1px; color:#f0f1f5; font-family:'JetBrains Mono',monospace; }

  .rag-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; padding:3px 8px; border-radius:4px; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:all 0.12s; }
  .rag-pill:hover { filter:brightness(1.2); }
  .rag-pill-green { background:rgba(34,197,94,0.12); color:#22c55e; }
  .rag-pill-amber { background:rgba(245,158,11,0.12); color:#f59e0b; }
  .rag-pill-red { background:rgba(239,68,68,0.12); color:#ef4444; }
  .rag-pill-blue { background:rgba(59,130,246,0.12); color:#3b82f6; }

  .status-pill { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; padding:3px 7px; border-radius:4px; }
  .status-upcoming { background:rgba(86,91,110,0.12); color:#565b6e; }
  .status-in-progress { background:rgba(99,102,241,0.12); color:#818cf8; }
  .status-complete { background:rgba(34,197,94,0.08); color:#6b7088; }

  .ptg-bar { margin:0 16px 8px 54px; padding:8px 12px; border-radius:6px; font-size:12px; line-height:1.55; display:flex; gap:8px; align-items:flex-start; }
  .ptg-bar-amber { background:rgba(245,158,11,0.06); border-left:3px solid #f59e0b; color:#d4a033; }
  .ptg-bar-red { background:rgba(239,68,68,0.06); border-left:3px solid #ef4444; color:#e07575; }
  .ptg-label { font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; padding-top:1px; }
  .ptg-text { flex:1; white-space:pre-wrap; }
  .ptg-bar-l1 { margin:-2px 0 4px 54px; padding:6px 10px; border-radius:5px; font-size:11.5px; line-height:1.5; display:flex; gap:6px; align-items:flex-start; }

  .l0-phase { border:1px solid #1e2230; border-radius:10px; margin-bottom:8px; overflow:hidden; background:#13161f; animation:slideIn 0.3s ease; }
  .l0-header { display:grid; grid-template-columns:32px 1fr 90px 80px 80px 32px; align-items:center; gap:10px; padding:14px 16px; cursor:pointer; transition:background 0.15s; border:none; background:none; width:100%; text-align:left; color:inherit; font-family:inherit; }
  .l0-header:hover { background:#181b26; }
  .l0-label { font-size:14px; font-weight:600; color:#f0f1f5; display:flex; align-items:center; gap:10px; }
  .l0-label .phase-num { font-size:10px; font-weight:600; color:#464b5e; background:#1a1d28; border-radius:4px; padding:2px 6px; font-family:'JetBrains Mono',monospace; }
  .l0-progress-bar { height:4px; background:#2e3348; border-radius:2px; overflow:hidden; width:100%; }
  .l0-progress-fill { height:100%; border-radius:2px; transition:width 0.4s ease; }
  .l0-chevron { font-size:12px; color:#565b6e; transition:transform 0.2s; text-align:center; }
  .l0-chevron.open { transform:rotate(90deg); }
  .l1-container { border-top:1px solid #1e2230; padding:6px 16px 10px; background:#10131b; }
  .l1-row { display:grid; grid-template-columns:20px 1fr 120px 76px 70px auto; align-items:center; gap:8px; padding:8px 8px 8px 32px; border-radius:6px; transition:background 0.12s; }
  .l1-row:hover { background:#181b26; }
  .l1-name { font-size:12.5px; color:#c5c8d6; }
  .l1-date { font-size:10px; color:#565b6e; font-family:'JetBrains Mono',monospace; white-space:nowrap; }
  .add-l1-btn { display:flex; align-items:center; gap:6px; padding:7px 10px 7px 32px; font-size:12px; color:#464b5e; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color 0.15s; width:100%; text-align:left; }
  .add-l1-btn:hover { color:#818cf8; }

  .milestone-check { width:22px; height:22px; border-radius:6px; border:2px solid #2e3348; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; font-size:12px; background:none; color:white; flex-shrink:0; }
  .milestone-check.sm { width:18px; height:18px; border-radius:5px; font-size:10px; }
  .milestone-check.complete { background:#22c55e; border-color:#22c55e; }
  .milestone-check.in-progress { border-color:#6366f1; background:rgba(99,102,241,0.15); }

  .btn { font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500; padding:8px 16px; border-radius:7px; cursor:pointer; transition:all 0.15s; border:none; display:inline-flex; align-items:center; gap:6px; }
  .btn-primary { background:#6366f1; color:white; }
  .btn-primary:hover { background:#5558e6; }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-ghost { background:none; border:1px solid #2e3348; color:#8b8fa3; }
  .btn-ghost:hover { border-color:#565b6e; color:#c5c8d6; }
  .btn-sm { padding:4px 10px; font-size:11px; }

  .input,.textarea,.select-input { font-family:'DM Sans',sans-serif; background:#181b26; border:1px solid #2e3348; color:#e2e4eb; padding:9px 13px; border-radius:7px; font-size:13px; width:100%; transition:border-color 0.15s; outline:none; }
  .input:focus,.textarea:focus,.select-input:focus { border-color:#6366f1; }
  .textarea { min-height:100px; resize:vertical; line-height:1.6; }
  .form-label { font-size:11.5px; font-weight:500; color:#6b7088; margin-bottom:6px; display:block; }
  .form-group { margin-bottom:14px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; animation:fadeIn 0.15s ease; }
  .modal { background:#13161f; border:1px solid #1e2230; border-radius:14px; width:90%; max-width:580px; max-height:85vh; overflow-y:auto; padding:28px; animation:fadeIn 0.2s ease; }
  .modal-title { font-size:16px; font-weight:600; color:#f0f1f5; margin-bottom:20px; }
  .modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }

  .update-output { background:#181b26; border:1px solid #2e3348; border-radius:10px; padding:20px 24px; font-size:13.5px; line-height:1.75; color:#c5c8d6; white-space:pre-wrap; max-height:500px; overflow-y:auto; }
  .generating { display:flex; align-items:center; gap:10px; padding:16px; color:#818cf8; font-size:13px; font-weight:500; }
  .generating-dot { width:6px; height:6px; border-radius:50%; background:#818cf8; animation:pulse 1s ease infinite; }

  .tabs { display:flex; gap:4px; margin-bottom:20px; background:#10131b; border-radius:8px; padding:3px; width:fit-content; }
  .tab { font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500; padding:7px 16px; border-radius:6px; cursor:pointer; color:#565b6e; transition:all 0.15s; border:none; background:none; }
  .tab:hover { color:#8b8fa3; }
  .tab.active { background:#1e2230; color:#e2e4eb; }

  .empty-state { text-align:center; padding:48px 20px; color:#464b5e; }
  .empty-state-icon { font-size:32px; margin-bottom:12px; opacity:0.4; }
  .empty-state-text { font-size:13.5px; line-height:1.6; }

  .transcript-list { display:flex; flex-direction:column; gap:8px; }
  .transcript-item { display:grid; grid-template-columns:90px 1fr auto; align-items:start; gap:14px; padding:14px 16px; background:#181b26; border-radius:8px; transition:background 0.15s; }
  .transcript-item:hover { background:#1e2230; }
  .transcript-date { font-size:12px; color:#565b6e; font-family:'JetBrains Mono',monospace; }
  .transcript-title { font-size:13.5px; font-weight:500; color:#e2e4eb; margin-bottom:4px; }
  .transcript-summary { font-size:12.5px; color:#6b7088; line-height:1.5; }

  .badge { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:500; padding:2px 7px; border-radius:4px; }

  .gong-notice { background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); border-radius:8px; padding:12px 16px; font-size:12.5px; color:#f59e0b; margin-bottom:16px; line-height:1.6; }
  .gong-notice strong { font-weight:600; }

  .rag-selector { display:flex; gap:6px; }
  .rag-option { padding:6px 14px; border-radius:6px; border:2px solid #2e3348; cursor:pointer; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; transition:all 0.15s; background:none; font-family:'DM Sans',sans-serif; }
  .rag-option:hover { filter:brightness(1.2); }
  .rag-option.sel-green { border-color:#22c55e; background:rgba(34,197,94,0.12); color:#22c55e; }
  .rag-option.sel-amber { border-color:#f59e0b; background:rgba(245,158,11,0.12); color:#f59e0b; }
  .rag-option.sel-red { border-color:#ef4444; background:rgba(239,68,68,0.12); color:#ef4444; }
  .rag-option.sel-blue { border-color:#3b82f6; background:rgba(59,130,246,0.12); color:#3b82f6; }
  .rag-option.unsel { color:#464b5e; }

  .gantt-wrapper { overflow-x:auto; padding-bottom:8px; }
  .gantt-header { display:flex; margin-left:170px; border-bottom:1px solid #1e2230; margin-bottom:4px; }
  .gantt-week { min-width:42px; flex:1; font-size:9px; font-weight:500; color:#464b5e; text-transform:uppercase; letter-spacing:0.5px; padding:4px 0; text-align:center; border-left:1px solid #1a1d28; }
  .gantt-row { display:flex; align-items:center; height:36px; }
  .gantt-label { width:170px; flex-shrink:0; padding-right:12px; display:flex; align-items:center; gap:8px; }
  .gantt-customer-name { font-size:12.5px; font-weight:500; color:#c5c8d6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .gantt-cells { flex:1; display:flex; height:100%; position:relative; }
  .gantt-cell { min-width:42px; flex:1; border-left:1px solid #1a1d28; }
  .gantt-bar-segment { position:absolute; top:6px; bottom:6px; border-radius:3px; }
  .timeline-today { position:absolute; top:-4px; bottom:-4px; width:2px; background:#ef4444; z-index:2; opacity:0.7; }
  .timeline-today::after { content:'Today'; position:absolute; top:-16px; left:-14px; font-size:9px; color:#ef4444; font-weight:600; text-transform:uppercase; }

  .inline-add { display:flex; gap:6px; padding:4px 0 4px 32px; align-items:center; }
  .inline-add .input { font-size:12px; padding:6px 10px; }

  /* ─── Per-Customer Gantt ─── */
  .cgantt { background:#13161f; border:1px solid #1e2230; border-radius:12px; overflow:hidden; }
  .cgantt-scroll { overflow-x:auto; min-width:0; }
  .cgantt-inner { min-width:700px; }
  .cgantt-timehead { display:flex; border-bottom:1px solid #1e2230; }
  .cgantt-label-col { width:210px; flex-shrink:0; padding:8px 14px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#464b5e; }
  .cgantt-weeks { flex:1; display:flex; }
  .cgantt-wk { flex:1; min-width:36px; font-size:9px; font-weight:500; color:#3a3f52; text-align:center; padding:8px 0; border-left:1px solid #1a1d28; }
  .cgantt-wk-even { color:#565b6e; }
  .cgantt-l0-group { border-bottom:1px solid #1e2230; }
  .cgantt-l0-group:last-child { border-bottom:none; }
  .cgantt-l0-row { display:flex; align-items:center; height:38px; background:#10131b; }
  .cgantt-l0-label { width:210px; flex-shrink:0; padding:0 14px; display:flex; align-items:center; gap:8px; }
  .cgantt-l0-num { font-size:9px; font-weight:700; color:#464b5e; background:#1a1d28; border-radius:3px; padding:1px 5px; font-family:'JetBrains Mono',monospace; }
  .cgantt-l0-name { font-size:12.5px; font-weight:600; color:#e2e4eb; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cgantt-l0-track { flex:1; display:flex; height:100%; position:relative; }
  .cgantt-l0-track-cell { flex:1; min-width:36px; border-left:1px solid #1a1d28; }
  .cgantt-l0-bar { position:absolute; top:8px; bottom:8px; border-radius:4px; z-index:1; opacity:0.25; }
  .cgantt-l0-bar-fill { position:absolute; top:8px; bottom:8px; border-radius:4px; z-index:2; }
  .cgantt-l1-row { display:flex; align-items:center; height:30px; }
  .cgantt-l1-row:hover { background:#181b26; }
  .cgantt-l1-label { width:210px; flex-shrink:0; padding:0 14px 0 38px; display:flex; align-items:center; gap:6px; }
  .cgantt-l1-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .cgantt-l1-name { font-size:11.5px; color:#8b8fa3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cgantt-l1-name.done { color:#565b6e; text-decoration:line-through; }
  .cgantt-l1-track { flex:1; display:flex; height:100%; position:relative; }
  .cgantt-l1-track-cell { flex:1; min-width:36px; border-left:1px solid #15171f; }
  .cgantt-l1-bar { position:absolute; top:8px; bottom:8px; border-radius:3px; z-index:2; min-width:6px; }
  .cgantt-today { position:absolute; top:0; bottom:0; width:2px; background:#ef4444; z-index:5; opacity:0.6; }
  .cgantt-today-label { position:absolute; top:-1px; left:-14px; font-size:8px; color:#ef4444; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; }

  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#2e3348; border-radius:3px; }

  /* ─── Portfolio Table ─── */
  .ptable { width:100%; border-collapse:separate; border-spacing:0; }
  .ptable th { position:sticky; top:0; background:#10131b; padding:10px 12px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#464b5e; text-align:left; border-bottom:1px solid #1e2230; cursor:pointer; user-select:none; white-space:nowrap; transition:color 0.15s; }
  .ptable th:hover { color:#8b8fa3; }
  .ptable th.sorted { color:#818cf8; }
  .ptable th .sort-arrow { margin-left:4px; font-size:9px; }
  .ptable td { padding:9px 12px; font-size:12.5px; color:#c5c8d6; border-bottom:1px solid #1a1d28; white-space:nowrap; vertical-align:middle; }
  .ptable tr { transition:background 0.12s; }
  .ptable tr:hover { background:#181b26; }
  .ptable tr.clickable { cursor:pointer; }
  .ptable .mono { font-family:'JetBrains Mono',monospace; font-size:11px; color:#8b8fa3; }
  .ptable .name-cell { color:#c5c8ff; font-weight:500; }
  .ptable .slip { font-size:10px; font-weight:600; padding:2px 6px; border-radius:3px; }
  .slip-on-track { background:rgba(34,197,94,0.1); color:#22c55e; }
  .slip-minor { background:rgba(245,158,11,0.1); color:#f59e0b; }
  .slip-major { background:rgba(239,68,68,0.1); color:#ef4444; }

  .filter-bar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; align-items:center; }
  .filter-chip { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500; padding:5px 12px; border-radius:6px; cursor:pointer; border:1px solid #2e3348; background:none; color:#6b7088; transition:all 0.15s; }
  .filter-chip:hover { border-color:#565b6e; color:#c5c8d6; }
  .filter-chip.active { border-color:#6366f1; background:rgba(99,102,241,0.1); color:#818cf8; }
  .filter-chip-rag.active-green { border-color:#22c55e; background:rgba(34,197,94,0.1); color:#22c55e; }
  .filter-chip-rag.active-amber { border-color:#f59e0b; background:rgba(245,158,11,0.1); color:#f59e0b; }
  .filter-chip-rag.active-red { border-color:#ef4444; background:rgba(239,68,68,0.1); color:#ef4444; }
  .filter-chip-rag.active-blue { border-color:#3b82f6; background:rgba(59,130,246,0.1); color:#3b82f6; }
  .filter-sep { width:1px; height:20px; background:#1e2230; }
  .filter-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#464b5e; }
`;

// ─── Shared Components ───
function RagSelector({ value, onChange }) {
  return <div className="rag-selector">{RAG_CYCLE.map(r => <button key={r} className={`rag-option ${value===r?`sel-${r}`:"unsel"}`} onClick={()=>onChange(r)}>{RAG_LABELS[r]}</button>)}</div>;
}
function RagPill({ rag, onClick, small }) {
  return <button className={`rag-pill rag-pill-${rag}`} onClick={onClick} style={small?{fontSize:"9px",padding:"2px 6px"}:{}}><span className={`rag-dot ${small?"rag-dot-sm":""}`} style={{background:RAG_COLORS[rag]}} />{RAG_LABELS[rag]}</button>;
}

function getTierColor(tierLabel, tiers) {
  const t = tiers.find(t => t.label === tierLabel);
  return t ? t.color : "#8b8fa3";
}

function TierBadge({ tier, tiers }) {
  const c = getTierColor(tier, tiers);
  return <span className="badge" style={{background:`${c}18`,color:c}}>{tier}</span>;
}

// ─── Modals ───
function AddCustomerModal({ onClose, onAdd, tmpl, tiers }) {
  const [name,setName]=useState(""); const [tier,setTier]=useState(tiers[0]?.label||""); const [stakeholder,setStakeholder]=useState(""); const [sd,setSd]=useState(""); const [td,setTd]=useState(""); const [mgr,setMgr]=useState("You");
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">Add New Customer</div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Company Name *</label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Acme Corp" /></div>
        <div className="form-group"><label className="form-label">Tier</label><select className="input select-input" value={tier} onChange={e=>setTier(e.target.value)}>{tiers.map(t=><option key={t.id} value={t.label}>{t.label}</option>)}</select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Key Stakeholder</label><input className="input" value={stakeholder} onChange={e=>setStakeholder(e.target.value)} placeholder="e.g. Jamie Chen (VP Eng)" /></div>
        <div className="form-group"><label className="form-label">Onboarding Manager</label><input className="input" value={mgr} onChange={e=>setMgr(e.target.value)} placeholder="e.g. You" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date *</label><input className="input" type="date" value={sd} onChange={e=>setSd(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Target Go-Live *</label><input className="input" type="date" value={td} onChange={e=>setTd(e.target.value)} /></div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!name||!sd||!td} onClick={()=>onAdd({id:"c"+Date.now(),name,logo:name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),tier,startDate:sd,targetDate:td,baselineCompletion:td,forecastCompletion:td,onboardingManager:mgr,owner:mgr,stakeholder,milestones:mkCustomerMilestones(tmpl),transcripts:[],weeklyUpdates:[]})}>Add Customer</button>
      </div>
    </div></div>
  );
}

function AddTranscriptModal({ onClose, onAdd }) {
  const [title,setTitle]=useState(""); const [date,setDate]=useState(today()); const [text,setText]=useState("");
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">Add Gong Transcript</div>
      <div className="gong-notice"><strong>Gong API Integration:</strong> For production, connect to the Gong API. Paste transcript below for now.</div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Call Title *</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Weekly Check-in" /></div>
        <div className="form-group"><label className="form-label">Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Transcript *</label><textarea className="textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste transcript here..." style={{minHeight:"180px"}} /></div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!title||!text} onClick={()=>{if(title&&text)onAdd({id:"t"+Date.now(),title,date,text,summary:""})}}>Add Transcript</button></div>
    </div></div>
  );
}

function EditCustomerModal({ customer, onClose, onSave, tiers }) {
  const [name,setName]=useState(customer.name);
  const [tier,setTier]=useState(customer.tier);
  const [stakeholder,setStakeholder]=useState(customer.stakeholder);
  const [mgr,setMgr]=useState(customer.onboardingManager||"");
  const [sd,setSd]=useState(customer.startDate||"");
  const [td,setTd]=useState(customer.targetDate||"");
  const [bc,setBc]=useState(customer.baselineCompletion||"");
  const [fc,setFc]=useState(customer.forecastCompletion||"");
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">Edit Onboarding &mdash; {customer.name}</div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Company Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Tier</label><select className="input select-input" value={tier} onChange={e=>setTier(e.target.value)}>{(tiers||[]).map(t=><option key={t.id} value={t.label}>{t.label}</option>)}{!tiers?.find(t=>t.label===tier)&&<option value={tier}>{tier}</option>}</select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Key Stakeholder</label><input className="input" value={stakeholder} onChange={e=>setStakeholder(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Onboarding Manager</label><input className="input" value={mgr} onChange={e=>setMgr(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date</label><input className="input" type="date" value={sd} onChange={e=>setSd(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Target Go-Live</label><input className="input" type="date" value={td} onChange={e=>setTd(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Baseline Completion</label><input className="input" type="date" value={bc} onChange={e=>setBc(e.target.value)} /><div style={{fontSize:"10px",color:"#464b5e",marginTop:"4px"}}>Original target date (set once at kickoff)</div></div>
        <div className="form-group"><label className="form-label">Forecast Completion</label><input className="input" type="date" value={fc} onChange={e=>setFc(e.target.value)} /><div style={{fontSize:"10px",color:"#464b5e",marginTop:"4px"}}>Current best estimate</div></div>
      </div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...customer,name,tier,stakeholder,onboardingManager:mgr,startDate:sd||null,targetDate:td||null,baselineCompletion:bc||null,forecastCompletion:fc||null,logo:name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()})}>Save</button>
      </div>
    </div></div>
  );
}

function EditMilestoneModal({ item, isL0, onClose, onSave }) {
  const [notes,setNotes]=useState(item.notes||"");
  const [status,setStatus]=useState(item.status);
  const [rag,setRag]=useState(item.rag||"green");
  const [sd,setSd]=useState(item.startDate||"");
  const [ed,setEd]=useState(item.endDate||"");
  const [ptg,setPtg]=useState(item.pathToGreen||"");
  const canEdit = !isL0 || !(item.children?.length > 0);

  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">
        {isL0 && <span style={{fontSize:"11px",color:"#565b6e",marginRight:"8px"}}>L0 PHASE</span>}
        {item.label}
      </div>
      {isL0 && item.children?.length > 0 && <p style={{fontSize:"12px",color:"#6b7088",marginBottom:"14px"}}>Completion status and RAG are auto-derived from sub-milestones. You can still set dates, notes, and the Path to Green.</p>}

      {canEdit && (
        <div className="form-group"><label className="form-label">Completion Status</label>
          <select className="input select-input" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="complete">Complete</option>
          </select>
        </div>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date</label><input className="input" type="date" value={sd} onChange={e=>setSd(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">End Date</label><input className="input" type="date" value={ed} onChange={e=>setEd(e.target.value)} /></div>
      </div>

      {canEdit && (
        <div className="form-group"><label className="form-label">RAG Status</label><RagSelector value={rag} onChange={setRag} /></div>
      )}

      {/* Show PTG for amber/red — for L0 with children, show based on derived rag even though selector is hidden */}
      {(rag === "amber" || rag === "red") && (
        <div className="form-group">
          <label className="form-label" style={{color:RAG_COLORS[rag]}}>Path to Green {rag==="red"?"(Required)":"(Recommended)"}</label>
          <textarea className="textarea" value={ptg} onChange={e=>setPtg(e.target.value)} placeholder={"What actions are needed to get back to Green?\ne.g. 1) Escalate blocker to VP Eng\n2) Reschedule training"} style={{borderColor:rag==="red"&&!ptg.trim()?"#ef4444":undefined}} />
        </div>
      )}

      <div className="form-group"><label className="form-label">Notes</label><textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="General notes..." style={{minHeight:"80px"}} /></div>

      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...item, notes, status, rag, startDate:sd||null, endDate:ed||null, pathToGreen:(rag==="green"||rag==="blue")?"":ptg})}>Save</button>
      </div>
    </div></div>
  );
}

function MilestoneSettings({ milestones, onSave, onClose }) {
  const [items,setItems]=useState(milestones.map(m=>({...m}))); const [nl,setNl]=useState("");
  const colors=["#6366f1","#8b5cf6","#0ea5e9","#14b8a6","#f59e0b","#22c55e","#ec4899","#ef4444"];
  const add=()=>{if(nl.trim()){setItems([...items,{id:"l0-"+Date.now(),label:nl.trim(),color:colors[items.length%colors.length]}]);setNl("");}};
  return (
    <div className="card" style={{maxWidth:"600px"}}>
      <div className="card-header"><span className="card-title">L0 Phase Template</span></div>
      <p style={{fontSize:"12.5px",color:"#6b7088",marginBottom:"16px",lineHeight:1.6}}>Default Level 0 phases for new onboardings. L1 sub-milestones are added per-customer.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"14px"}}>
        {items.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"#181b26",borderRadius:"6px"}}>
          <span style={{width:"10px",height:"10px",borderRadius:"3px",background:m.color,flexShrink:0}} />
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#464b5e",width:"20px"}}>L0</span>
          <span style={{fontSize:"13px",color:"#e2e4eb",flex:1}}>{m.label}</span>
          <button onClick={()=>setItems(items.filter(x=>x.id!==m.id))} style={{background:"none",border:"none",color:"#565b6e",cursor:"pointer",fontSize:"14px"}}>{"\u2715"}</button>
        </div>)}
      </div>
      <div style={{display:"flex",gap:"8px"}}><input className="input" value={nl} onChange={e=>setNl(e.target.value)} placeholder="New phase name..." onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1}} /><button className="btn btn-ghost" onClick={add}>Add</button></div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(items)}>Save Template</button></div>
    </div>
  );
}

function TierSettings({ tiers, onSave, onClose }) {
  const [items,setItems]=useState(tiers.map(t=>({...t})));
  const [nl,setNl]=useState("");
  const colors=["#a78bfa","#38bdf8","#8b8fa3","#f472b6","#fb923c","#34d399","#fbbf24","#c084fc"];
  const add=()=>{if(nl.trim()){setItems([...items,{id:"t-"+Date.now(),label:nl.trim(),color:colors[items.length%colors.length]}]);setNl("");}};
  return (
    <div className="card" style={{maxWidth:"600px"}}>
      <div className="card-header"><span className="card-title">Customer Tiers</span></div>
      <p style={{fontSize:"12.5px",color:"#6b7088",marginBottom:"16px",lineHeight:1.6}}>Define the tier options available when creating or editing onboardings.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"14px"}}>
        {items.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"#181b26",borderRadius:"6px"}}>
          <span style={{width:"10px",height:"10px",borderRadius:"50%",background:t.color,flexShrink:0}} />
          <span style={{fontSize:"13px",color:"#e2e4eb",flex:1}}>{t.label}</span>
          <button onClick={()=>setItems(items.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",color:"#565b6e",cursor:"pointer",fontSize:"14px"}}>{"\u2715"}</button>
        </div>)}
      </div>
      <div style={{display:"flex",gap:"8px"}}><input className="input" value={nl} onChange={e=>setNl(e.target.value)} placeholder="New tier name..." onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1}} /><button className="btn btn-ghost" onClick={add}>Add</button></div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(items)}>Save Tiers</button></div>
    </div>
  );
}

// ─── Dashboard Gantt ───
function GanttChart({ customers, onSelectCustomer }) {
  if(!customers.length) return <div className="empty-state"><div className="empty-state-text">No customers yet</div></div>;
  const allD=customers.flatMap(c=>[new Date(c.startDate),new Date(c.targetDate)]);
  const mn=new Date(Math.min(...allD)); mn.setDate(mn.getDate()-7);
  const mx=new Date(Math.max(...allD)); mx.setDate(mx.getDate()+14);
  const tw=weeksBetween(mn,mx); const ws=Array.from({length:tw},(_,i)=>i);
  const tp=(weeksBetween(mn,new Date())/tw)*100;
  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">{ws.map(w=><div key={w} className="gantt-week">{w%2===0?weekLabel(mn,w):""}</div>)}</div>
      {customers.map((c,ci)=>{
        const cRag=deriveCustomerRag(c.milestones);
        const s=weeksBetween(mn,new Date(c.startDate)),e=weeksBetween(mn,new Date(c.targetDate));
        const p=getTotalProgress(c.milestones),l=(s/tw)*100,wd=((e-s)/tw)*100;
        const filledW = wd*(p/100);
        const remainW = wd - filledW;
        return <div key={c.id} className="gantt-row">
          <div className="gantt-label" style={{cursor:"pointer"}} onClick={()=>onSelectCustomer&&onSelectCustomer(c.id)}>
            <span className="rag-dot" style={{background:RAG_COLORS[cRag],width:"8px",height:"8px"}} />
            <div className="customer-avatar" style={{background:`linear-gradient(135deg,${c.milestones[0]?.color},${c.milestones[2]?.color})`,width:"22px",height:"22px",fontSize:"8px",borderRadius:"5px"}}>{c.logo}</div>
            <span className="gantt-customer-name" style={{color:"#c5c8ff"}}>{c.name}</span>
          </div>
          <div className="gantt-cells" style={{position:"relative"}}>
            {ws.map(w=><div key={w} className="gantt-cell" />)}
            {/* Filled progress bar */}
            {filledW > 0 && <div className="gantt-bar-segment" style={{left:`${l}%`,width:`${filledW}%`,background:`linear-gradient(90deg,${RAG_COLORS[cRag]}88,${RAG_COLORS[cRag]}cc)`,zIndex:1,borderRadius: remainW > 0 ? "3px 0 0 3px" : "3px"}} />}
            {/* Remaining track (greyed out) */}
            {remainW > 0 && <div className="gantt-bar-segment" style={{left:`${l + filledW}%`,width:`${remainW}%`,background:"#1e2230",zIndex:1,borderRadius: filledW > 0 ? "0 3px 3px 0" : "3px"}} />}
            {/* Today marker — text label only on first row */}
            {tp>0&&tp<100&&<div style={{position:"absolute",top:"-4px",bottom:"-4px",left:`${tp}%`,width:"2px",background:"#ef4444",zIndex:2,opacity:0.7}}>{ci===0&&<span style={{position:"absolute",top:"-16px",left:"-14px",fontSize:"9px",color:"#ef4444",fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>Today</span>}</div>}
          </div>
        </div>;
      })}
    </div>
  );
}

// ─── Exportable Gantt SVG Generator ───
function generateGanttSVG(customer) {
  const labelW = 220, chartLeft = 240, rightPad = 30, rowH = 32, l0RowH = 36, headerH = 60, footerH = 50;
  const ms = customer.milestones;
  const totalRows = ms.reduce((n, l0) => n + 1 + Math.max(l0.children.length, 0), 0);
  const chartH = headerH + totalRows * rowH + footerH + 20;
  const chartW = 960;
  const trackW = chartW - chartLeft - rightPad;

  const tStart = new Date(customer.startDate); tStart.setDate(tStart.getDate() - 7);
  const tEnd = new Date(customer.targetDate); tEnd.setDate(tEnd.getDate() + 14);
  const span = tEnd - tStart;
  const pct = d => { if (!d) return null; return Math.max(0, Math.min(100, ((new Date(d) - tStart) / span) * 100)); };
  const todayPct = pct(new Date());
  const totalWeeks = Math.max(1, Math.ceil(span / (7 * 24 * 60 * 60 * 1000)));

  const fDate = d => { if (!d) return ""; return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };
  const escXml = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ragHex = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6" };
  const cRag = deriveCustomerRag(ms);
  const progress = getTotalProgress(ms);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${chartW} ${chartH}" width="${chartW}" height="${chartH}" style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#0f1118">`;

  // Title block
  svg += `<text x="20" y="28" fill="#f0f1f5" font-size="16" font-weight="700">${escXml(customer.name)} \u2014 Onboarding Plan</text>`;
  svg += `<text x="20" y="46" fill="#6b7088" font-size="11">${escXml(customer.tier)} \u00b7 ${escXml(customer.stakeholder || "")} \u00b7 ${fDate(customer.startDate)} \u2192 ${fDate(customer.targetDate)} \u00b7 ${progress}% complete</text>`;
  // RAG badge
  svg += `<rect x="${chartW - 90}" y="14" width="70" height="22" rx="4" fill="${ragHex[cRag]}20"/><circle cx="${chartW - 80}" cy="25" r="4" fill="${ragHex[cRag]}"/><text x="${chartW - 72}" y="29" fill="${ragHex[cRag]}" font-size="11" font-weight="700">${cRag.toUpperCase()}</text>`;

  // Week grid lines and labels
  for (let w = 0; w < totalWeeks; w++) {
    const x = chartLeft + (w / totalWeeks) * trackW;
    svg += `<line x1="${x}" y1="${headerH - 8}" x2="${x}" y2="${chartH - footerH}" stroke="#1e2230" stroke-width="1"/>`;
    if (w % 2 === 0) {
      const d = new Date(tStart); d.setDate(d.getDate() + w * 7);
      svg += `<text x="${x + 2}" y="${headerH - 12}" fill="#464b5e" font-size="8.5" font-weight="500">${fDate(d)}</text>`;
    }
  }

  // Today line
  if (todayPct > 0 && todayPct < 100) {
    const tx = chartLeft + (todayPct / 100) * trackW;
    svg += `<line x1="${tx}" y1="${headerH - 8}" x2="${tx}" y2="${chartH - footerH}" stroke="#ef4444" stroke-width="1.5" opacity="0.7"/>`;
    svg += `<text x="${tx - 12}" y="${headerH - 14}" fill="#ef4444" font-size="8" font-weight="700">TODAY</text>`;
  }

  let y = headerH;

  ms.forEach((l0, l0i) => {
    const l0S = pct(l0.startDate), l0E = pct(l0.endDate);
    const hasSpan = l0S !== null && l0E !== null;
    const barL = hasSpan ? l0S : (l0i / ms.length) * 100;
    const barR = hasSpan ? l0E : ((l0i + 1) / ms.length) * 100;
    const barW = Math.max(1, barR - barL);
    const prog = getL0Progress(l0);
    const fillW = barW * (prog / 100);
    const bx = chartLeft + (barL / 100) * trackW;
    const bw = (barW / 100) * trackW;
    const fw = (fillW / 100) * trackW;

    // L0 row background
    svg += `<rect x="0" y="${y}" width="${chartW}" height="${l0RowH}" fill="#10131b"/>`;
    // RAG dot
    svg += `<circle cx="18" cy="${y + l0RowH / 2}" r="4" fill="${ragHex[l0.rag]}"/>`;
    // Phase number
    svg += `<rect x="28" y="${y + l0RowH / 2 - 8}" width="18" height="16" rx="3" fill="#1a1d28"/><text x="37" y="${y + l0RowH / 2 + 4}" fill="#464b5e" font-size="9" font-weight="700" text-anchor="middle">${l0i + 1}</text>`;
    // Label
    svg += `<text x="52" y="${y + l0RowH / 2 + 4}" fill="#e2e4eb" font-size="12" font-weight="600">${escXml(l0.label)}</text>`;
    // Progress text
    svg += `<text x="${labelW}" y="${y + l0RowH / 2 + 4}" fill="#8b8fa3" font-size="10">${prog}%</text>`;
    // Bar background
    svg += `<rect x="${bx}" y="${y + 9}" width="${bw}" height="${l0RowH - 18}" rx="4" fill="${l0.color}" opacity="0.2"/>`;
    // Bar fill
    if (fw > 0) svg += `<rect x="${bx}" y="${y + 9}" width="${fw}" height="${l0RowH - 18}" rx="4" fill="${ragHex[l0.rag]}" opacity="0.55"/>`;
    // Date range
    if (l0.startDate || l0.endDate) {
      svg += `<text x="${bx + bw + 6}" y="${y + l0RowH / 2 + 3}" fill="#464b5e" font-size="8">${fDate(l0.startDate)} \u2013 ${fDate(l0.endDate)}</text>`;
    }
    y += l0RowH;

    // L1 rows
    l0.children.forEach(l1 => {
      const l1S = pct(l1.startDate), l1E = pct(l1.endDate);
      const hasL1 = l1S !== null && l1E !== null;
      const l1Left = hasL1 ? l1S : barL;
      const l1W = hasL1 ? Math.max(1, l1E - l1S) : barW * 0.6;
      const lx = chartLeft + (l1Left / 100) * trackW;
      const lw = (l1W / 100) * trackW;
      const bColor = l1.status === "complete" ? "#565b6e" : ragHex[l1.rag];
      const bOp = l1.status === "complete" ? 0.35 : l1.status === "upcoming" ? 0.2 : 0.7;
      const txtOp = l1.status === "complete" ? 0.5 : 0.85;

      // L1 dot
      svg += `<circle cx="40" cy="${y + rowH / 2}" r="2.5" fill="${bColor}" opacity="${bOp + 0.2}"/>`;
      // Label
      svg += `<text x="50" y="${y + rowH / 2 + 3.5}" fill="#c5c8d6" font-size="10.5" opacity="${txtOp}"${l1.status === "complete" ? ' text-decoration="line-through"' : ""}>${escXml(l1.label)}</text>`;
      // Bar
      svg += `<rect x="${lx}" y="${y + 9}" width="${lw}" height="${rowH - 18}" rx="3" fill="${bColor}" opacity="${bOp}"/>`;
      // Date range
      if (l1.startDate || l1.endDate) {
        svg += `<text x="${lx + lw + 5}" y="${y + rowH / 2 + 3}" fill="#464b5e" font-size="7.5">${fDate(l1.startDate)} \u2013 ${fDate(l1.endDate)}</text>`;
      }
      y += rowH;
    });

    if (l0.children.length === 0) y += 4;
  });

  // Footer / legend
  const ly = chartH - footerH + 16;
  svg += `<line x1="20" y1="${ly - 8}" x2="${chartW - 20}" y2="${ly - 8}" stroke="#1e2230" stroke-width="1"/>`;
  const legendItems = [
    { color: ragHex.green, label: "Green" },
    { color: ragHex.amber, label: "Amber" },
    { color: ragHex.red, label: "Red" },
    { color: ragHex.blue, label: "Blue (Complete)" },
  ];
  let lx = 20;
  legendItems.forEach(li => {
    svg += `<rect x="${lx}" y="${ly}" width="14" height="6" rx="2" fill="${li.color}" opacity="0.6"/>`;
    svg += `<text x="${lx + 18}" y="${ly + 6}" fill="#6b7088" font-size="9">${li.label}</text>`;
    lx += 70;
  });
  // Today marker in legend
  svg += `<line x1="${lx}" y1="${ly - 1}" x2="${lx}" y2="${ly + 8}" stroke="#ef4444" stroke-width="1.5" opacity="0.7"/>`;
  svg += `<text x="${lx + 6}" y="${ly + 6}" fill="#6b7088" font-size="9">Today</text>`;
  lx += 60;
  // Generated date
  svg += `<text x="${chartW - 20}" y="${ly + 6}" fill="#3a3f52" font-size="8" text-anchor="end">Generated ${fDate(new Date())} \u00b7 Cloudsmith Onboarding Hub</text>`;

  svg += `</svg>`;
  return svg;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportGanttSVG(customer) {
  const svg = generateGanttSVG(customer);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadBlob(blob, `${customer.name.replace(/\s+/g, "-").toLowerCase()}-onboarding-plan.svg`);
}

function exportGanttPNG(customer) {
  const svg = generateGanttSVG(customer);
  const scale = 2;
  // Extract viewBox dimensions
  const vbMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const svgW = vbMatch ? parseInt(vbMatch[1]) : 960;
  const svgH = vbMatch ? parseInt(vbMatch[2]) : 600;

  const canvas = document.createElement("canvas");
  canvas.width = svgW * scale;
  canvas.height = svgH * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const img = new Image();
  img.crossOrigin = "anonymous";
  // Use base64 data URI — more reliable than blob URL in sandboxed contexts
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  img.onload = () => {
    ctx.drawImage(img, 0, 0, svgW, svgH);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${customer.name.replace(/\s+/g, "-").toLowerCase()}-onboarding-plan.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      // Fallback: open in new tab if download fails
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        }
      }, "image/png");
    }
  };
  img.onerror = () => {
    // If image load fails entirely, fall back to SVG download
    exportGanttSVG(customer);
  };
  img.src = `data:image/svg+xml;base64,${encoded}`;
}

// ─── Per-Customer Gantt ───
function CustomerGantt({ customer }) {
  const tStart = new Date(customer.startDate); tStart.setDate(tStart.getDate()-7);
  const tEnd = new Date(customer.targetDate); tEnd.setDate(tEnd.getDate()+14);
  const span = tEnd - tStart;
  const totalWeeks = Math.max(1, Math.ceil(span / (7*24*60*60*1000)));
  const weeks = Array.from({length:totalWeeks},(_,i)=>i);
  const todayPct = Math.max(0,Math.min(100,((new Date()-tStart)/span)*100));
  const pct = d => { if(!d) return null; return Math.max(0,Math.min(100,((new Date(d)-tStart)/span)*100)); };

  return (
    <div className="cgantt"><div className="cgantt-scroll"><div className="cgantt-inner">
      <div className="cgantt-timehead">
        <div className="cgantt-label-col">Milestone</div>
        <div className="cgantt-weeks">{weeks.map((w,i)=>{const d=new Date(tStart);d.setDate(d.getDate()+w*7);return <div key={w} className={`cgantt-wk ${i%2===0?"cgantt-wk-even":""}`}>{i%2===0?d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</div>;})}</div>
      </div>

      {customer.milestones.map((l0,l0i)=>{
        const l0Start = pct(l0.startDate);
        const l0End = pct(l0.endDate);
        const hasSpan = l0Start !== null && l0End !== null;
        const barLeft = hasSpan ? l0Start : (l0i / customer.milestones.length) * 100;
        const barRight = hasSpan ? l0End : ((l0i+1) / customer.milestones.length) * 100;
        const barW = Math.max(1, barRight - barLeft);
        const prog = getL0Progress(l0);
        const fillW = barW * (prog / 100);

        return <div key={l0.id} className="cgantt-l0-group">
          <div className="cgantt-l0-row">
            <div className="cgantt-l0-label">
              <span className="rag-dot rag-dot-sm" style={{background:RAG_COLORS[l0.rag]}} />
              <span className="cgantt-l0-num">{l0i+1}</span>
              <span className="cgantt-l0-name">{l0.label}</span>
            </div>
            <div className="cgantt-l0-track">
              {weeks.map(w=><div key={w} className="cgantt-l0-track-cell" />)}
              <div className="cgantt-l0-bar" style={{left:`${barLeft}%`,width:`${barW}%`,background:l0.color}} />
              <div className="cgantt-l0-bar-fill" style={{left:`${barLeft}%`,width:`${fillW}%`,background:RAG_COLORS[l0.rag],opacity:0.55}} />
              {todayPct>0&&todayPct<100&&<div className="cgantt-today" style={{left:`${todayPct}%`}}>{l0i===0&&<span className="cgantt-today-label">Today</span>}</div>}
            </div>
          </div>

          {l0.children.map(l1=>{
            const l1S = pct(l1.startDate);
            const l1E = pct(l1.endDate);
            const hasL1Span = l1S !== null && l1E !== null;
            const l1Left = hasL1Span ? l1S : barLeft;
            const l1W = hasL1Span ? Math.max(1, l1E - l1S) : barW * 0.6;
            const barColor = l1.status==="complete" ? "#565b6e" : RAG_COLORS[l1.rag];
            const barOp = l1.status==="complete" ? 0.35 : l1.status==="upcoming" ? 0.2 : 0.7;

            return <div key={l1.id} className="cgantt-l1-row">
              <div className="cgantt-l1-label">
                <span className="cgantt-l1-dot" style={{background:l1.status==="complete"?"#565b6e":RAG_COLORS[l1.rag]}} />
                <span className={`cgantt-l1-name ${l1.status==="complete"?"done":""}`}>{l1.label}</span>
              </div>
              <div className="cgantt-l1-track">
                {weeks.map(w=><div key={w} className="cgantt-l1-track-cell" />)}
                <div className="cgantt-l1-bar" style={{left:`${l1Left}%`,width:`${l1W}%`,background:barColor,opacity:barOp}} />
                {todayPct>0&&todayPct<100&&<div className="cgantt-today" style={{left:`${todayPct}%`}} />}
              </div>
            </div>;
          })}
          {l0.children.length===0&&<div className="cgantt-l1-row" style={{height:"4px"}} />}
        </div>;
      })}
    </div></div></div>
  );
}

// ─── Portfolio Table ───
function PortfolioTable({ customers, onSelectCustomer, onUpdateCustomer, tiers }) {
  const [sortKey,setSortKey]=useState("name");
  const [sortDir,setSortDir]=useState("asc");
  const [filterRag,setFilterRag]=useState(null);
  const [filterPhase,setFilterPhase]=useState(null);
  const [filterTier,setFilterTier]=useState(null);
  const [filterMgr,setFilterMgr]=useState(null);
  const [editingCustomer,setEditingCustomer]=useState(null);

  const allManagers = [...new Set(customers.map(c=>c.onboardingManager||"Unassigned"))].sort();
  const allPhases = DEFAULT_L0.map(l=>l.label);

  const getCurrentPhase = c => {
    const p = c.milestones.find(m=>m.status==="in-progress")||c.milestones.find(m=>m.status!=="complete")||c.milestones[c.milestones.length-1];
    return p?.label||"\u2014";
  };

  const getSlipDays = c => {
    if(!c.baselineCompletion||!c.forecastCompletion) return 0;
    return Math.round((new Date(c.forecastCompletion)-new Date(c.baselineCompletion))/(24*60*60*1000));
  };

  const toggle=(current,val)=>current===val?null:val;

  // Filter
  let filtered = customers;
  if(filterRag) filtered=filtered.filter(c=>deriveCustomerRag(c.milestones)===filterRag);
  if(filterPhase) filtered=filtered.filter(c=>getCurrentPhase(c)===filterPhase);
  if(filterTier) filtered=filtered.filter(c=>c.tier===filterTier);
  if(filterMgr) filtered=filtered.filter(c=>(c.onboardingManager||"Unassigned")===filterMgr);

  // Sort
  const sorted = [...filtered].sort((a,b)=>{
    let av,bv;
    const cRagA=deriveCustomerRag(a.milestones), cRagB=deriveCustomerRag(b.milestones);
    const ragOrder={red:0,amber:1,green:2,blue:3};
    switch(sortKey){
      case "name": av=a.name.toLowerCase(); bv=b.name.toLowerCase(); break;
      case "tier": av=a.tier; bv=b.tier; break;
      case "manager": av=(a.onboardingManager||"").toLowerCase(); bv=(b.onboardingManager||"").toLowerCase(); break;
      case "phase": av=getCurrentPhase(a); bv=getCurrentPhase(b); break;
      case "rag": av=ragOrder[cRagA]; bv=ragOrder[cRagB]; break;
      case "progress": av=getTotalProgress(a.milestones); bv=getTotalProgress(b.milestones); break;
      case "start": av=a.startDate||""; bv=b.startDate||""; break;
      case "baseline": av=a.baselineCompletion||""; bv=b.baselineCompletion||""; break;
      case "forecast": av=a.forecastCompletion||""; bv=b.forecastCompletion||""; break;
      case "slip": av=getSlipDays(a); bv=getSlipDays(b); break;
      default: av=a.name; bv=b.name;
    }
    if(av<bv) return sortDir==="asc"?-1:1;
    if(av>bv) return sortDir==="asc"?1:-1;
    return 0;
  });

  const handleSort=key=>{
    if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortTh=({k,children})=><th className={sortKey===k?"sorted":""} onClick={()=>handleSort(k)}>{children}<span className="sort-arrow">{sortKey===k?(sortDir==="asc"?"\u25B2":"\u25BC"):""}</span></th>;

  return <div>
    {/* Filter bar */}
    <div className="filter-bar">
      <span className="filter-label">RAG</span>
      {["green","amber","red","blue"].map(r=><button key={r} className={`filter-chip filter-chip-rag ${filterRag===r?`active-${r}`:""}`} onClick={()=>setFilterRag(toggle(filterRag,r))}>{RAG_LABELS[r]}</button>)}
      <div className="filter-sep" />
      <span className="filter-label">Phase</span>
      {allPhases.map(p=><button key={p} className={`filter-chip ${filterPhase===p?"active":""}`} onClick={()=>setFilterPhase(toggle(filterPhase,p))}>{p}</button>)}
      <div className="filter-sep" />
      <span className="filter-label">Tier</span>
      {tiers.map(t=><button key={t.id} className={`filter-chip ${filterTier===t.label?"active":""}`} onClick={()=>setFilterTier(toggle(filterTier,t.label))}>{t.label}</button>)}
      {allManagers.length>1&&<><div className="filter-sep" />
      <span className="filter-label">Manager</span>
      {allManagers.map(m=><button key={m} className={`filter-chip ${filterMgr===m?"active":""}`} onClick={()=>setFilterMgr(toggle(filterMgr,m))}>{m}</button>)}</>}
      {(filterRag||filterPhase||filterTier||filterMgr)&&<button className="filter-chip" style={{color:"#818cf8",borderColor:"#6366f1"}} onClick={()=>{setFilterRag(null);setFilterPhase(null);setFilterTier(null);setFilterMgr(null);}}>Clear all</button>}
    </div>

    <div style={{overflowX:"auto"}}>
      <table className="ptable">
        <thead><tr>
          <SortTh k="name">Customer</SortTh>
          <SortTh k="tier">Tier</SortTh>
          <SortTh k="manager">Manager</SortTh>
          <SortTh k="phase">Current Phase</SortTh>
          <SortTh k="rag">RAG</SortTh>
          <SortTh k="progress">Progress</SortTh>
          <SortTh k="start">Start</SortTh>
          <SortTh k="baseline">Baseline</SortTh>
          <SortTh k="forecast">Forecast</SortTh>
          <SortTh k="slip">Slip</SortTh>
          <th style={{cursor:"default"}}></th>
        </tr></thead>
        <tbody>
          {sorted.map(c=>{
            const cRag=deriveCustomerRag(c.milestones);
            const pr=getTotalProgress(c.milestones);
            const slip=getSlipDays(c);
            const slipClass=slip<=0?"slip-on-track":slip<=14?"slip-minor":"slip-major";
            return <tr key={c.id} className="clickable" onClick={()=>onSelectCustomer(c.id)}>
              <td className="name-cell">{c.name}</td>
              <td><TierBadge tier={c.tier} tiers={tiers} /></td>
              <td style={{color:"#8b8fa3"}}>{c.onboardingManager||"\u2014"}</td>
              <td style={{color:"#818cf8",fontSize:"11.5px"}}>{getCurrentPhase(c)}</td>
              <td><span className={`rag-pill rag-pill-${cRag}`} style={{fontSize:"9px",padding:"2px 7px"}}><span className="rag-dot rag-dot-sm" style={{background:RAG_COLORS[cRag]}} />{RAG_LABELS[cRag]}</span></td>
              <td><div style={{display:"flex",alignItems:"center",gap:"6px",minWidth:"80px"}}>
                <div style={{flex:1,height:"3px",background:"#2e3348",borderRadius:"2px",overflow:"hidden"}}><div style={{width:`${pr}%`,height:"100%",background:RAG_COLORS[cRag],borderRadius:"2px"}} /></div>
                <span className="mono">{pr}%</span>
              </div></td>
              <td className="mono">{fmtDate(c.startDate)}</td>
              <td className="mono">{fmtDate(c.baselineCompletion)}</td>
              <td className="mono">{fmtDate(c.forecastCompletion)}</td>
              <td>{slip!==0?<span className={`slip ${slipClass}`}>{slip>0?`+${slip}d`:`${slip}d`}</span>:<span className="mono" style={{color:"#565b6e"}}>{"\u2014"}</span>}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setEditingCustomer(c);}}>Edit</button></td>
            </tr>;
          })}
          {sorted.length===0&&<tr><td colSpan={11} style={{textAlign:"center",padding:"32px",color:"#464b5e"}}>No onboardings match filters</td></tr>}
        </tbody>
      </table>
    </div>

    <div style={{fontSize:"11px",color:"#464b5e",marginTop:"10px"}}>{sorted.length} of {customers.length} onboardings shown</div>

    {editingCustomer&&<EditCustomerModal customer={editingCustomer} onClose={()=>setEditingCustomer(null)} onSave={u=>{onUpdateCustomer(u);setEditingCustomer(null);}} tiers={tiers} />}
  </div>;
}

// ─── Dashboard ───
function DashboardView({ customers, onSelectCustomer, onUpdateCustomer, tiers }) {
  const t=customers.length;
  const greens=customers.filter(c=>deriveCustomerRag(c.milestones)==="green").length;
  const ambers=customers.filter(c=>deriveCustomerRag(c.milestones)==="amber").length;
  const reds=customers.filter(c=>deriveCustomerRag(c.milestones)==="red").length;

  return <div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-label">Active Onboardings</div><div className="stat-value">{t}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#22c55e"}}>Green</div><div className="stat-value" style={{color:"#22c55e"}}>{greens}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#f59e0b"}}>Amber</div><div className="stat-value" style={{color:"#f59e0b"}}>{ambers}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#ef4444"}}>Red</div><div className="stat-value" style={{color:reds>0?"#ef4444":"#565b6e"}}>{reds}</div></div>
    </div>
    <div className="card"><div className="card-header"><span className="card-title">Onboarding Timeline</span></div><GanttChart customers={customers} onSelectCustomer={onSelectCustomer} /></div>
    <div className="card">
      <div className="card-header"><span className="card-title">Portfolio</span></div>
      <PortfolioTable customers={customers} onSelectCustomer={onSelectCustomer} onUpdateCustomer={onUpdateCustomer} tiers={tiers} />
    </div>
  </div>;
}

// ─── Customer Detail ───
function CustomerDetailView({ customer, onUpdate, tiers }) {
  const [tab,setTab]=useState("plan");
  const [expanded,setExpanded]=useState(()=>{const ip=customer.milestones.findIndex(m=>m.status==="in-progress");return new Set(ip>=0?[ip]:[0]);});
  const [editItem,setEditItem]=useState(null); const [editIsL0,setEditIsL0]=useState(false);
  const [showAddTr,setShowAddTr]=useState(false);
  const [addingL1,setAddingL1]=useState(null); const [newL1,setNewL1]=useState("");
  const [genUp,setGenUp]=useState(false); const [wkUp,setWkUp]=useState("");
  const [editCust,setEditCust]=useState(false);
  const cRag=deriveCustomerRag(customer.milestones);

  const save=ms=>onUpdate({...customer,milestones:ms});

  const cycleL1Status=(l0i,l1Id)=>{
    save(customer.milestones.map((l0,i)=>{
      if(i!==l0i) return l0;
      const nc=l0.children.map(c=>c.id===l1Id?{...c,status:nextStatus(c.status),endDate:nextStatus(c.status)==="complete"&&!c.endDate?today():c.endDate,startDate:!c.startDate&&nextStatus(c.status)==="in-progress"?today():c.startDate}:c);
      return {...l0,children:nc,status:deriveL0Status(nc,l0.status),rag:deriveL0Rag(nc,l0.rag)};
    }));
  };

  const cycleL0Status=(l0i)=>{
    if(customer.milestones[l0i].children.length) return;
    save(customer.milestones.map((m,i)=>i===l0i?{...m,status:nextStatus(m.status),endDate:nextStatus(m.status)==="complete"&&!m.endDate?today():m.endDate,startDate:!m.startDate&&nextStatus(m.status)==="in-progress"?today():m.startDate}:m));
  };

  const handleEditSave=(updated)=>{
    let ms;
    if(editIsL0){
      ms=customer.milestones.map(m=>m.id===updated.id?{...m,notes:updated.notes,startDate:updated.startDate,endDate:updated.endDate,pathToGreen:updated.pathToGreen,...(m.children.length===0?{status:updated.status,rag:updated.rag}:{})}:m);
    } else {
      ms=customer.milestones.map(l0=>{
        const nc=l0.children.map(c=>c.id===updated.id?updated:c);
        const ch=nc.some((c,i)=>c!==l0.children[i]);
        return ch?{...l0,children:nc,status:deriveL0Status(nc,l0.status),rag:deriveL0Rag(nc,l0.rag)}:l0;
      });
    }
    save(ms); setEditItem(null);
  };

  const addL1Item=(l0i)=>{
    if(!newL1.trim()) return;
    save(customer.milestones.map((l0,i)=>i!==l0i?l0:{...l0,children:[...l0.children,mkL1(`l1-${Date.now()}`,newL1.trim())]}));
    setNewL1(""); setAddingL1(null);
  };

  const rmL1=(l0i,l1Id)=>{
    save(customer.milestones.map((l0,i)=>{
      if(i!==l0i) return l0;
      const nc=l0.children.filter(c=>c.id!==l1Id);
      return {...l0,children:nc,status:deriveL0Status(nc,l0.status),rag:deriveL0Rag(nc,l0.rag)};
    }));
  };

  const summarize=async tr=>{
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Summarise this onboarding call transcript in 2-3 sentences, focusing on decisions, blockers, and next steps:\n\n${tr.text}`}]})});const d=await r.json();const s=d.content?.map(b=>b.text||"").join("")||"";onUpdate({...customer,transcripts:customer.transcripts.map(t=>t.id===tr.id?{...t,summary:s}:t)});}catch{}
  };

  const genWeekly=async()=>{
    setGenUp(true);setWkUp("");
    const mCtx=customer.milestones.map(l0=>{
      const l1s=l0.children.map(c=>`    [L1] ${c.label}: ${c.status} | RAG: ${c.rag} | ${fmtRange(c.startDate,c.endDate)}${c.pathToGreen?` | P2G: ${c.pathToGreen}`:""}${c.notes?` | ${c.notes}`:""}`).join("\n");
      return `[L0] ${l0.label}: ${l0.status} | RAG: ${l0.rag.toUpperCase()} | ${fmtRange(l0.startDate,l0.endDate)} (${getL0Progress(l0)}%)${l0.pathToGreen?`\n    Path to Green: ${l0.pathToGreen}`:""}${l0.notes?` | ${l0.notes}`:""}\n${l1s}`;
    }).join("\n");
    const tCtx=customer.transcripts.slice(-5).map(t=>`Call: ${t.title} (${t.date})\n${t.summary||t.text.slice(0,500)}`).join("\n\n");
    const prev=customer.weeklyUpdates.slice(-3).map(u=>`[${u.date}]\n${u.text}`).join("\n\n");
    const prompt=`You are a senior onboarding manager at Cloudsmith. Generate a weekly status update for ${customer.name}.\n\nCustomer: ${customer.name} (${customer.tier}) | Stakeholder: ${customer.stakeholder}\nTimeline: ${customer.startDate} \u2192 ${customer.targetDate} | Overall RAG: ${cRag.toUpperCase()}\nProgress: ${getTotalProgress(customer.milestones)}%\n\nMilestones with date ranges (phases may overlap):\n${mCtx}\n\nRecent Calls:\n${tCtx||"None."}\n${prev?`\nPrevious Updates:\n${prev}`:""}\n\nWrite a professional 150-250 word weekly update:\n1. State overall RAG and current phase(s) — note any running in parallel\n2. Highlight accomplishments (reference specific L1s)\n3. For Amber/Red items: state the issue AND Path to Green actions\n4. Next steps for the coming week\n5. Escalation items if any Red milestones exist\n\nDirect, clear tone for leadership. Use GREEN/AMBER/RED labels. Short paragraphs, no bullets.`;
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});const d=await r.json();const txt=d.content?.map(b=>b.text||"").join("")||"Failed.";setWkUp(txt);onUpdate({...customer,weeklyUpdates:[...customer.weeklyUpdates,{date:today(),text:txt}]});}catch{setWkUp("Error generating update.");}
    setGenUp(false);
  };

  return <div>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px"}}>
      <div className="customer-avatar" style={{background:`linear-gradient(135deg,${customer.milestones[0]?.color},${customer.milestones[2]?.color})`,width:"48px",height:"48px",fontSize:"16px",borderRadius:"12px"}}>{customer.logo}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{fontSize:"20px",fontWeight:600,color:"#f0f1f5"}}>{customer.name}</span>
          <TierBadge tier={customer.tier} tiers={tiers} />
          <RagPill rag={cRag} onClick={()=>{}} />
        </div>
        <div style={{fontSize:"12.5px",color:"#6b7088",marginTop:"3px"}}>{customer.onboardingManager&&<span>{customer.onboardingManager} &middot; </span>}{customer.stakeholder} &middot; {fmtDate(customer.startDate)} &rarr; {fmtDate(customer.targetDate)} &middot; {getTotalProgress(customer.milestones)}% complete{customer.forecastCompletion&&customer.baselineCompletion&&customer.forecastCompletion!==customer.baselineCompletion&&<span style={{color:"#f59e0b"}}> &middot; Forecast: {fmtDate(customer.forecastCompletion)}</span>}</div>
        <button className="btn btn-ghost btn-sm" style={{marginTop:"6px"}} onClick={()=>setEditCust(true)}>Edit details</button>
      </div>
    </div>

    {/* Phase RAG bar */}
    <div style={{display:"flex",gap:"3px",marginBottom:"24px",height:"6px"}}>
      {customer.milestones.map(l0=><div key={l0.id} style={{flex:1,background:"#1e2230",borderRadius:"3px",overflow:"hidden"}} title={`${l0.label}: ${RAG_LABELS[l0.rag]} (${getL0Progress(l0)}%)`}><div style={{width:`${getL0Progress(l0)}%`,height:"100%",background:RAG_COLORS[l0.rag],borderRadius:"3px",transition:"width 0.4s"}} /></div>)}
    </div>

    <div className="tabs">
      <button className={`tab ${tab==="plan"?"active":""}`} onClick={()=>setTab("plan")}>Plan</button>
      <button className={`tab ${tab==="milestones"?"active":""}`} onClick={()=>setTab("milestones")}>Milestones</button>
      <button className={`tab ${tab==="transcripts"?"active":""}`} onClick={()=>setTab("transcripts")}>Transcripts ({customer.transcripts.length})</button>
      <button className={`tab ${tab==="weekly"?"active":""}`} onClick={()=>setTab("weekly")}>Weekly Update</button>
      <button className={`tab ${tab==="history"?"active":""}`} onClick={()=>setTab("history")}>History ({customer.weeklyUpdates.length})</button>
    </div>

    {/* ── PLAN ── */}
    {tab==="plan"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginBottom:"14px"}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>exportGanttSVG(customer)}>{"\u2B07"} Export SVG</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>exportGanttPNG(customer)}>{"\u2B07"} Export PNG</button>
      </div>
      <CustomerGantt customer={customer} />
      <div style={{display:"flex",gap:"16px",marginTop:"14px",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#6b7088"}}><span style={{width:"20px",height:"6px",borderRadius:"3px",background:RAG_COLORS.green,opacity:0.55}} /> Green</div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#6b7088"}}><span style={{width:"20px",height:"6px",borderRadius:"3px",background:RAG_COLORS.amber,opacity:0.55}} /> Amber</div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#6b7088"}}><span style={{width:"20px",height:"6px",borderRadius:"3px",background:RAG_COLORS.red,opacity:0.55}} /> Red</div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#6b7088"}}><span style={{width:"20px",height:"6px",borderRadius:"3px",background:RAG_COLORS.blue,opacity:0.55}} /> Blue (Complete)</div>
        <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#6b7088"}}><span style={{width:"2px",height:"12px",background:"#ef4444",opacity:0.6}} /> Today</div>
      </div>
    </div>}

    {/* ── MILESTONES ── */}
    {tab==="milestones"&&<div>
      {customer.milestones.map((l0,l0i)=>{
        const open=expanded.has(l0i); const prog=getL0Progress(l0);
        return <div key={l0.id} className="l0-phase" style={{animationDelay:`${l0i*0.05}s`,borderColor:(l0.rag==="amber"||l0.rag==="red")?`${RAG_COLORS[l0.rag]}30`:undefined}}>
          <button className="l0-header" onClick={()=>setExpanded(p=>{const n=new Set(p);n.has(l0i)?n.delete(l0i):n.add(l0i);return n;})}>
            <button className={`milestone-check ${l0.status}`} onClick={e=>{e.stopPropagation();cycleL0Status(l0i);}} title={l0.children.length?"Auto-derived":"Click to cycle"}><StatusIcon status={l0.status} /></button>
            <div className="l0-label">
              <span className="phase-num">{l0i+1}</span>
              {l0.label}
              {l0.children.length>0&&<span style={{fontSize:"11px",color:"#565b6e"}}>({l0.children.filter(c=>c.status==="complete").length}/{l0.children.length})</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div className="l0-progress-bar" style={{width:"60px"}}><div className="l0-progress-fill" style={{width:`${prog}%`,background:RAG_COLORS[l0.rag]}} /></div>
              <span style={{fontSize:"11px",color:"#8b8fa3",fontFamily:"'JetBrains Mono',monospace",minWidth:"28px"}}>{prog}%</span>
            </div>
            <span className={`status-pill status-${l0.status}`}>{l0.status.replace("-"," ")}</span>
            <RagPill rag={l0.rag} small onClick={e=>{e.stopPropagation();if(!l0.children.length){save(customer.milestones.map((m,i)=>i===l0i?{...m,rag:nextRag(m.rag)}:m));}}} />
            <span className={`l0-chevron ${open?"open":""}`}>{"\u25B8"}</span>
          </button>

          {(l0.rag==="amber"||l0.rag==="red")&&<div className={`ptg-bar ptg-bar-${l0.rag}`} style={{cursor:"pointer"}} onClick={()=>{setEditItem(l0);setEditIsL0(true);}} title="Click to edit Path to Green">
            <span className="ptg-label">Path to Green:</span>
            <span className="ptg-text">{l0.pathToGreen||<span style={{fontStyle:"italic",opacity:0.6}}>Click to set path to green...</span>}</span>
          </div>}

          {open&&<div className="l1-container">
            {l0.notes&&<div style={{padding:"6px 10px 10px 32px",fontSize:"12px",color:"#6b7088",fontStyle:"italic"}}>{l0.notes}</div>}
            {/* L0 date range */}
            {(l0.startDate||l0.endDate)&&<div style={{padding:"2px 10px 8px 32px",fontSize:"11px",color:"#464b5e",fontFamily:"'JetBrains Mono',monospace"}}>{fmtRange(l0.startDate,l0.endDate)}</div>}
            {l0.children.map(l1=><div key={l1.id}>
              <div className="l1-row">
                <button className={`milestone-check sm ${l1.status}`} onClick={()=>cycleL1Status(l0i,l1.id)}><StatusIcon status={l1.status} /></button>
                <span className="l1-name" style={{opacity:l1.status==="complete"?0.55:1,textDecoration:l1.status==="complete"?"line-through":"none"}}>{l1.label}</span>
                <span className="l1-date">{fmtRange(l1.startDate,l1.endDate)}</span>
                <span className={`status-pill status-${l1.status}`} style={{fontSize:"9px"}}>{l1.status.replace("-"," ")}</span>
                <RagPill rag={l1.rag} small onClick={()=>{
                  const ms=customer.milestones.map((m,i)=>{if(i!==l0i)return m;const nc=m.children.map(c=>c.id===l1.id?{...c,rag:nextRag(c.rag)}:c);return{...m,children:nc,rag:deriveL0Rag(nc,m.rag)};});
                  save(ms);
                }} />
                <div style={{display:"flex",gap:"4px"}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setEditItem(l1);setEditIsL0(false);}}>Edit</button>
                  <button style={{background:"none",border:"none",color:"#464b5e",cursor:"pointer",fontSize:"12px",padding:"2px 6px"}} onClick={()=>rmL1(l0i,l1.id)}>{"\u2715"}</button>
                </div>
              </div>
              {(l1.rag==="amber"||l1.rag==="red")&&l1.pathToGreen&&<div className={`ptg-bar-l1 ptg-bar-${l1.rag}`}><span className="ptg-label" style={{fontSize:"9px"}}>P2G:</span><span className="ptg-text">{l1.pathToGreen}</span></div>}
            </div>)}
            {addingL1===l0i?<div className="inline-add">
              <input className="input" value={newL1} onChange={e=>setNewL1(e.target.value)} placeholder="Sub-milestone name..." autoFocus onKeyDown={e=>{if(e.key==="Enter")addL1Item(l0i);if(e.key==="Escape"){setAddingL1(null);setNewL1("");}}} style={{flex:1}} />
              <button className="btn btn-primary btn-sm" onClick={()=>addL1Item(l0i)}>Add</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setAddingL1(null);setNewL1("");}}>Cancel</button>
            </div>:<button className="add-l1-btn" onClick={()=>setAddingL1(l0i)}>+ Add sub-milestone</button>}
            <div style={{padding:"4px 10px 2px 32px"}}><button style={{background:"none",border:"none",color:"#464b5e",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setEditItem(l0);setEditIsL0(true);}}>Edit phase details</button></div>
          </div>}
        </div>;
      })}
    </div>}

    {tab==="transcripts"&&<div>
      <div className="gong-notice"><strong>Gong Integration:</strong> In production, connects to Gong API (v2/calls) to auto-import. Paste manually for now.</div>
      <div style={{marginBottom:"12px"}}><button className="btn btn-primary" onClick={()=>setShowAddTr(true)}>+ Add Transcript</button></div>
      {!customer.transcripts.length?<div className="empty-state"><div className="empty-state-icon">{"\uD83C\uDF99"}</div><div className="empty-state-text">No transcripts yet.</div></div>:
      <div className="transcript-list">{customer.transcripts.map(t=><div key={t.id} className="transcript-item">
        <span className="transcript-date">{fmtDate(t.date)}</span>
        <div><div className="transcript-title">{t.title}</div><div className="transcript-summary">{t.summary||<span style={{fontStyle:"italic",color:"#464b5e"}}>No summary yet</span>}</div></div>
        {!t.summary&&<button className="btn btn-ghost" style={{fontSize:"11px",whiteSpace:"nowrap"}} onClick={()=>summarize(t)}>{"\u2726"} Summarise</button>}
      </div>)}</div>}
    </div>}

    {tab==="weekly"&&<div className="card">
      <div className="card-header"><span className="card-title">Generate Weekly Update</span><button className="btn btn-primary" onClick={genWeekly} disabled={genUp}>{genUp?"Generating...":"\u2726 Generate Update"}</button></div>
      <p style={{fontSize:"12.5px",color:"#6b7088",marginBottom:"16px",lineHeight:1.6}}>AI-generated update using L0/L1 milestones with date ranges, RAG statuses, Path to Green actions, and previous updates.</p>
      {genUp&&<div className="generating"><div className="generating-dot" />Analysing onboarding data...</div>}
      {wkUp&&!genUp&&<div className="update-output">{wkUp}</div>}
    </div>}

    {tab==="history"&&(!customer.weeklyUpdates.length?<div className="empty-state"><div className="empty-state-icon">{"\uD83D\uDCCB"}</div><div className="empty-state-text">No updates yet.</div></div>:
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>{[...customer.weeklyUpdates].reverse().map((u,i)=><div key={i} className="card"><div className="card-header"><span className="card-title">Update \u2014 {fmtDate(u.date)}</span></div><div className="update-output" style={{maxHeight:"200px"}}>{u.text}</div></div>)}</div>
    )}

    {editItem&&<EditMilestoneModal item={editItem} isL0={editIsL0} onClose={()=>setEditItem(null)} onSave={handleEditSave} />}
    {showAddTr&&<AddTranscriptModal onClose={()=>setShowAddTr(false)} onAdd={t=>{onUpdate({...customer,transcripts:[...customer.transcripts,t]});setShowAddTr(false);}} />}
    {editCust&&<EditCustomerModal customer={customer} onClose={()=>setEditCust(false)} onSave={u=>{onUpdate(u);setEditCust(false);}} tiers={tiers} />}
  </div>;
}

// ─── App ───
function App() {
  const [customers,setCustomers]=useState(SAMPLES);
  const [view,setView]=useState("dashboard");
  const [selId,setSelId]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [tmpl,setTmpl]=useState(DEFAULT_L0);
  const [tiers,setTiers]=useState(DEFAULT_TIERS);

  useEffect(()=>{
    const l=document.createElement("link");l.rel="stylesheet";l.href=FONT_LINK;document.head.appendChild(l);
    const s=document.createElement("style");s.textContent=styles;document.head.appendChild(s);
    return()=>{document.head.removeChild(l);document.head.removeChild(s);};
  },[]);

  const cur=customers.find(c=>c.id===selId);

  return <div className="app">
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand"><div className="sidebar-brand-icon">CS</div><h1>Onboarding Hub</h1></div>
        <div className="sidebar-brand-sub">Cloudsmith &middot; Onboarding Ops</div>
      </div>
      <div className="sidebar-nav">
        <button className={`nav-item ${view==="dashboard"?"active":""}`} onClick={()=>{setView("dashboard");setSelId(null);}}><span className="nav-icon">{"\u25EB"}</span> Dashboard</button>
        <button className={`nav-item ${view==="settings"?"active":""}`} onClick={()=>setView("settings")}><span className="nav-icon">{"\u2699"}</span> Phase Template</button>
        <button className={`nav-item ${view==="tiers"?"active":""}`} onClick={()=>setView("tiers")}><span className="nav-icon">{"\u25CE"}</span> Tiers</button>
      </div>
      <div className="sidebar-customers">
        <div className="sidebar-section-title">Customers</div>
        {customers.map(c=>{const r=deriveCustomerRag(c.milestones);return <button key={c.id} className={`customer-item ${selId===c.id?"active":""}`} onClick={()=>{setSelId(c.id);setView("customer");}}>
          <div className="customer-avatar" style={{background:`linear-gradient(135deg,${c.milestones[0]?.color},${c.milestones[2]?.color})`}}>{c.logo}</div>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
          <span className="rag-dot" style={{background:RAG_COLORS[r],marginLeft:"auto"}} />
        </button>;})}
      </div>
      <div className="add-customer-sidebar"><button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} onClick={()=>setShowAdd(true)}>+ Add Customer</button></div>
    </div>

    <div className="main">
      <div className="main-header">
        <div>
          <div className="main-title">{view==="customer"&&cur?cur.name:view==="settings"?"Phase Template":view==="tiers"?"Tiers":"Dashboard"}</div>
          <div className="main-subtitle">
            {view==="dashboard"&&`${customers.length} active onboardings`}
            {view==="customer"&&cur&&`${cur.tier} \u00B7 ${cur.stakeholder}`}
            {view==="settings"&&"Configure default L0 onboarding phases"}
            {view==="tiers"&&"Manage customer tier categories"}
          </div>
        </div>
        {view==="dashboard"&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ New Customer</button>}
      </div>
      <div className="main-body">
        {view==="dashboard"&&<DashboardView customers={customers} onSelectCustomer={id=>{setSelId(id);setView("customer");}} onUpdateCustomer={u=>setCustomers(customers.map(c=>c.id===u.id?u:c))} tiers={tiers} />}
        {view==="customer"&&cur&&<CustomerDetailView customer={cur} onUpdate={u=>setCustomers(customers.map(c=>c.id===u.id?u:c))} tiers={tiers} />}
        {view==="settings"&&<MilestoneSettings milestones={tmpl} onSave={i=>{setTmpl(i);setView("dashboard");}} onClose={()=>setView("dashboard")} />}
        {view==="tiers"&&<TierSettings tiers={tiers} onSave={i=>{setTiers(i);setView("dashboard");}} onClose={()=>setView("dashboard")} />}
      </div>
    </div>

    {showAdd&&<AddCustomerModal onClose={()=>setShowAdd(false)} onAdd={nc=>{setCustomers([...customers,nc]);setShowAdd(false);setSelId(nc.id);setView("customer");}} tmpl={tmpl} tiers={tiers} />}
  </div>;
}


// Tell React to render the app inside the <div id="root"> from our index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
