// ─── Cloudsmith Onboarding Hub — Shared constants, data, and utilities ───────
//
// This file is the single source of truth for all non-UI logic.
// Every export here is a direct port from cloudsmith-onboarding-hub.jsx.
// No React imports — safe to use in both Server and Client Components.

// ─── Phase template ───────────────────────────────────────────────────────────

export const DEFAULT_L0 = [
  { id: "l0-1", label: "Kickoff",            color: "#6366f1" },
  { id: "l0-2", label: "Discovery",          color: "#8b5cf6" },
  { id: "l0-3", label: "Configuration",      color: "#0ea5e9" },
  { id: "l0-4", label: "Artifact Migration", color: "#14b8a6" },
  { id: "l0-5", label: "Rollout",            color: "#f59e0b" },
  { id: "l0-6", label: "Decommission",       color: "#22c55e" },
];

// ─── Tiers ────────────────────────────────────────────────────────────────────

export const DEFAULT_TIERS = [
  { id: "t1", label: "Strategic", color: "#a78bfa" },
  { id: "t2", label: "Enterprise", color: "#38bdf8" },
  { id: "t3", label: "Ultra",      color: "#f59e0b" },
];

// ─── Industries ───────────────────────────────────────────────────────────────

export const DEFAULT_INDUSTRIES = [
  "Artificial Intelligence",
  "Cloud Infrastructure",
  "Data & Analytics",
  "Developer Tools",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Media & Entertainment",
  "Retail",
  "Telecommunications",
];

// ─── Complexity ───────────────────────────────────────────────────────────────

export const DEFAULT_COMPLEXITY = [
  { key: "S",   capPct: 10, maxConcurrent: 6, hoursPerWeek: 4  },
  { key: "M",   capPct: 15, maxConcurrent: 6, hoursPerWeek: 6  },
  { key: "L",   capPct: 20, maxConcurrent: 5, hoursPerWeek: 8  },
  { key: "XL",  capPct: 20, maxConcurrent: 4, hoursPerWeek: 8  },
  { key: "XXL", capPct: 50, maxConcurrent: 3, hoursPerWeek: 16 },
];

export const COMPLEXITY_KEYS = ["S", "M", "L", "XL", "XXL"];

// ─── RAG ──────────────────────────────────────────────────────────────────────

export const RAG_LABELS = { green: "Green", amber: "Amber", red: "Red", blue: "Blue" };
export const RAG_COLORS = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6" };
export const RAG_CYCLE  = ["green", "amber", "red", "blue"];

// ─── Status ───────────────────────────────────────────────────────────────────

export const STATUS_CYCLE = ["upcoming", "in-progress", "complete"];

// ─── RID enumerations ─────────────────────────────────────────────────────────

export const RID_TYPES      = ["Risk", "Issue", "Dependency"];
export const RID_SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const RID_STATUSES   = ["Open", "Mitigated", "Closed"];
export const RID_SEV_COLORS = {
  Low:      "#565b6e",
  Medium:   "#f59e0b",
  High:     "#ef4444",
  Critical: "#dc2626",
};

// ─── Font ─────────────────────────────────────────────────────────────────────

export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap";

// ─── Factory helpers ─────────────────────────────────────────────────────────
// These are used both to construct seed data (SAMPLES) and at runtime when
// users add milestones or RIDs through the UI.

/**
 * Create an L1 (sub-milestone) object with sensible defaults.
 * @param {string} id
 * @param {string} label
 * @param {string} [status]
 * @param {string} [rag]
 * @param {string|null} [sd] startDate ISO string
 * @param {string|null} [ed] endDate ISO string
 * @param {string} [notes]
 * @param {string} [ptg] pathToGreen
 * @param {string[]} [deps] dependsOn IDs
 */
export function mkL1(id, label, status, rag, sd, ed, notes, ptg, deps) {
  return {
    id,
    label,
    status:      status || "upcoming",
    rag:         rag    || "green",
    startDate:   sd     || null,
    endDate:     ed     || null,
    notes:       notes  || "",
    pathToGreen: ptg    || "",
    dependsOn:   deps   || [],
  };
}

/**
 * Create a RID (Risk / Issue / Dependency) object.
 */
export function mkRid(id, type, title, severity, status, linkedMilestone, owner, description, mitigation) {
  return {
    id,
    type:            type            || "Risk",
    title,
    severity:        severity        || "Medium",
    status:          status          || "Open",
    linkedMilestone: linkedMilestone || null,
    owner:           owner           || "",
    description:     description     || "",
    mitigation:      mitigation      || "",
    createdDate:     new Date().toISOString().split("T")[0],
  };
}

/**
 * Stamp a fresh copy of the L0 template onto a new customer (no dates, no children).
 * @param {typeof DEFAULT_L0} tmpl
 */
export function mkCustomerMilestones(tmpl) {
  return tmpl.map(l0 => ({
    ...l0,
    status:      "upcoming",
    rag:         "green",
    startDate:   null,
    endDate:     null,
    notes:       "",
    pathToGreen: "",
    children:    [],
  }));
}

// ─── Seed data ────────────────────────────────────────────────────────────────
// 9 sample onboardings covering a range of complexities and states.
// In production this would be fetched from a database.

export const SAMPLES = [
  {
    id: "c1", name: "Acme Corp", logo: "AC", tier: "Strategic",
    complexity: "XXL", industry: "Manufacturing",
    startDate: "2025-07-01", targetDate: "2026-04-30",
    baselineCompletion: "2026-03-31", forecastCompletion: "2026-04-30",
    onboardingManager: "You", owner: "You",
    stakeholder: "Jamie Chen (VP Eng)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-07-01", endDate: "2025-07-18", notes: "Strong alignment on goals", pathToGreen: "", children: [
        mkL1("c1-1", "Intro & stakeholder mapping",  "complete", "blue", "2025-07-01", "2025-07-07"),
        mkL1("c1-2", "Define success criteria",       "complete", "blue", "2025-07-07", "2025-07-14", "ARR protection + time-to-value targets"),
        mkL1("c1-3", "Onboarding charter sign-off",  "complete", "blue", "2025-07-14", "2025-07-18"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-07-21", endDate: "2025-09-12", notes: "Full audit done", pathToGreen: "", children: [
        mkL1("c1-4", "Current tooling audit",         "complete", "blue", "2025-07-21", "2025-08-08", "Artifactory + S3 buckets + legacy Nexus"),
        mkL1("c1-5", "Package format inventory",      "complete", "blue", "2025-08-04", "2025-08-22", "npm, Docker, Maven, Helm, PyPI"),
        mkL1("c1-6", "Compliance & access review",    "complete", "blue", "2025-08-18", "2025-09-05", "SOC2 requirements documented"),
        mkL1("c1-7", "Network & firewall assessment", "complete", "blue", "2025-08-25", "2025-09-12", "Egress rules for air-gapped environments"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-09-15", endDate: "2025-11-28", notes: "SSO + repos configured", pathToGreen: "", children: [
        mkL1("c1-8",  "SSO / SAML setup",               "complete", "blue", "2025-09-15", "2025-10-03"),
        mkL1("c1-9",  "Repository structure design",     "complete", "blue", "2025-09-22", "2025-10-17", "Mono-repo per team, 12 teams"),
        mkL1("c1-10", "Upstream proxy configuration",    "complete", "blue", "2025-10-13", "2025-11-07"),
        mkL1("c1-11", "Retention & cleanup policies",    "complete", "blue", "2025-10-27", "2025-11-14"),
        mkL1("c1-12", "Vulnerability scanning setup",    "complete", "blue", "2025-11-10", "2025-11-28"),
      ]},
      { ...DEFAULT_L0[3], status: "in-progress", rag: "amber", startDate: "2025-11-17", endDate: "2026-03-28", notes: "GitHub Actions done, Jenkins WIP", pathToGreen: "Need infra team to unblock Jenkins access by end of March. Escalation path via VP Eng.", children: [
        mkL1("c1-13", "npm migration (150 packages)",  "complete",    "blue", "2025-11-17", "2025-12-19"),
        mkL1("c1-14", "Docker image migration",         "complete",    "blue", "2025-12-01", "2026-01-16", "320 images migrated"),
        mkL1("c1-15", "Maven artifact migration",       "in-progress", "green", "2026-01-06", "2026-03-07", "180/240 artifacts moved"),
        mkL1("c1-16", "PyPI package migration",         "in-progress", "green", "2026-02-03", "2026-03-14"),
        mkL1("c1-17", "Helm chart migration",           "upcoming",    "green", "2026-03-03", "2026-03-21"),
        mkL1("c1-18", "CI/CD pipeline rewiring",        "in-progress", "amber", "2026-01-20", "2026-03-28", "GH Actions done, Jenkins WIP", "Escalate to Acme infra team lead re: Jenkins credentials"),
      ]},
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-03-02", endDate: "2026-04-18", notes: "", pathToGreen: "", children: [
        mkL1("c1-19", "Pilot team rollout (Platform team)",       "upcoming", "green", "2026-03-02", "2026-03-21"),
        mkL1("c1-20", "Wave 2 rollout (Backend teams)",           "upcoming", "green", "2026-03-17", "2026-04-04", "", "", ["c1-19"]),
        mkL1("c1-21", "Wave 3 rollout (Frontend + Mobile)",       "upcoming", "green", "2026-03-31", "2026-04-11", "", "", ["c1-20"]),
        mkL1("c1-22", "Training sessions (4 cohorts)",            "upcoming", "green", "2026-03-10", "2026-04-18", "", "", ["c1-19"]),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-04-07", endDate: "2026-04-30", notes: "", pathToGreen: "", children: [
        mkL1("c1-23", "Legacy read-only period", "upcoming", "green", "2026-04-07", "2026-04-21", "", "", ["c1-21"]),
        mkL1("c1-24", "Artifactory shutdown",    "upcoming", "green", "2026-04-21", "2026-04-28", "", "", ["c1-23"]),
        mkL1("c1-25", "Post-migration audit",    "upcoming", "green", "2026-04-25", "2026-04-30", "", "", ["c1-24"]),
      ]},
    ],
    transcripts: [
      { id: "t1", date: "2025-07-03", title: "Kickoff Call",            summary: "Discussed timeline, key stakeholders, and success metrics. Jamie wants full migration within 9 months. 12 engineering teams to onboard.", text: "Full transcript of kickoff call..." },
      { id: "t2", date: "2025-09-18", title: "Configuration Review",    summary: "SSO integration started. Repository structure agreed — mono-repo per team. Discussed upstream proxy requirements for air-gapped dev environments.", text: "Full transcript of configuration review..." },
      { id: "t3", date: "2026-01-22", title: "Migration Progress Review", summary: "npm and Docker migrations complete. Maven in progress. Jenkins pipeline rewiring blocked on infra team credentials — escalation needed.", text: "Full transcript of migration review..." },
      { id: "t4", date: "2026-03-06", title: "CI/CD Check-in",          summary: "GitHub Actions pipelines complete. Jenkins integration has dependency on their infra team's availability. Targeting end of March.", text: "Full transcript of CI/CD check-in..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r1-1", type: "Issue",      title: "Jenkins credentials blocked by infra team", severity: "High",   status: "Open",      linkedMilestone: "c1-18", owner: "Jamie Chen", description: "Infra team has not provisioned Jenkins service account credentials. Blocking CI/CD pipeline rewiring for all Jenkins-based teams.", mitigation: "Escalate to VP Eng. Fallback: migrate Jenkins pipelines to GitHub Actions.", createdDate: "2026-01-28" },
      { id: "r1-2", type: "Risk",       title: "Air-gapped environment proxy latency",       severity: "Medium", status: "Mitigated",  linkedMilestone: "c1-10", owner: "You",        description: "Upstream proxy configuration in air-gapped environments may introduce latency for Docker image pulls.", mitigation: "Configured regional cache nodes. Monitoring latency during pilot rollout.", createdDate: "2025-10-15" },
      { id: "r1-3", type: "Dependency", title: "Helm chart migration requires K8s 1.28+",   severity: "Medium", status: "Open",       linkedMilestone: "c1-17", owner: "Jamie Chen", description: "Helm chart migration tooling requires Kubernetes 1.28 or higher. Two teams are on 1.26.", mitigation: "K8s upgrade scheduled for March. If delayed, manual chart migration as fallback.", createdDate: "2026-02-10" },
      { id: "r1-4", type: "Risk",       title: "Training capacity for 4 cohorts",            severity: "Low",    status: "Open",       linkedMilestone: "c1-22", owner: "You",        description: "Scheduling 4 training cohorts across 12 teams may conflict with Q2 sprint commitments.", mitigation: "Pre-book training slots in March. Offer async self-serve option as alternative.", createdDate: "2026-02-20" },
    ],
  },
  {
    id: "c2", name: "NovaTech", logo: "NT", tier: "Ultra",
    complexity: "S", industry: "Technology",
    startDate: "2025-10-06", targetDate: "2026-06-30",
    baselineCompletion: "2026-06-30", forecastCompletion: "2026-06-30",
    onboardingManager: "You", owner: "You",
    stakeholder: "Sam Rivera (DevOps Lead)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-10-06", endDate: "2025-10-17", notes: "Small team, fast-moving", pathToGreen: "", children: [
        mkL1("c2-1", "Kickoff & goals alignment",  "complete", "blue", "2025-10-06", "2025-10-10"),
        mkL1("c2-2", "Success criteria & timeline","complete", "blue", "2025-10-10", "2025-10-17"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-10-20", endDate: "2025-11-21", notes: "Lean stack, straightforward", pathToGreen: "", children: [
        mkL1("c2-3", "Tooling audit",                    "complete", "blue", "2025-10-20", "2025-11-07", "Just npm + Docker currently"),
        mkL1("c2-4", "Workflow & permissions mapping",   "complete", "blue", "2025-11-03", "2025-11-21"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-11-24", endDate: "2026-01-17", notes: "30 repos configured", pathToGreen: "", children: [
        mkL1("c2-5", "Repo setup & structure",          "complete", "blue", "2025-11-24", "2025-12-12"),
        mkL1("c2-6", "API token provisioning",          "complete", "blue", "2025-12-08", "2025-12-19"),
        mkL1("c2-7", "Webhook & notification config",   "complete", "blue", "2026-01-06", "2026-01-17"),
      ]},
      { ...DEFAULT_L0[3], status: "in-progress", rag: "green", startDate: "2026-01-13", endDate: "2026-04-11", notes: "npm done, Docker in progress", pathToGreen: "", children: [
        mkL1("c2-8",  "npm package migration",  "complete",    "blue", "2026-01-13", "2026-02-14"),
        mkL1("c2-9",  "Docker image migration", "in-progress", "green", "2026-02-10", "2026-03-21", "60/95 images migrated"),
        mkL1("c2-10", "CI/CD pipeline updates", "upcoming",    "green", "2026-03-10", "2026-04-11"),
      ]},
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-04-06", endDate: "2026-06-06", notes: "", pathToGreen: "", children: [
        mkL1("c2-11", "Pilot rollout (DevOps team)",    "upcoming", "green", "2026-04-06", "2026-04-24"),
        mkL1("c2-12", "Full engineering rollout",        "upcoming", "green", "2026-04-21", "2026-05-16"),
        mkL1("c2-13", "Training & documentation",        "upcoming", "green", "2026-05-05", "2026-06-06"),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-05-25", endDate: "2026-06-30", notes: "", pathToGreen: "", children: [
        mkL1("c2-14", "Legacy registry read-only", "upcoming", "green", "2026-05-25", "2026-06-13"),
        mkL1("c2-15", "Legacy registry shutdown",  "upcoming", "green", "2026-06-13", "2026-06-30"),
      ]},
    ],
    transcripts: [
      { id: "t5", date: "2025-10-08", title: "Kickoff",           summary: "Lean team of 15 engineers, want smooth 9-month onboarding. Focused on npm and Docker registries. No legacy complexity.", text: "Full transcript..." },
      { id: "t6", date: "2026-02-12", title: "Migration Check-in", summary: "npm migration complete ahead of schedule. Docker migration started, straightforward so far. Discussed CI/CD pipeline update approach.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r2-1", type: "Dependency", title: "Docker registry DNS cutover requires ops window", severity: "Low", status: "Open", linkedMilestone: "c2-9", owner: "Sam Rivera", description: "DNS cutover from old registry to Cloudsmith requires a maintenance window agreed with ops.", mitigation: "Ops team aware. Targeting a weekend window in late March.", createdDate: "2026-02-15" },
    ],
  },
  {
    id: "c3", name: "FinanceFlow", logo: "FF", tier: "Strategic",
    complexity: "XXL", industry: "Financial Services",
    startDate: "2025-04-14", targetDate: "2026-04-14",
    baselineCompletion: "2026-02-28", forecastCompletion: "2026-05-09",
    onboardingManager: "Sarah K", owner: "You",
    stakeholder: "Dr. Priya Patel (CTO)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-04-14", endDate: "2025-05-02", notes: "Extensive compliance requirements identified early", pathToGreen: "", children: [
        mkL1("c3-1", "Kickoff & exec alignment",         "complete", "blue", "2025-04-14", "2025-04-18"),
        mkL1("c3-2", "Compliance requirements scoping",  "complete", "blue", "2025-04-18", "2025-05-02", "SOC2 + HIPAA + FCA regulatory"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-05-05", endDate: "2025-07-25", notes: "Extended discovery due to regulatory requirements", pathToGreen: "", children: [
        mkL1("c3-3", "Security requirements deep-dive",    "complete", "blue", "2025-05-05", "2025-06-06", "SOC2 + HIPAA + data residency"),
        mkL1("c3-4", "Current tooling & workflow audit",   "complete", "blue", "2025-05-19", "2025-06-20"),
        mkL1("c3-5", "Regulatory review & legal sign-off", "complete", "blue", "2025-06-16", "2025-07-25", "FCA data handling approval"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-07-28", endDate: "2025-10-31", notes: "Complex SSO with multi-factor", pathToGreen: "", children: [
        mkL1("c3-6", "SSO / SAML with MFA",                  "complete", "blue", "2025-07-28", "2025-08-29"),
        mkL1("c3-7", "Repository & permissions structure",    "complete", "blue", "2025-08-18", "2025-09-19"),
        mkL1("c3-8", "Data residency configuration",         "complete", "blue", "2025-09-15", "2025-10-10", "EU-only storage confirmed"),
        mkL1("c3-9", "Audit logging & compliance hooks",     "complete", "blue", "2025-10-06", "2025-10-31"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "blue", startDate: "2025-10-20", endDate: "2026-01-24", notes: "Migration validated against compliance controls", pathToGreen: "", children: [
        mkL1("c3-10", "Maven artifact migration",                       "complete", "blue", "2025-10-20", "2025-11-28"),
        mkL1("c3-11", "Docker image migration",                         "complete", "blue", "2025-11-17", "2025-12-19"),
        mkL1("c3-12", "Compliance validation of migrated artifacts",    "complete", "blue", "2026-01-06", "2026-01-24"),
      ]},
      { ...DEFAULT_L0[4], status: "in-progress", rag: "red", startDate: "2026-01-12", endDate: "2026-04-25", notes: "Compliance team training repeatedly delayed", pathToGreen: "1) Reschedule compliance training for w/c Mar 17 — CTO to mandate attendance. 2) Run parallel UAT with pilot team. 3) Weekly exec check-in until resolved.", children: [
        mkL1("c3-13", "Pilot team go-live",         "complete",    "blue",  "2026-01-12", "2026-02-14"),
        mkL1("c3-14", "Compliance team training",   "in-progress", "red",   "2026-02-10", "2026-03-28", "Delayed 3 times — team availability", "CTO to mandate dedicated 2-day training block, no exceptions", ["c3-13"]),
        mkL1("c3-15", "Trading systems team rollout","upcoming",   "amber", "2026-03-03", "2026-04-04", "Blocked by compliance training completion", "Can begin in parallel if compliance sign-off obtained on core controls", ["c3-14"]),
        mkL1("c3-16", "Full org rollout",            "upcoming",   "red",   "2026-03-24", "2026-04-25", "Blocked by upstream phases", "Cannot start until compliance and trading teams are live", ["c3-14", "c3-15"]),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "amber", startDate: "2026-04-14", endDate: "2026-05-09", notes: "Will miss original Feb 28 target — now targeting May", pathToGreen: "Contingency: extend legacy access by 6 weeks while rollout completes. Negotiate with Artifactory vendor for short-term extension.", children: [
        mkL1("c3-17", "Legacy read-only period", "upcoming", "amber", "2026-04-14", "2026-04-28", "", "", ["c3-16"]),
        mkL1("c3-18", "Legacy system shutdown",  "upcoming", "amber", "2026-04-28", "2026-05-09", "", "", ["c3-17"]),
      ]},
    ],
    transcripts: [
      { id: "t7",  date: "2025-04-16", title: "Kickoff Call",           summary: "Extensive compliance requirements — SOC2, HIPAA, FCA regulatory. Dr. Patel emphasised data residency as non-negotiable. Expect longer discovery phase.", text: "Full transcript..." },
      { id: "t8",  date: "2025-07-02", title: "Regulatory Review",      summary: "FCA data handling approval obtained after 6-week review. Legal sign-off expected by end of July. Can proceed with configuration.", text: "Full transcript..." },
      { id: "t9",  date: "2025-12-04", title: "Migration Status",       summary: "Maven and Docker migrations progressing well. Compliance validation to begin January. Discussed rollout sequencing — pilot team first, then compliance, then trading.", text: "Full transcript..." },
      { id: "t10", date: "2026-02-19", title: "Rollout Blocker Review", summary: "Compliance team training cancelled for third time due to team availability. CTO agreed to mandate attendance. Revised timeline pushes go-live to late April.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r3-1", type: "Issue",      title: "Compliance team training cancelled 3 times",  severity: "Critical", status: "Open",   linkedMilestone: "c3-14", owner: "Dr. Priya Patel", description: "Compliance team training has been cancelled three times due to team availability.", mitigation: "CTO to mandate a dedicated 2-day training block. Fallback: 1:1 training for compliance leads only.", createdDate: "2026-02-19" },
      { id: "r3-2", type: "Risk",       title: "Artifactory licence extension may be denied", severity: "High",     status: "Open",   linkedMilestone: "c3-17", owner: "Sarah K",         description: "Current Artifactory licence expires end of April. If rollout slips further, we need an extension.", mitigation: "Pre-negotiate 6-week extension now.", createdDate: "2026-03-01" },
      { id: "r3-3", type: "Dependency", title: "Trading systems team availability",           severity: "High",     status: "Open",   linkedMilestone: "c3-15", owner: "Dr. Priya Patel", description: "Trading systems team rollout depends on compliance training completion.", mitigation: "Run in parallel once core compliance controls are signed off.", createdDate: "2026-02-25" },
      { id: "r3-4", type: "Risk",       title: "FCA audit scheduled for May",                 severity: "Medium",   status: "Open",   linkedMilestone: null,    owner: "Sarah K",         description: "FCA regulatory audit is scheduled for May 2026.", mitigation: "Prioritise compliance validation artifacts.", createdDate: "2025-11-10" },
      { id: "r3-5", type: "Issue",      title: "Data residency documentation gap",            severity: "Medium",   status: "Closed", linkedMilestone: "c3-8",  owner: "Sarah K",         description: "Data residency configuration lacked documentation required for FCA audit trail.", mitigation: "Documentation completed and reviewed by legal team.", createdDate: "2025-09-20" },
    ],
  },
  {
    id: "c4", name: "DataStream Inc", logo: "DS", tier: "Enterprise",
    complexity: "M", industry: "Data & Analytics",
    startDate: "2025-11-03", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Alex M", owner: "Alex M",
    stakeholder: "Raj Mehta (Platform Lead)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete",    rag: "blue",  startDate: "2025-11-03", endDate: "2025-11-14", notes: "Smooth kickoff",  pathToGreen: "", children: [
        mkL1("c4-1", "Kickoff & goals alignment",  "complete", "blue", "2025-11-03", "2025-11-07"),
        mkL1("c4-2", "Success criteria sign-off",  "complete", "blue", "2025-11-07", "2025-11-14"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "green", startDate: "2025-11-17", endDate: "2026-01-30", notes: "Audit underway",   pathToGreen: "", children: [
        mkL1("c4-3", "Tooling & pipeline audit",  "complete",    "blue",  "2025-11-17", "2025-12-12"),
        mkL1("c4-4", "Security & access review",  "in-progress", "green", "2025-12-09", "2026-01-16"),
        mkL1("c4-5", "Network requirements",      "upcoming",    "green", "2026-01-13", "2026-01-30"),
      ]},
      { ...DEFAULT_L0[2], status: "upcoming", rag: "green", startDate: "2026-02-02", endDate: "2026-03-20", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-03-16", endDate: "2026-05-08", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-04-27", endDate: "2026-06-12", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-06-01", endDate: "2026-06-27", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t11", date: "2025-11-05", title: "Kickoff Call", summary: "Small data platform team of 8. Primary registries are Maven and Python. Targeting 8-month onboarding with minimal disruption.", text: "Full transcript..." },
    ],
    weeklyUpdates: [], rids: [],
  },
  {
    id: "c5", name: "MegaCorp", logo: "MC", tier: "Strategic",
    complexity: "XXL", industry: "Retail",
    startDate: "2025-09-08", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Sarah K", owner: "Sarah K",
    stakeholder: "Linda Park (SVP Engineering)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete",    rag: "blue",  startDate: "2025-09-08", endDate: "2025-09-26", notes: "50+ teams, complex org structure", pathToGreen: "", children: [
        mkL1("c5-1", "Exec alignment & charter",   "complete", "blue", "2025-09-08", "2025-09-15"),
        mkL1("c5-2", "Org mapping & team inventory","complete", "blue", "2025-09-15", "2025-09-26", "52 engineering teams identified"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "amber", startDate: "2025-09-29", endDate: "2026-02-27", notes: "Multi-region, legacy Nexus + JFrog", pathToGreen: "Prioritise highest-traffic registries first. Dedicated discovery sprint with infra leads.", children: [
        mkL1("c5-3", "Current state tooling audit",     "complete",    "blue",  "2025-09-29", "2025-11-07", "Nexus, JFrog, and 3 homegrown registries"),
        mkL1("c5-4", "Multi-region network assessment", "complete",    "blue",  "2025-10-20", "2025-12-05"),
        mkL1("c5-5", "Compliance & security scoping",   "in-progress", "amber", "2025-11-24", "2026-01-30", "SOC2 + ISO27001 requirements"),
        mkL1("c5-6", "Legacy migration path planning",  "in-progress", "amber", "2026-01-05", "2026-02-27", "Nexus → Cloudsmith migration plan"),
      ]},
      { ...DEFAULT_L0[2], status: "upcoming", rag: "green", startDate: "2026-02-16", endDate: "2026-05-08", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-04-20", endDate: "2026-09-11", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-08-17", endDate: "2026-11-06", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-10-26", endDate: "2026-12-18", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t12", date: "2025-09-10", title: "Kickoff",          summary: "52 engineering teams across 3 regions. Mix of Nexus, JFrog, and internal registries. Estimated 15-month onboarding.", text: "Full transcript..." },
      { id: "t13", date: "2025-12-03", title: "Discovery Review", summary: "Audit revealed 3 undocumented internal registries. SOC2 compliance requirements more complex than anticipated. Discovery phase extended by 6 weeks.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r5-1", type: "Risk", title: "Undocumented internal registries", severity: "High", status: "Open", linkedMilestone: "c5-3", owner: "Linda Park", description: "3 internal registries discovered post-kickoff not included in original scope.", mitigation: "Extended discovery sprint to map all registries. Updated scope document sent to Linda.", createdDate: "2025-11-10" },
    ],
  },
  {
    id: "c6", name: "Vertex Cloud", logo: "VC", tier: "Enterprise",
    complexity: "L", industry: "Cloud Infrastructure",
    startDate: "2025-12-01", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "You", owner: "You",
    stakeholder: "Chris Ng (Head of Infra)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue",  startDate: "2025-12-01", endDate: "2025-12-12", notes: "Fast alignment", pathToGreen: "", children: [
        mkL1("c6-1", "Kickoff & charter",            "complete", "blue", "2025-12-01", "2025-12-08"),
        mkL1("c6-2", "Success metrics definition",   "complete", "blue", "2025-12-08", "2025-12-12"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue",  startDate: "2025-12-15", endDate: "2026-01-23", notes: "Mostly Docker + Helm", pathToGreen: "", children: [
        mkL1("c6-3", "Tooling audit",                "complete", "blue", "2025-12-15", "2026-01-02"),
        mkL1("c6-4", "Access & permissions review",  "complete", "blue", "2025-12-29", "2026-01-23"),
      ]},
      { ...DEFAULT_L0[2], status: "in-progress", rag: "green", startDate: "2026-01-26", endDate: "2026-03-20", notes: "SSO configured, repos in progress", pathToGreen: "", children: [
        mkL1("c6-5", "SSO & SAML setup",                 "complete",    "blue",  "2026-01-26", "2026-02-06"),
        mkL1("c6-6", "Repository structure & naming",    "complete",    "blue",  "2026-02-03", "2026-02-20"),
        mkL1("c6-7", "Upstream proxy config",            "in-progress", "green", "2026-02-17", "2026-03-06"),
        mkL1("c6-8", "Scanning & policy setup",          "upcoming",    "green", "2026-03-02", "2026-03-20"),
      ]},
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-03-16", endDate: "2026-05-01", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-04-20", endDate: "2026-06-05", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-05-25", endDate: "2026-06-26", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t14", date: "2025-12-03", title: "Kickoff", summary: "Cloud-native team, 20 engineers. Primarily Docker and Helm. Chris wants minimal disruption — phased migration preferred.", text: "Full transcript..." },
    ],
    weeklyUpdates: [], rids: [],
  },
  {
    id: "c7", name: "Synapse AI", logo: "SA", tier: "Strategic",
    complexity: "XL", industry: "Artificial Intelligence",
    startDate: "2026-01-19", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Tom B", owner: "Tom B",
    stakeholder: "Maya Osei (CTO)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete",    rag: "blue",  startDate: "2026-01-19", endDate: "2026-01-30", notes: "Strong exec buy-in", pathToGreen: "", children: [
        mkL1("c7-1", "Kickoff & stakeholder mapping", "complete", "blue", "2026-01-19", "2026-01-23"),
        mkL1("c7-2", "Charter & success criteria",    "complete", "blue", "2026-01-23", "2026-01-30"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "amber", startDate: "2026-02-02", endDate: "2026-04-17", notes: "GPU artifact registries add complexity", pathToGreen: "Engage specialist to review GPU image registry requirements.", children: [
        mkL1("c7-3", "ML model registry audit",      "complete",    "blue",  "2026-02-02", "2026-02-20", "HuggingFace + internal registry"),
        mkL1("c7-4", "GPU image registry scoping",   "in-progress", "amber", "2026-02-17", "2026-03-27", "Novel requirement — no existing pattern"),
        mkL1("c7-5", "Data pipeline tooling audit",  "upcoming",    "green", "2026-03-16", "2026-04-17"),
      ]},
      { ...DEFAULT_L0[2], status: "upcoming", rag: "green", startDate: "2026-04-13", endDate: "2026-06-12", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-06-01", endDate: "2026-08-28", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-08-17", endDate: "2026-10-09", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-09-28", endDate: "2026-10-30", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t15", date: "2026-01-21", title: "Kickoff", summary: "ML-first company with custom GPU image registry requirements. Maya wants Cloudsmith as the single source of truth for all model artefacts.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r7-1", type: "Risk", title: "GPU image registry — no existing pattern", severity: "High", status: "Open", linkedMilestone: "c7-4", owner: "Tom B", description: "Synapse uses custom GPU base images not supported by standard registry patterns.", mitigation: "Engaging Cloudsmith solutions engineering for specialist support.", createdDate: "2026-02-20" },
    ],
  },
  {
    id: "c8", name: "ByteForge", logo: "BF", tier: "Ultra",
    complexity: "S", industry: "Developer Tools",
    startDate: "2025-08-04", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Alex M", owner: "Alex M",
    stakeholder: "Jake Lim (Lead Eng)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-08-04", endDate: "2025-08-08", notes: "", pathToGreen: "", children: [
        mkL1("c8-1", "Kickoff", "complete", "blue", "2025-08-04", "2025-08-08"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-08-11", endDate: "2025-08-29", notes: "Simple npm-only stack", pathToGreen: "", children: [
        mkL1("c8-2", "Tooling audit",  "complete", "blue", "2025-08-11", "2025-08-22"),
        mkL1("c8-3", "Access review",  "complete", "blue", "2025-08-22", "2025-08-29"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-09-01", endDate: "2025-09-19", notes: "", pathToGreen: "", children: [
        mkL1("c8-4", "Repo setup",          "complete", "blue", "2025-09-01", "2025-09-12"),
        mkL1("c8-5", "Token provisioning",  "complete", "blue", "2025-09-12", "2025-09-19"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "blue", startDate: "2025-09-22", endDate: "2025-10-17", notes: "", pathToGreen: "", children: [
        mkL1("c8-6", "npm package migration",  "complete", "blue", "2025-09-22", "2025-10-10"),
        mkL1("c8-7", "CI/CD pipeline update",  "complete", "blue", "2025-10-06", "2025-10-17"),
      ]},
      { ...DEFAULT_L0[4], status: "in-progress", rag: "green", startDate: "2025-10-20", endDate: "2025-11-07", notes: "", pathToGreen: "", children: [
        mkL1("c8-8", "Team rollout (4 engineers)", "complete",    "green", "2025-10-20", "2025-10-31"),
        mkL1("c8-9", "Final validation",           "in-progress", "green", "2025-11-03", "2025-11-07"),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2025-11-10", endDate: "2025-11-21", notes: "", pathToGreen: "", children: [
        mkL1("c8-10", "Legacy registry shutdown", "upcoming", "green", "2025-11-10", "2025-11-21"),
      ]},
    ],
    transcripts: [
      { id: "t16", date: "2025-08-06", title: "Kickoff", summary: "4-person startup, npm-only. Straightforward migration expected within 4 months.", text: "Full transcript..." },
    ],
    weeklyUpdates: [], rids: [],
  },
  {
    id: "c9", name: "PeakSystems", logo: "PS", tier: "Enterprise",
    complexity: "M", industry: "Telecommunications",
    startDate: "2025-02-10", targetDate: "2025-10-31",
    baselineCompletion: "2025-10-31", forecastCompletion: "2025-10-24",
    onboardingManager: "Tom B", owner: "Tom B",
    stakeholder: "Anna Kovacs (VP Platform)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-02-10", endDate: "2025-02-21", notes: "Clean kickoff, clear goals", pathToGreen: "", children: [
        mkL1("c9-1", "Kickoff & stakeholder alignment",      "complete", "blue", "2025-02-10", "2025-02-14"),
        mkL1("c9-2", "Success criteria & charter sign-off",  "complete", "blue", "2025-02-14", "2025-02-21"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-02-24", endDate: "2025-04-04", notes: "Straightforward stack — npm, Docker, Helm", pathToGreen: "", children: [
        mkL1("c9-3", "Tooling & pipeline audit",     "complete", "blue", "2025-02-24", "2025-03-14"),
        mkL1("c9-4", "Access & permissions review",  "complete", "blue", "2025-03-10", "2025-03-28"),
        mkL1("c9-5", "Network & firewall assessment","complete", "blue", "2025-03-24", "2025-04-04"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-04-07", endDate: "2025-05-30", notes: "SSO via Okta, 18 repos configured", pathToGreen: "", children: [
        mkL1("c9-6", "SSO / SAML setup (Okta)",              "complete", "blue", "2025-04-07", "2025-04-25"),
        mkL1("c9-7", "Repository structure design",          "complete", "blue", "2025-04-21", "2025-05-09"),
        mkL1("c9-8", "Upstream proxy & retention policies",  "complete", "blue", "2025-05-05", "2025-05-23"),
        mkL1("c9-9", "Vulnerability scanning setup",         "complete", "blue", "2025-05-19", "2025-05-30"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "blue", startDate: "2025-06-02", endDate: "2025-08-08", notes: "Completed ahead of schedule", pathToGreen: "", children: [
        mkL1("c9-10", "npm package migration (85 packages)", "complete", "blue", "2025-06-02", "2025-06-27"),
        mkL1("c9-11", "Docker image migration (42 images)",  "complete", "blue", "2025-06-23", "2025-07-18"),
        mkL1("c9-12", "Helm chart migration",                "complete", "blue", "2025-07-14", "2025-08-01"),
        mkL1("c9-13", "CI/CD pipeline rewiring",             "complete", "blue", "2025-07-28", "2025-08-08"),
      ]},
      { ...DEFAULT_L0[4], status: "complete", rag: "blue", startDate: "2025-08-11", endDate: "2025-09-26", notes: "Smooth rollout, no blockers", pathToGreen: "", children: [
        mkL1("c9-14", "Pilot team rollout (Platform team)", "complete", "blue", "2025-08-11", "2025-08-29"),
        mkL1("c9-15", "Full engineering rollout (3 teams)", "complete", "blue", "2025-08-25", "2025-09-19"),
        mkL1("c9-16", "Training sessions",                  "complete", "blue", "2025-09-08", "2025-09-26"),
      ]},
      { ...DEFAULT_L0[5], status: "complete", rag: "blue", startDate: "2025-09-29", endDate: "2025-10-24", notes: "Completed 7 days early", pathToGreen: "", children: [
        mkL1("c9-17", "Legacy registry read-only period",    "complete", "blue", "2025-09-29", "2025-10-17"),
        mkL1("c9-18", "Legacy registry shutdown",            "complete", "blue", "2025-10-13", "2025-10-24"),
        mkL1("c9-19", "Post-migration audit & sign-off",     "complete", "blue", "2025-10-20", "2025-10-24"),
      ]},
    ],
    transcripts: [
      { id: "t17", date: "2025-02-12", title: "Kickoff",                   summary: "18-engineer platform team. npm, Docker and Helm registries. Anna wants zero downtime migration. Targeting 9 months.", text: "Full kickoff transcript..." },
      { id: "t18", date: "2025-07-15", title: "Migration Midpoint Review", summary: "npm and Docker ahead of schedule. Helm in progress. CI/CD pipeline rewiring straightforward — no legacy tooling complications.", text: "Full transcript..." },
      { id: "t19", date: "2025-10-22", title: "Completion Sign-off",       summary: "All phases complete. Legacy registry shut down on 24 Oct — 7 days ahead of target. Anna confirmed full team on Cloudsmith.", text: "Full transcript..." },
    ],
    weeklyUpdates: [
      { id: "u9-1", date: "2025-10-24", milestoneSnapshot: [
        { label: "Kickoff",            status: "complete", rag: "blue", endDate: "2025-02-21" },
        { label: "Discovery",          status: "complete", rag: "blue", endDate: "2025-04-04" },
        { label: "Configuration",      status: "complete", rag: "blue", endDate: "2025-05-30" },
        { label: "Artifact Migration", status: "complete", rag: "blue", endDate: "2025-08-08" },
        { label: "Rollout",            status: "complete", rag: "blue", endDate: "2025-09-26" },
        { label: "Decommission",       status: "complete", rag: "blue", endDate: "2025-10-24" },
      ], context: "Onboarding complete. All 6 phases delivered on or ahead of schedule. Legacy Artifactory instance shut down 24 Oct — 7 days early. Post-migration audit passed with no issues. Anna Kovacs confirmed full sign-off." },
    ],
    rids: [],
  },
];

// ─── RAG / status derivation ─────────────────────────────────────────────────

/** Derive the RAG status for an L0 phase from its L1 children. */
export function deriveL0Rag(children, fallback) {
  if (!children.length) return fallback;
  if (children.some(c => c.rag === "red"))   return "red";
  if (children.some(c => c.rag === "amber")) return "amber";
  if (children.some(c => c.rag === "green")) return "green";
  return "blue";
}

/** Derive the status for an L0 phase from its L1 children. */
export function deriveL0Status(children, fallback) {
  if (!children.length) return fallback;
  if (children.every(c => c.status === "complete")) return "complete";
  if (children.some(c => c.status === "in-progress" || c.status === "complete")) return "in-progress";
  return "upcoming";
}

/** Derive the overall RAG for a customer from all their L0 phases. */
export function deriveCustomerRag(milestones) {
  const active = milestones.filter(m => !m.isNA);
  if (!active.length) return "blue";
  if (active.some(m => m.rag === "red"   || m.children.some(c => c.rag === "red")))   return "red";
  if (active.some(m => m.rag === "amber" || m.children.some(c => c.rag === "amber"))) return "amber";
  if (active.some(m => m.rag === "green" || m.children.some(c => c.rag === "green"))) return "green";
  return "blue";
}

// ─── Syncing ──────────────────────────────────────────────────────────────────

/**
 * Re-derive an L0 phase's status, RAG, and date span from its children.
 * Returns the updated L0 object (does not mutate).
 */
export function syncL0(l0) {
  if (l0.isNA || !l0.children || !l0.children.length) return l0;
  let minStart = null, maxEnd = null;
  l0.children.forEach(c => {
    if (c.startDate && (!minStart || new Date(c.startDate) < new Date(minStart))) minStart = c.startDate;
    if (c.endDate   && (!maxEnd   || new Date(c.endDate)   > new Date(maxEnd)))   maxEnd   = c.endDate;
  });
  return {
    ...l0,
    status:    deriveL0Status(l0.children, l0.status),
    rag:       deriveL0Rag(l0.children, l0.rag),
    startDate: minStart || l0.startDate,
    endDate:   maxEnd   || l0.endDate,
  };
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/** Progress percentage (0-100) for a single L0 phase. */
export function getL0Progress(l0) {
  if (!l0.children.length) {
    return l0.status === "complete" ? 100 : l0.status === "in-progress" ? 50 : 0;
  }
  return Math.round((l0.children.filter(c => c.status === "complete").length / l0.children.length) * 100);
}

/** Overall progress percentage (0-100) across all active L0 phases. */
export function getTotalProgress(milestones) {
  const active = milestones.filter(m => !m.isNA);
  const all    = active.flatMap(l => l.children.length ? l.children : [l]);
  const done   = all.filter(i => i.status === "complete").length;
  return all.length ? Math.round((done / all.length) * 100) : 0;
}

// ─── Date / slip helpers ──────────────────────────────────────────────────────

/** Format a date string as "D Mon" (e.g. "7 Apr"). Returns "—" for null/undefined. */
export function fmtDate(d) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Format a date range. Returns "—" if both dates are absent. */
export function fmtRange(sd, ed) {
  if (!sd && !ed) return "\u2014";
  if (sd && ed)   return `${fmtDate(sd)} \u2013 ${fmtDate(ed)}`;
  return fmtDate(sd || ed);
}

/** Today's date as an ISO string (YYYY-MM-DD). */
export function today() {
  return new Date().toISOString().split("T")[0];
}

/** Slip in calendar days between baseline and forecast completion. */
export function getSlipDays(customer) {
  if (!customer.baselineCompletion || !customer.forecastCompletion) return 0;
  return Math.round(
    (new Date(customer.forecastCompletion) - new Date(customer.baselineCompletion)) / (24 * 60 * 60 * 1000),
  );
}

// ─── Status / RAG cycling ────────────────────────────────────────────────────

export function nextStatus(s) {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
}

export function nextRag(r) {
  return RAG_CYCLE[(RAG_CYCLE.indexOf(r) + 1) % RAG_CYCLE.length];
}

/** Returns a unicode symbol for a given status (no React dependency). */
export function statusIcon(status) {
  if (status === "complete")    return "\u2713";   // ✓
  if (status === "in-progress") return "\u25C9";   // ◉
  return "";
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────

export function getTierColor(label, tiers) {
  return (tiers.find(t => t.label === label) || {}).color || "#8b8fa3";
}

// ─── Dependency cascading ────────────────────────────────────────────────────

/**
 * When a milestone's endDate changes, shift all downstream dependents by the
 * same delta. Handles chains (A → B → C) through iterative passes.
 *
 * @param {object[]} milestones L0 array
 * @param {string}   changedId  ID of the L1 whose endDate changed
 * @param {string}   oldEndDate
 * @param {string}   newEndDate
 * @returns {object[]} updated milestones (no mutation)
 */
export function cascadeDependencies(milestones, changedId, oldEndDate, newEndDate) {
  if (!oldEndDate || !newEndDate || oldEndDate === newEndDate) return milestones;
  const delta = (new Date(newEndDate) - new Date(oldEndDate)) / (24 * 60 * 60 * 1000);
  if (delta === 0) return milestones;

  const shiftDate = (d, days) => {
    if (!d) return d;
    const dt = new Date(d);
    dt.setDate(dt.getDate() + days);
    return dt.toISOString().split("T")[0];
  };

  const shifted = new Set();

  const doShift = (ms, targetId, days) =>
    ms.map(l0 => ({
      ...l0,
      children: l0.children.map(l1 => {
        if ((l1.dependsOn || []).includes(targetId) && !shifted.has(l1.id)) {
          shifted.add(l1.id);
          return { ...l1, startDate: shiftDate(l1.startDate, days), endDate: shiftDate(l1.endDate, days) };
        }
        return l1;
      }),
    }));

  let result = doShift(milestones, changedId, delta);
  let prevSize = 0;
  while (shifted.size > prevSize) {
    prevSize = shifted.size;
    for (const id of [...shifted]) {
      result = doShift(result, id, delta);
    }
  }
  return result;
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Build a flat { id → label } map for all L1 milestones across all L0 phases. */
export function buildL1Lookup(milestones) {
  const map = {};
  milestones.forEach(l0 => l0.children.forEach(l1 => { map[l1.id] = l1.label; }));
  return map;
}

/** Get all L1 milestones (with phase label) except the one being edited. */
export function getAllL1Options(milestones, excludeId) {
  const opts = [];
  milestones.forEach(l0 => {
    l0.children.forEach(l1 => {
      if (l1.id !== excludeId) opts.push({ id: l1.id, label: l1.label, phase: l0.label });
    });
  });
  return opts;
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

/**
 * Copy an emoji-formatted milestone status update to the clipboard.
 * Returns the clipboard promise.
 */
export function copyStatusUpdate(customer) {
  const EMOJI = { blue: "🔵", green: "🟢", amber: "🟠", red: "🔴" };
  const fmtSlash = d => {
    if (!d) return "TBD";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };
  const statusLabel = s =>
    s === "complete" ? "Complete" : s === "in-progress" ? "In Progress" : "Not Started";

  const lines = customer.milestones
    .filter(l0 => !l0.isNA)
    .map(l0 => {
      const emoji = l0.status === "upcoming" ? "⚪" : (EMOJI[l0.rag] || "⚪");
      return `${emoji} ${l0.label} | ${statusLabel(l0.status)} | ${fmtSlash(l0.endDate)}`;
    });
  return navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
}

// ─── SVG / PNG export ─────────────────────────────────────────────────────────

/**
 * Generate a standalone SVG string representing a customer's Gantt chart.
 * Safe to call in a browser context only (uses Date, not server-safe).
 */
export function generateGanttSVG(customer) {
  const labelW = 220, chartLeft = 240, rightPad = 30, rowH = 32, l0RowH = 36, headerH = 60, footerH = 50;
  const ms = customer.milestones;
  const totalRows = ms.reduce((n, l0) => n + 1 + Math.max(l0.children.length, 0), 0);
  const chartH = headerH + totalRows * rowH + footerH + 20;
  const chartW = 960;
  const trackW = chartW - chartLeft - rightPad;

  const tStart = new Date(customer.startDate); tStart.setDate(tStart.getDate() - 7);
  const tEnd   = new Date(customer.targetDate); tEnd.setDate(tEnd.getDate() + 14);
  const span   = tEnd - tStart;
  const pct    = d => { if (!d) return null; return Math.max(0, Math.min(100, ((new Date(d) - tStart) / span) * 100)); };
  const todayPct   = pct(new Date());
  const totalWeeks = Math.max(1, Math.ceil(span / (7 * 24 * 60 * 60 * 1000)));

  const fDate  = d => { if (!d) return ""; return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };
  const escXml = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ragHex = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6" };
  const cRag   = deriveCustomerRag(ms);
  const progress = getTotalProgress(ms);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${chartW} ${chartH}" width="${chartW}" height="${chartH}" style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#0f1118">`;

  svg += `<text x="20" y="28" fill="#f0f1f5" font-size="16" font-weight="700">${escXml(customer.name)} \u2014 Onboarding Plan</text>`;
  svg += `<text x="20" y="46" fill="#6b7088" font-size="11">${escXml(customer.tier)} \u00b7 ${escXml(customer.stakeholder || "")} \u00b7 ${fDate(customer.startDate)} \u2192 ${fDate(customer.targetDate)} \u00b7 ${progress}% complete</text>`;
  svg += `<rect x="${chartW - 90}" y="14" width="70" height="22" rx="4" fill="${ragHex[cRag]}20"/><circle cx="${chartW - 80}" cy="25" r="4" fill="${ragHex[cRag]}"/><text x="${chartW - 72}" y="29" fill="${ragHex[cRag]}" font-size="11" font-weight="700">${cRag.toUpperCase()}</text>`;

  for (let w = 0; w < totalWeeks; w++) {
    const x = chartLeft + (w / totalWeeks) * trackW;
    svg += `<line x1="${x}" y1="${headerH - 8}" x2="${x}" y2="${chartH - footerH}" stroke="#1e2230" stroke-width="1"/>`;
    if (w % 2 === 0) {
      const d = new Date(tStart); d.setDate(d.getDate() + w * 7);
      svg += `<text x="${x + 2}" y="${headerH - 12}" fill="#464b5e" font-size="8.5" font-weight="500">${fDate(d)}</text>`;
    }
  }

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

    svg += `<rect x="0" y="${y}" width="${chartW}" height="${l0RowH}" fill="#10131b"/>`;
    svg += `<circle cx="18" cy="${y + l0RowH / 2}" r="4" fill="${ragHex[l0.rag]}"/>`;
    svg += `<rect x="28" y="${y + l0RowH / 2 - 8}" width="18" height="16" rx="3" fill="#1a1d28"/><text x="37" y="${y + l0RowH / 2 + 4}" fill="#464b5e" font-size="9" font-weight="700" text-anchor="middle">${l0i + 1}</text>`;
    svg += `<text x="52" y="${y + l0RowH / 2 + 4}" fill="#e2e4eb" font-size="12" font-weight="600">${escXml(l0.label)}</text>`;
    svg += `<text x="${labelW}" y="${y + l0RowH / 2 + 4}" fill="#8b8fa3" font-size="10">${prog}%</text>`;
    svg += `<rect x="${bx}" y="${y + 9}" width="${bw}" height="${l0RowH - 18}" rx="4" fill="${l0.color}" opacity="0.2"/>`;
    if (fw > 0) svg += `<rect x="${bx}" y="${y + 9}" width="${fw}" height="${l0RowH - 18}" rx="4" fill="${ragHex[l0.rag]}" opacity="0.55"/>`;
    if (l0.startDate || l0.endDate) {
      svg += `<text x="${bx + bw + 6}" y="${y + l0RowH / 2 + 3}" fill="#464b5e" font-size="8">${fDate(l0.startDate)} \u2013 ${fDate(l0.endDate)}</text>`;
    }
    y += l0RowH;

    l0.children.forEach(l1 => {
      const l1S = pct(l1.startDate), l1E = pct(l1.endDate);
      const hasL1 = l1S !== null && l1E !== null;
      const l1Left = hasL1 ? l1S : barL;
      const l1W    = hasL1 ? Math.max(1, l1E - l1S) : barW * 0.6;
      const lx = chartLeft + (l1Left / 100) * trackW;
      const lw = (l1W / 100) * trackW;
      const bColor = l1.status === "complete" ? "#565b6e" : ragHex[l1.rag];
      const bOp    = l1.status === "complete" ? 0.35 : l1.status === "upcoming" ? 0.2 : 0.7;
      const txtOp  = l1.status === "complete" ? 0.5 : 0.85;

      svg += `<circle cx="40" cy="${y + rowH / 2}" r="2.5" fill="${bColor}" opacity="${bOp + 0.2}"/>`;
      svg += `<text x="50" y="${y + rowH / 2 + 3.5}" fill="#c5c8d6" font-size="10.5" opacity="${txtOp}"${l1.status === "complete" ? ' text-decoration="line-through"' : ""}>${escXml(l1.label)}</text>`;
      svg += `<rect x="${lx}" y="${y + 9}" width="${lw}" height="${rowH - 18}" rx="3" fill="${bColor}" opacity="${bOp}"/>`;
      if (l1.startDate || l1.endDate) {
        svg += `<text x="${lx + lw + 5}" y="${y + rowH / 2 + 3}" fill="#464b5e" font-size="7.5">${fDate(l1.startDate)} \u2013 ${fDate(l1.endDate)}</text>`;
      }
      y += rowH;
    });

    if (l0.children.length === 0) y += 4;
  });

  const ly = chartH - footerH + 16;
  svg += `<line x1="20" y1="${ly - 8}" x2="${chartW - 20}" y2="${ly - 8}" stroke="#1e2230" stroke-width="1"/>`;
  const legendItems = [
    { color: ragHex.green, label: "Green" },
    { color: ragHex.amber, label: "Amber" },
    { color: ragHex.red,   label: "Red"   },
    { color: ragHex.blue,  label: "Blue (Complete)" },
  ];
  let lx = 20;
  legendItems.forEach(li => {
    svg += `<rect x="${lx}" y="${ly}" width="14" height="6" rx="2" fill="${li.color}" opacity="0.6"/>`;
    svg += `<text x="${lx + 18}" y="${ly + 6}" fill="#6b7088" font-size="9">${li.label}</text>`;
    lx += 70;
  });
  svg += `<line x1="${lx}" y1="${ly - 1}" x2="${lx}" y2="${ly + 8}" stroke="#ef4444" stroke-width="1.5" opacity="0.7"/>`;
  svg += `<text x="${lx + 6}" y="${ly + 6}" fill="#6b7088" font-size="9">Today</text>`;
  svg += `<text x="${chartW - 20}" y="${ly + 6}" fill="#3a3f52" font-size="8" text-anchor="end">Generated ${fDate(new Date())} \u00b7 Cloudsmith Onboarding Hub</text>`;
  svg += `</svg>`;
  return svg;
}

/** Trigger a file download in the browser. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export a customer's Gantt chart as an SVG file download. */
export function exportGanttSVG(customer) {
  const svg  = generateGanttSVG(customer);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadBlob(blob, `${customer.name.replace(/\s+/g, "-").toLowerCase()}-onboarding-plan.svg`);
}

/** Export a customer's Gantt chart as a PNG file download (2× retina scale). */
export function exportGanttPNG(customer) {
  const svg   = generateGanttSVG(customer);
  const scale = 2;
  const vbMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const svgW  = vbMatch ? parseInt(vbMatch[1]) : 960;
  const svgH  = vbMatch ? parseInt(vbMatch[2]) : 600;

  const canvas    = document.createElement("canvas");
  canvas.width    = svgW * scale;
  canvas.height   = svgH * scale;
  const ctx       = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const img        = new Image();
  img.crossOrigin  = "anonymous";
  const encoded    = btoa(unescape(encodeURIComponent(svg)));

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
    } catch {
      canvas.toBlob(blob => {
        if (blob) window.open(URL.createObjectURL(blob), "_blank");
      }, "image/png");
    }
  };

  img.onerror = () => exportGanttSVG(customer);
  img.src = `data:image/svg+xml;base64,${encoded}`;
}
