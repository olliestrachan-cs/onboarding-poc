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
  { id: "t1", label: "Strategic", color: "#a78bfa" },
  { id: "t2", label: "Enterprise", color: "#38bdf8" },
  { id: "t3", label: "Ultra", color: "#f59e0b" },
];

const DEFAULT_INDUSTRIES = [
  "Artificial Intelligence", "Cloud Infrastructure", "Data & Analytics",
  "Developer Tools", "Financial Services", "Healthcare", "Manufacturing",
  "Media & Entertainment", "Retail", "Telecommunications",
];

const DEFAULT_COMPLEXITY = [
  { key: "S",   capPct: 10, maxConcurrent: 6, hoursPerWeek: 4  },
  { key: "M",   capPct: 15, maxConcurrent: 6, hoursPerWeek: 6  },
  { key: "L",   capPct: 20, maxConcurrent: 5, hoursPerWeek: 8  },
  { key: "XL",  capPct: 20, maxConcurrent: 4, hoursPerWeek: 8  },
  { key: "XXL", capPct: 50, maxConcurrent: 3, hoursPerWeek: 16 },
];

const COMPLEXITY_KEYS = ["S","M","L","XL","XXL"];

const RAG_LABELS = { green: "Green", amber: "Amber", red: "Red", blue: "Blue" };
const RAG_COLORS = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6" };

function mkL1(id, label, status, rag, sd, ed, notes, ptg, deps) {
  return { id, label, status: status||"upcoming", rag: rag||"green", startDate: sd||null, endDate: ed||null, notes: notes||"", pathToGreen: ptg||"", dependsOn: deps||[] };
}

const RID_TYPES = ["Risk", "Issue", "Dependency"];
const RID_SEVERITIES = ["Low", "Medium", "High", "Critical"];
const RID_STATUSES = ["Open", "Mitigated", "Closed"];
const RID_SEV_COLORS = { Low: "#565b6e", Medium: "#f59e0b", High: "#ef4444", Critical: "#dc2626" };

function mkRid(id, type, title, severity, status, linkedMilestone, owner, description, mitigation) {
  return { id, type: type||"Risk", title, severity: severity||"Medium", status: status||"Open", linkedMilestone: linkedMilestone||null, owner: owner||"", description: description||"", mitigation: mitigation||"", createdDate: new Date().toISOString().split("T")[0] };
}

function mkCustomerMilestones(tmpl) {
  return tmpl.map(l0 => ({ ...l0, status: "upcoming", rag: "green", startDate: null, endDate: null, notes: "", pathToGreen: "", children: [] }));
}

// ─── Samples with realistic 6-12 month onboarding timelines ───
const SAMPLES = [
  {
    id: "c1", name: "Acme Corp", logo: "AC", tier: "Strategic",
    complexity: "XXL", industry: "Manufacturing",
    startDate: "2025-07-01", targetDate: "2026-04-30",
    baselineCompletion: "2026-03-31", forecastCompletion: "2026-04-30",
    onboardingManager: "You",
    owner: "You",
    stakeholder: "Jamie Chen (VP Eng)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-07-01", endDate: "2025-07-18", notes: "Strong alignment on goals", pathToGreen: "", children: [
        mkL1("c1-1", "Intro & stakeholder mapping", "complete", "blue", "2025-07-01", "2025-07-07"),
        mkL1("c1-2", "Define success criteria", "complete", "blue", "2025-07-07", "2025-07-14", "ARR protection + time-to-value targets"),
        mkL1("c1-3", "Onboarding charter sign-off", "complete", "blue", "2025-07-14", "2025-07-18"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-07-21", endDate: "2025-09-12", notes: "Full audit done", pathToGreen: "", children: [
        mkL1("c1-4", "Current tooling audit", "complete", "blue", "2025-07-21", "2025-08-08", "Artifactory + S3 buckets + legacy Nexus"),
        mkL1("c1-5", "Package format inventory", "complete", "blue", "2025-08-04", "2025-08-22", "npm, Docker, Maven, Helm, PyPI"),
        mkL1("c1-6", "Compliance & access review", "complete", "blue", "2025-08-18", "2025-09-05", "SOC2 requirements documented"),
        mkL1("c1-7", "Network & firewall assessment", "complete", "blue", "2025-08-25", "2025-09-12", "Egress rules for air-gapped environments"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "green", startDate: "2025-09-15", endDate: "2025-11-28", notes: "SSO + repos configured", pathToGreen: "", children: [
        mkL1("c1-8", "SSO / SAML setup", "complete", "green", "2025-09-15", "2025-10-03"),
        mkL1("c1-9", "Repository structure design", "complete", "green", "2025-09-22", "2025-10-17", "Mono-repo per team, 12 teams"),
        mkL1("c1-10", "Upstream proxy configuration", "complete", "green", "2025-10-13", "2025-11-07"),
        mkL1("c1-11", "Retention & cleanup policies", "complete", "green", "2025-10-27", "2025-11-14"),
        mkL1("c1-12", "Vulnerability scanning setup", "complete", "green", "2025-11-10", "2025-11-28"),
      ]},
      { ...DEFAULT_L0[3], status: "in-progress", rag: "amber", startDate: "2025-11-17", endDate: "2026-03-28", notes: "GitHub Actions done, Jenkins WIP", pathToGreen: "Need infra team to unblock Jenkins access by end of March. Escalation path via VP Eng.", children: [
        mkL1("c1-13", "npm migration (150 packages)", "complete", "green", "2025-11-17", "2025-12-19"),
        mkL1("c1-14", "Docker image migration", "complete", "green", "2025-12-01", "2026-01-16", "320 images migrated"),
        mkL1("c1-15", "Maven artifact migration", "in-progress", "green", "2026-01-06", "2026-03-07", "180/240 artifacts moved"),
        mkL1("c1-16", "PyPI package migration", "in-progress", "green", "2026-02-03", "2026-03-14"),
        mkL1("c1-17", "Helm chart migration", "upcoming", "green", "2026-03-03", "2026-03-21"),
        mkL1("c1-18", "CI/CD pipeline rewiring", "in-progress", "amber", "2026-01-20", "2026-03-28", "GH Actions done, Jenkins WIP", "Escalate to Acme infra team lead re: Jenkins credentials"),
      ]},
      // Rollout overlaps with tail of Artifact Migration
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-03-02", endDate: "2026-04-18", notes: "", pathToGreen: "", children: [
        mkL1("c1-19", "Pilot team rollout (Platform team)", "upcoming", "green", "2026-03-02", "2026-03-21"),
        mkL1("c1-20", "Wave 2 rollout (Backend teams)", "upcoming", "green", "2026-03-17", "2026-04-04", "", "", ["c1-19"]),
        mkL1("c1-21", "Wave 3 rollout (Frontend + Mobile)", "upcoming", "green", "2026-03-31", "2026-04-11", "", "", ["c1-20"]),
        mkL1("c1-22", "Training sessions (4 cohorts)", "upcoming", "green", "2026-03-10", "2026-04-18", "", "", ["c1-19"]),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-04-07", endDate: "2026-04-30", notes: "", pathToGreen: "", children: [
        mkL1("c1-23", "Legacy read-only period", "upcoming", "green", "2026-04-07", "2026-04-21", "", "", ["c1-21"]),
        mkL1("c1-24", "Artifactory shutdown", "upcoming", "green", "2026-04-21", "2026-04-28", "", "", ["c1-23"]),
        mkL1("c1-25", "Post-migration audit", "upcoming", "green", "2026-04-25", "2026-04-30", "", "", ["c1-24"]),
      ]},
    ],
    transcripts: [
      { id: "t1", date: "2025-07-03", title: "Kickoff Call", summary: "Discussed timeline, key stakeholders, and success metrics. Jamie wants full migration within 9 months. 12 engineering teams to onboard.", text: "Full transcript of kickoff call..." },
      { id: "t2", date: "2025-09-18", title: "Configuration Review", summary: "SSO integration started. Repository structure agreed — mono-repo per team. Discussed upstream proxy requirements for air-gapped dev environments.", text: "Full transcript of configuration review..." },
      { id: "t3", date: "2026-01-22", title: "Migration Progress Review", summary: "npm and Docker migrations complete. Maven in progress. Jenkins pipeline rewiring blocked on infra team credentials — escalation needed.", text: "Full transcript of migration review..." },
      { id: "t4", date: "2026-03-06", title: "CI/CD Check-in", summary: "GitHub Actions pipelines complete. Jenkins integration has dependency on their infra team's availability. Targeting end of March.", text: "Full transcript of CI/CD check-in..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r1-1", type: "Issue", title: "Jenkins credentials blocked by infra team", severity: "High", status: "Open", linkedMilestone: "c1-18", owner: "Jamie Chen", description: "Infra team has not provisioned Jenkins service account credentials. Blocking CI/CD pipeline rewiring for all Jenkins-based teams.", mitigation: "Escalate to VP Eng. Fallback: migrate Jenkins pipelines to GitHub Actions.", createdDate: "2026-01-28" },
      { id: "r1-2", type: "Risk", title: "Air-gapped environment proxy latency", severity: "Medium", status: "Mitigated", linkedMilestone: "c1-10", owner: "You", description: "Upstream proxy configuration in air-gapped environments may introduce latency for Docker image pulls.", mitigation: "Configured regional cache nodes. Monitoring latency during pilot rollout.", createdDate: "2025-10-15" },
      { id: "r1-3", type: "Dependency", title: "Helm chart migration requires K8s 1.28+", severity: "Medium", status: "Open", linkedMilestone: "c1-17", owner: "Jamie Chen", description: "Helm chart migration tooling requires Kubernetes 1.28 or higher. Two teams are on 1.26.", mitigation: "K8s upgrade scheduled for March. If delayed, manual chart migration as fallback.", createdDate: "2026-02-10" },
      { id: "r1-4", type: "Risk", title: "Training capacity for 4 cohorts", severity: "Low", status: "Open", linkedMilestone: "c1-22", owner: "You", description: "Scheduling 4 training cohorts across 12 teams may conflict with Q2 sprint commitments.", mitigation: "Pre-book training slots in March. Offer async self-serve option as alternative.", createdDate: "2026-02-20" },
    ],
  },
  {
    id: "c2", name: "NovaTech", logo: "NT", tier: "Ultra",
    complexity: "S", industry: "Technology",
    startDate: "2025-10-06", targetDate: "2026-06-30",
    baselineCompletion: "2026-06-30", forecastCompletion: "2026-06-30",
    onboardingManager: "You",
    owner: "You",
    stakeholder: "Sam Rivera (DevOps Lead)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-10-06", endDate: "2025-10-17", notes: "Small team, fast-moving", pathToGreen: "", children: [
        mkL1("c2-1", "Kickoff & goals alignment", "complete", "blue", "2025-10-06", "2025-10-10"),
        mkL1("c2-2", "Success criteria & timeline", "complete", "blue", "2025-10-10", "2025-10-17"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-10-20", endDate: "2025-11-21", notes: "Lean stack, straightforward", pathToGreen: "", children: [
        mkL1("c2-3", "Tooling audit", "complete", "blue", "2025-10-20", "2025-11-07", "Just npm + Docker currently"),
        mkL1("c2-4", "Workflow & permissions mapping", "complete", "blue", "2025-11-03", "2025-11-21"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "green", startDate: "2025-11-24", endDate: "2026-01-17", notes: "30 repos configured", pathToGreen: "", children: [
        mkL1("c2-5", "Repo setup & structure", "complete", "green", "2025-11-24", "2025-12-12"),
        mkL1("c2-6", "API token provisioning", "complete", "green", "2025-12-08", "2025-12-19"),
        mkL1("c2-7", "Webhook & notification config", "complete", "green", "2026-01-06", "2026-01-17"),
      ]},
      { ...DEFAULT_L0[3], status: "in-progress", rag: "green", startDate: "2026-01-13", endDate: "2026-04-11", notes: "npm done, Docker in progress", pathToGreen: "", children: [
        mkL1("c2-8", "npm package migration", "complete", "green", "2026-01-13", "2026-02-14"),
        mkL1("c2-9", "Docker image migration", "in-progress", "green", "2026-02-10", "2026-03-21", "60/95 images migrated"),
        mkL1("c2-10", "CI/CD pipeline updates", "upcoming", "green", "2026-03-10", "2026-04-11"),
      ]},
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-04-06", endDate: "2026-06-06", notes: "", pathToGreen: "", children: [
        mkL1("c2-11", "Pilot rollout (DevOps team)", "upcoming", "green", "2026-04-06", "2026-04-24"),
        mkL1("c2-12", "Full engineering rollout", "upcoming", "green", "2026-04-21", "2026-05-16"),
        mkL1("c2-13", "Training & documentation", "upcoming", "green", "2026-05-05", "2026-06-06"),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-05-25", endDate: "2026-06-30", notes: "", pathToGreen: "", children: [
        mkL1("c2-14", "Legacy registry read-only", "upcoming", "green", "2026-05-25", "2026-06-13"),
        mkL1("c2-15", "Legacy registry shutdown", "upcoming", "green", "2026-06-13", "2026-06-30"),
      ]},
    ],
    transcripts: [
      { id: "t5", date: "2025-10-08", title: "Kickoff", summary: "Lean team of 15 engineers, want smooth 9-month onboarding. Focused on npm and Docker registries. No legacy complexity.", text: "Full transcript..." },
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
    onboardingManager: "Sarah K",
    owner: "You",
    stakeholder: "Dr. Priya Patel (CTO)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-04-14", endDate: "2025-05-02", notes: "Extensive compliance requirements identified early", pathToGreen: "", children: [
        mkL1("c3-1", "Kickoff & exec alignment", "complete", "blue", "2025-04-14", "2025-04-18"),
        mkL1("c3-2", "Compliance requirements scoping", "complete", "blue", "2025-04-18", "2025-05-02", "SOC2 + HIPAA + FCA regulatory"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-05-05", endDate: "2025-07-25", notes: "Extended discovery due to regulatory requirements", pathToGreen: "", children: [
        mkL1("c3-3", "Security requirements deep-dive", "complete", "blue", "2025-05-05", "2025-06-06", "SOC2 + HIPAA + data residency"),
        mkL1("c3-4", "Current tooling & workflow audit", "complete", "blue", "2025-05-19", "2025-06-20"),
        mkL1("c3-5", "Regulatory review & legal sign-off", "complete", "blue", "2025-06-16", "2025-07-25", "FCA data handling approval"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "green", startDate: "2025-07-28", endDate: "2025-10-31", notes: "Complex SSO with multi-factor", pathToGreen: "", children: [
        mkL1("c3-6", "SSO / SAML with MFA", "complete", "green", "2025-07-28", "2025-08-29"),
        mkL1("c3-7", "Repository & permissions structure", "complete", "green", "2025-08-18", "2025-09-19"),
        mkL1("c3-8", "Data residency configuration", "complete", "green", "2025-09-15", "2025-10-10", "EU-only storage confirmed"),
        mkL1("c3-9", "Audit logging & compliance hooks", "complete", "green", "2025-10-06", "2025-10-31"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "green", startDate: "2025-10-20", endDate: "2026-01-24", notes: "Migration validated against compliance controls", pathToGreen: "", children: [
        mkL1("c3-10", "Maven artifact migration", "complete", "green", "2025-10-20", "2025-11-28"),
        mkL1("c3-11", "Docker image migration", "complete", "green", "2025-11-17", "2025-12-19"),
        mkL1("c3-12", "Compliance validation of migrated artifacts", "complete", "green", "2026-01-06", "2026-01-24"),
      ]},
      // Rollout is where things went wrong
      { ...DEFAULT_L0[4], status: "in-progress", rag: "red", startDate: "2026-01-12", endDate: "2026-04-25", notes: "Compliance team training repeatedly delayed", pathToGreen: "1) Reschedule compliance training for w/c Mar 17 — CTO to mandate attendance. 2) Run parallel UAT with pilot team. 3) Weekly exec check-in until resolved.", children: [
        mkL1("c3-13", "Pilot team go-live", "complete", "green", "2026-01-12", "2026-02-14"),
        mkL1("c3-14", "Compliance team training", "in-progress", "red", "2026-02-10", "2026-03-28", "Delayed 3 times — team availability", "CTO to mandate dedicated 2-day training block, no exceptions", ["c3-13"]),
        mkL1("c3-15", "Trading systems team rollout", "upcoming", "amber", "2026-03-03", "2026-04-04", "Blocked by compliance training completion", "Can begin in parallel if compliance sign-off obtained on core controls", ["c3-14"]),
        mkL1("c3-16", "Full org rollout", "upcoming", "red", "2026-03-24", "2026-04-25", "Blocked by upstream phases", "Cannot start until compliance and trading teams are live", ["c3-14", "c3-15"]),
      ]},
      { ...DEFAULT_L0[5], status: "upcoming", rag: "amber", startDate: "2026-04-14", endDate: "2026-05-09", notes: "Will miss original Feb 28 target — now targeting May", pathToGreen: "Contingency: extend legacy access by 6 weeks while rollout completes. Negotiate with Artifactory vendor for short-term extension.", children: [
        mkL1("c3-17", "Legacy read-only period", "upcoming", "amber", "2026-04-14", "2026-04-28", "", "", ["c3-16"]),
        mkL1("c3-18", "Legacy system shutdown", "upcoming", "amber", "2026-04-28", "2026-05-09", "", "", ["c3-17"]),
      ]},
    ],
    transcripts: [
      { id: "t7", date: "2025-04-16", title: "Kickoff Call", summary: "Extensive compliance requirements — SOC2, HIPAA, FCA regulatory. Dr. Patel emphasised data residency as non-negotiable. Expect longer discovery phase.", text: "Full transcript..." },
      { id: "t8", date: "2025-07-02", title: "Regulatory Review", summary: "FCA data handling approval obtained after 6-week review. Legal sign-off expected by end of July. Can proceed with configuration.", text: "Full transcript..." },
      { id: "t9", date: "2025-12-04", title: "Migration Status", summary: "Maven and Docker migrations progressing well. Compliance validation to begin January. Discussed rollout sequencing — pilot team first, then compliance, then trading.", text: "Full transcript..." },
      { id: "t10", date: "2026-02-19", title: "Rollout Blocker Review", summary: "Compliance team training cancelled for third time due to team availability. CTO agreed to mandate attendance. Revised timeline pushes go-live to late April.", text: "Full transcript..." },
    ],
    weeklyUpdates: [],
    rids: [
      { id: "r3-1", type: "Issue", title: "Compliance team training cancelled 3 times", severity: "Critical", status: "Open", linkedMilestone: "c3-14", owner: "Dr. Priya Patel", description: "Compliance team training has been cancelled three times due to team availability. This is the primary blocker to full org rollout.", mitigation: "CTO to mandate a dedicated 2-day training block with no exceptions. Fallback: 1:1 training for compliance leads only.", createdDate: "2026-02-19" },
      { id: "r3-2", type: "Risk", title: "Artifactory licence extension may be denied", severity: "High", status: "Open", linkedMilestone: "c3-17", owner: "Sarah K", description: "Current Artifactory licence expires end of April. If rollout slips further, we need a short-term extension which the vendor may not grant.", mitigation: "Pre-negotiate 6-week extension now. If denied, enforce hard cutover with read-only legacy access via backup.", createdDate: "2026-03-01" },
      { id: "r3-3", type: "Dependency", title: "Trading systems team availability", severity: "High", status: "Open", linkedMilestone: "c3-15", owner: "Dr. Priya Patel", description: "Trading systems team rollout depends on compliance training completion. Team also has a regulatory reporting deadline in April.", mitigation: "Run trading team onboarding in parallel once core compliance controls are signed off, even if full training isn't complete.", createdDate: "2026-02-25" },
      { id: "r3-4", type: "Risk", title: "FCA audit scheduled for May", severity: "Medium", status: "Open", linkedMilestone: null, owner: "Sarah K", description: "FCA regulatory audit is scheduled for May 2026. If migration is not fully complete and validated, it could create compliance exposure.", mitigation: "Prioritise compliance validation artifacts. Ensure audit trail is complete regardless of migration status.", createdDate: "2025-11-10" },
      { id: "r3-5", type: "Issue", title: "Data residency documentation gap", severity: "Medium", status: "Closed", linkedMilestone: "c3-8", owner: "Sarah K", description: "Data residency configuration lacked documentation required for FCA audit trail.", mitigation: "Documentation completed and reviewed by legal team.", createdDate: "2025-09-20" },
    ],
  },
  {
    id: "c4", name: "DataStream Inc", logo: "DS", tier: "Enterprise",
    complexity: "M", industry: "Data & Analytics",
    startDate: "2025-11-03", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Alex M",
    owner: "Alex M",
    stakeholder: "Raj Mehta (Platform Lead)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-11-03", endDate: "2025-11-14", notes: "Smooth kickoff", pathToGreen: "", children: [
        mkL1("c4-1", "Kickoff & goals alignment", "complete", "blue", "2025-11-03", "2025-11-07"),
        mkL1("c4-2", "Success criteria sign-off", "complete", "blue", "2025-11-07", "2025-11-14"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "green", startDate: "2025-11-17", endDate: "2026-01-30", notes: "Audit underway", pathToGreen: "", children: [
        mkL1("c4-3", "Tooling & pipeline audit", "complete", "green", "2025-11-17", "2025-12-12"),
        mkL1("c4-4", "Security & access review", "in-progress", "green", "2025-12-09", "2026-01-16"),
        mkL1("c4-5", "Network requirements", "upcoming", "green", "2026-01-13", "2026-01-30"),
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
    onboardingManager: "Sarah K",
    owner: "Sarah K",
    stakeholder: "Linda Park (SVP Engineering)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-09-08", endDate: "2025-09-26", notes: "50+ teams, complex org structure", pathToGreen: "", children: [
        mkL1("c5-1", "Exec alignment & charter", "complete", "blue", "2025-09-08", "2025-09-15"),
        mkL1("c5-2", "Org mapping & team inventory", "complete", "blue", "2025-09-15", "2025-09-26", "52 engineering teams identified"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "amber", startDate: "2025-09-29", endDate: "2026-02-27", notes: "Multi-region, legacy Nexus + JFrog", pathToGreen: "Prioritise highest-traffic registries first. Dedicated discovery sprint with infra leads.", children: [
        mkL1("c5-3", "Current state tooling audit", "complete", "amber", "2025-09-29", "2025-11-07", "Nexus, JFrog, and 3 homegrown registries"),
        mkL1("c5-4", "Multi-region network assessment", "complete", "green", "2025-10-20", "2025-12-05"),
        mkL1("c5-5", "Compliance & security scoping", "in-progress", "amber", "2025-11-24", "2026-01-30", "SOC2 + ISO27001 requirements"),
        mkL1("c5-6", "Legacy migration path planning", "in-progress", "amber", "2026-01-05", "2026-02-27", "Nexus → Cloudsmith migration plan"),
      ]},
      { ...DEFAULT_L0[2], status: "upcoming", rag: "green", startDate: "2026-02-16", endDate: "2026-05-08", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-04-20", endDate: "2026-09-11", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-08-17", endDate: "2026-11-06", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-10-26", endDate: "2026-12-18", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t12", date: "2025-09-10", title: "Kickoff", summary: "52 engineering teams across 3 regions. Mix of Nexus, JFrog, and internal registries. Estimated 15-month onboarding. Linda needs exec dashboard from day one.", text: "Full transcript..." },
      { id: "t13", date: "2025-12-03", title: "Discovery Review", summary: "Audit revealed 3 undocumented internal registries. SOC2 compliance requirements more complex than anticipated. Discovery phase extended by 6 weeks.", text: "Full transcript..." },
    ],
    weeklyUpdates: [], rids: [
      { id: "r5-1", type: "Risk", title: "Undocumented internal registries", severity: "High", status: "Open", linkedMilestone: "c5-3", owner: "Linda Park", description: "3 internal registries discovered post-kickoff not included in original scope.", mitigation: "Extended discovery sprint to map all registries. Updated scope document sent to Linda.", createdDate: "2025-11-10" },
    ],
  },
  {
    id: "c6", name: "Vertex Cloud", logo: "VC", tier: "Enterprise",
    complexity: "L", industry: "Cloud Infrastructure",
    startDate: "2025-12-01", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "You",
    owner: "You",
    stakeholder: "Chris Ng (Head of Infra)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-12-01", endDate: "2025-12-12", notes: "Fast alignment", pathToGreen: "", children: [
        mkL1("c6-1", "Kickoff & charter", "complete", "blue", "2025-12-01", "2025-12-08"),
        mkL1("c6-2", "Success metrics definition", "complete", "blue", "2025-12-08", "2025-12-12"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-12-15", endDate: "2026-01-23", notes: "Mostly Docker + Helm", pathToGreen: "", children: [
        mkL1("c6-3", "Tooling audit", "complete", "blue", "2025-12-15", "2026-01-02"),
        mkL1("c6-4", "Access & permissions review", "complete", "blue", "2025-12-29", "2026-01-23"),
      ]},
      { ...DEFAULT_L0[2], status: "in-progress", rag: "green", startDate: "2026-01-26", endDate: "2026-03-20", notes: "SSO configured, repos in progress", pathToGreen: "", children: [
        mkL1("c6-5", "SSO & SAML setup", "complete", "green", "2026-01-26", "2026-02-06"),
        mkL1("c6-6", "Repository structure & naming", "complete", "green", "2026-02-03", "2026-02-20"),
        mkL1("c6-7", "Upstream proxy config", "in-progress", "green", "2026-02-17", "2026-03-06"),
        mkL1("c6-8", "Scanning & policy setup", "upcoming", "green", "2026-03-02", "2026-03-20"),
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
    onboardingManager: "Tom B",
    owner: "Tom B",
    stakeholder: "Maya Osei (CTO)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2026-01-19", endDate: "2026-01-30", notes: "Strong exec buy-in", pathToGreen: "", children: [
        mkL1("c7-1", "Kickoff & stakeholder mapping", "complete", "blue", "2026-01-19", "2026-01-23"),
        mkL1("c7-2", "Charter & success criteria", "complete", "blue", "2026-01-23", "2026-01-30"),
      ]},
      { ...DEFAULT_L0[1], status: "in-progress", rag: "amber", startDate: "2026-02-02", endDate: "2026-04-17", notes: "GPU artifact registries add complexity", pathToGreen: "Engage specialist to review GPU image registry requirements.", children: [
        mkL1("c7-3", "ML model registry audit", "complete", "green", "2026-02-02", "2026-02-20", "HuggingFace + internal registry"),
        mkL1("c7-4", "GPU image registry scoping", "in-progress", "amber", "2026-02-17", "2026-03-27", "Novel requirement — no existing pattern"),
        mkL1("c7-5", "Data pipeline tooling audit", "upcoming", "green", "2026-03-16", "2026-04-17"),
      ]},
      { ...DEFAULT_L0[2], status: "upcoming", rag: "green", startDate: "2026-04-13", endDate: "2026-06-12", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[3], status: "upcoming", rag: "green", startDate: "2026-06-01", endDate: "2026-08-28", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[4], status: "upcoming", rag: "green", startDate: "2026-08-17", endDate: "2026-10-09", notes: "", pathToGreen: "", children: [] },
      { ...DEFAULT_L0[5], status: "upcoming", rag: "green", startDate: "2026-09-28", endDate: "2026-10-30", notes: "", pathToGreen: "", children: [] },
    ],
    transcripts: [
      { id: "t15", date: "2026-01-21", title: "Kickoff", summary: "ML-first company with custom GPU image registry requirements. Maya wants Cloudsmith as the single source of truth for all model artefacts.", text: "Full transcript..." },
    ],
    weeklyUpdates: [], rids: [
      { id: "r7-1", type: "Risk", title: "GPU image registry — no existing pattern", severity: "High", status: "Open", linkedMilestone: "c7-4", owner: "Tom B", description: "Synapse uses custom GPU base images not supported by standard registry patterns. Novel integration required.", mitigation: "Engaging Cloudsmith solutions engineering for specialist support.", createdDate: "2026-02-20" },
    ],
  },
  {
    id: "c8", name: "ByteForge", logo: "BF", tier: "Ultra",
    complexity: "S", industry: "Developer Tools",
    startDate: "2025-08-04", targetDate: null,
    baselineCompletion: null, forecastCompletion: null,
    onboardingManager: "Alex M",
    owner: "Alex M",
    stakeholder: "Jake Lim (Lead Eng)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-08-04", endDate: "2025-08-08", notes: "", pathToGreen: "", children: [
        mkL1("c8-1", "Kickoff", "complete", "blue", "2025-08-04", "2025-08-08"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-08-11", endDate: "2025-08-29", notes: "Simple npm-only stack", pathToGreen: "", children: [
        mkL1("c8-2", "Tooling audit", "complete", "blue", "2025-08-11", "2025-08-22"),
        mkL1("c8-3", "Access review", "complete", "blue", "2025-08-22", "2025-08-29"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-09-01", endDate: "2025-09-19", notes: "", pathToGreen: "", children: [
        mkL1("c8-4", "Repo setup", "complete", "blue", "2025-09-01", "2025-09-12"),
        mkL1("c8-5", "Token provisioning", "complete", "blue", "2025-09-12", "2025-09-19"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "blue", startDate: "2025-09-22", endDate: "2025-10-17", notes: "", pathToGreen: "", children: [
        mkL1("c8-6", "npm package migration", "complete", "blue", "2025-09-22", "2025-10-10"),
        mkL1("c8-7", "CI/CD pipeline update", "complete", "blue", "2025-10-06", "2025-10-17"),
      ]},
      { ...DEFAULT_L0[4], status: "in-progress", rag: "green", startDate: "2025-10-20", endDate: "2025-11-07", notes: "", pathToGreen: "", children: [
        mkL1("c8-8", "Team rollout (4 engineers)", "complete", "green", "2025-10-20", "2025-10-31"),
        mkL1("c8-9", "Final validation", "in-progress", "green", "2025-11-03", "2025-11-07"),
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
    onboardingManager: "Tom B",
    owner: "Tom B",
    stakeholder: "Anna Kovacs (VP Platform)",
    milestones: [
      { ...DEFAULT_L0[0], status: "complete", rag: "blue", startDate: "2025-02-10", endDate: "2025-02-21", notes: "Clean kickoff, clear goals", pathToGreen: "", children: [
        mkL1("c9-1", "Kickoff & stakeholder alignment", "complete", "blue", "2025-02-10", "2025-02-14"),
        mkL1("c9-2", "Success criteria & charter sign-off", "complete", "blue", "2025-02-14", "2025-02-21"),
      ]},
      { ...DEFAULT_L0[1], status: "complete", rag: "blue", startDate: "2025-02-24", endDate: "2025-04-04", notes: "Straightforward stack — npm, Docker, Helm", pathToGreen: "", children: [
        mkL1("c9-3", "Tooling & pipeline audit", "complete", "blue", "2025-02-24", "2025-03-14"),
        mkL1("c9-4", "Access & permissions review", "complete", "blue", "2025-03-10", "2025-03-28"),
        mkL1("c9-5", "Network & firewall assessment", "complete", "blue", "2025-03-24", "2025-04-04"),
      ]},
      { ...DEFAULT_L0[2], status: "complete", rag: "blue", startDate: "2025-04-07", endDate: "2025-05-30", notes: "SSO via Okta, 18 repos configured", pathToGreen: "", children: [
        mkL1("c9-6", "SSO / SAML setup (Okta)", "complete", "blue", "2025-04-07", "2025-04-25"),
        mkL1("c9-7", "Repository structure design", "complete", "blue", "2025-04-21", "2025-05-09"),
        mkL1("c9-8", "Upstream proxy & retention policies", "complete", "blue", "2025-05-05", "2025-05-23"),
        mkL1("c9-9", "Vulnerability scanning setup", "complete", "blue", "2025-05-19", "2025-05-30"),
      ]},
      { ...DEFAULT_L0[3], status: "complete", rag: "blue", startDate: "2025-06-02", endDate: "2025-08-08", notes: "Completed ahead of schedule", pathToGreen: "", children: [
        mkL1("c9-10", "npm package migration (85 packages)", "complete", "blue", "2025-06-02", "2025-06-27"),
        mkL1("c9-11", "Docker image migration (42 images)", "complete", "blue", "2025-06-23", "2025-07-18"),
        mkL1("c9-12", "Helm chart migration", "complete", "blue", "2025-07-14", "2025-08-01"),
        mkL1("c9-13", "CI/CD pipeline rewiring", "complete", "blue", "2025-07-28", "2025-08-08"),
      ]},
      { ...DEFAULT_L0[4], status: "complete", rag: "blue", startDate: "2025-08-11", endDate: "2025-09-26", notes: "Smooth rollout, no blockers", pathToGreen: "", children: [
        mkL1("c9-14", "Pilot team rollout (Platform team)", "complete", "blue", "2025-08-11", "2025-08-29"),
        mkL1("c9-15", "Full engineering rollout (3 teams)", "complete", "blue", "2025-08-25", "2025-09-19"),
        mkL1("c9-16", "Training sessions", "complete", "blue", "2025-09-08", "2025-09-26"),
      ]},
      { ...DEFAULT_L0[5], status: "complete", rag: "blue", startDate: "2025-09-29", endDate: "2025-10-24", notes: "Completed 7 days early", pathToGreen: "", children: [
        mkL1("c9-17", "Legacy registry read-only period", "complete", "blue", "2025-09-29", "2025-10-17"),
        mkL1("c9-18", "Legacy registry shutdown", "complete", "blue", "2025-10-13", "2025-10-24"),
        mkL1("c9-19", "Post-migration audit & sign-off", "complete", "blue", "2025-10-20", "2025-10-24"),
      ]},
    ],
    transcripts: [
      { id: "t17", date: "2025-02-12", title: "Kickoff", summary: "18-engineer platform team. npm, Docker and Helm registries. Anna wants zero downtime migration. Targeting 9 months.", text: "Full kickoff transcript..." },
      { id: "t18", date: "2025-07-15", title: "Migration Midpoint Review", summary: "npm and Docker ahead of schedule. Helm in progress. CI/CD pipeline rewiring straightforward — no legacy tooling complications.", text: "Full transcript..." },
      { id: "t19", date: "2025-10-22", title: "Completion Sign-off", summary: "All phases complete. Legacy registry shut down on 24 Oct — 7 days ahead of target. Anna confirmed full team on Cloudsmith. Post-migration audit passed.", text: "Full transcript..." },
    ],
    weeklyUpdates: [
      { id: "u9-1", date: "2025-10-24", milestoneSnapshot: [
        { label: "Kickoff", status: "complete", rag: "blue", endDate: "2025-02-21" },
        { label: "Discovery", status: "complete", rag: "blue", endDate: "2025-04-04" },
        { label: "Configuration", status: "complete", rag: "blue", endDate: "2025-05-30" },
        { label: "Artifact Migration", status: "complete", rag: "blue", endDate: "2025-08-08" },
        { label: "Rollout", status: "complete", rag: "blue", endDate: "2025-09-26" },
        { label: "Decommission", status: "complete", rag: "blue", endDate: "2025-10-24" },
      ], context: "Onboarding complete. All 6 phases delivered on or ahead of schedule. Legacy Artifactory instance shut down 24 Oct — 7 days early. Post-migration audit passed with no issues. Anna Kovacs confirmed full sign-off. Excellent engagement throughout." },
    ],
    rids: [],
  },
];

// ─── Derivation ───
function deriveL0Rag(ch, fb) { if(!ch.length) return fb; if(ch.some(c=>c.rag==="red")) return "red"; if(ch.some(c=>c.rag==="amber")) return "amber"; if(ch.some(c=>c.rag==="green")) return "green"; return "blue"; }
function deriveL0Status(ch, fb) { if(!ch.length) return fb; if(ch.every(c=>c.status==="complete")) return "complete"; if(ch.some(c=>c.status==="in-progress"||c.status==="complete")) return "in-progress"; return "upcoming"; }
function deriveCustomerRag(ms) { 
  const active = ms.filter(m => !m.isNA);
  if(!active.length) return "blue";
  if(active.some(m=>m.rag==="red"||m.children.some(c=>c.rag==="red"))) return "red"; 
  if(active.some(m=>m.rag==="amber"||m.children.some(c=>c.rag==="amber"))) return "amber"; 
  if(active.some(m=>m.rag==="green"||m.children.some(c=>c.rag==="green"))) return "green"; 
  return "blue"; 
}

function syncL0(l0) {
  if (l0.isNA) return l0; // Skip syncing dates if N/A
  if (!l0.children || !l0.children.length) return l0;
  let minStart = null, maxEnd = null;
  l0.children.forEach(c => {
    if (c.startDate && (!minStart || new Date(c.startDate) < new Date(minStart))) minStart = c.startDate;
    if (c.endDate && (!maxEnd || new Date(c.endDate) > new Date(maxEnd))) maxEnd = c.endDate;
  });
  return {
    ...l0,
    status: deriveL0Status(l0.children, l0.status),
    rag: deriveL0Rag(l0.children, l0.rag),
    startDate: minStart || l0.startDate,
    endDate: maxEnd || l0.endDate
  };
}

function getL0Progress(l0) { if(!l0.children.length) return l0.status==="complete"?100:l0.status==="in-progress"?50:0; return Math.round((l0.children.filter(c=>c.status==="complete").length/l0.children.length)*100); }
function getTotalProgress(ms) { 
  const active = ms.filter(m => !m.isNA);
  const a=active.flatMap(l=>l.children.length?l.children:[l]); 
  const d=a.filter(i=>i.status==="complete").length; 
  return a.length?Math.round((d/a.length)*100):0; 
}
function fmtDate(d) { if(!d) return "\u2014"; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
function getSlipDays(c) { if(!c.baselineCompletion||!c.forecastCompletion) return 0; return Math.round((new Date(c.forecastCompletion)-new Date(c.baselineCompletion))/(24*60*60*1000)); }
function fmtRange(sd, ed) { if(!sd && !ed) return "\u2014"; if(sd && ed) return `${fmtDate(sd)} \u2013 ${fmtDate(ed)}`; return fmtDate(sd || ed); }

function today() { return new Date().toISOString().split("T")[0]; }

const STATUS_CYCLE=["upcoming","in-progress","complete"];
function nextStatus(s) { return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s)+1)%STATUS_CYCLE.length]; }
const RAG_CYCLE=["green","amber","red","blue"];
function nextRag(r) { return RAG_CYCLE[(RAG_CYCLE.indexOf(r)+1)%RAG_CYCLE.length]; }
function StatusIcon({status}) { if(status==="complete") return "\u2713"; if(status==="in-progress") return "\u25C9"; return ""; }

// Cascade dates: when a milestone's endDate changes, shift dependents' startDate (and endDate by same delta)
function cascadeDependencies(milestones, changedId, oldEndDate, newEndDate) {
  if (!oldEndDate || !newEndDate || oldEndDate === newEndDate) return milestones;
  const delta = (new Date(newEndDate) - new Date(oldEndDate)) / (24*60*60*1000);
  if (delta === 0) return milestones;
  const shiftDate = (d, days) => { if (!d) return d; const dt = new Date(d); dt.setDate(dt.getDate() + days); return dt.toISOString().split("T")[0]; };

  // Collect all L1s flat with references
  const shifted = new Set();
  const doShift = (ms, targetId, days) => {
    return ms.map(l0 => ({...l0, children: l0.children.map(l1 => {
      if ((l1.dependsOn||[]).includes(targetId) && !shifted.has(l1.id)) {
        shifted.add(l1.id);
        const newStart = shiftDate(l1.startDate, days);
        const newEnd = shiftDate(l1.endDate, days);
        return {...l1, startDate: newStart, endDate: newEnd};
      }
      return l1;
    })}));
  };

  // Iteratively cascade (handles chains A→B→C)
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

// Build a flat lookup of all L1 milestones across all L0 phases
function buildL1Lookup(milestones) {
  const map = {};
  milestones.forEach(l0 => l0.children.forEach(l1 => { map[l1.id] = l1.label; }));
  return map;
}

// Get all L1 ids except the given one (for dependency picker)
function getAllL1Options(milestones, excludeId) {
  const opts = [];
  milestones.forEach((l0, i) => {
    l0.children.forEach(l1 => {
      if (l1.id !== excludeId) opts.push({ id: l1.id, label: l1.label, phase: l0.label });
    });
  });
  return opts;
}

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
  .complexity-badge { display:inline-block; padding:1px 8px; border-radius:4px; font-size:10px; font-weight:700; letter-spacing:0.5px; }
  .complexity-S { background:rgba(34,197,94,0.12); color:#22c55e; }
  .complexity-M { background:rgba(14,165,233,0.12); color:#0ea5e9; }
  .complexity-L { background:rgba(139,92,246,0.12); color:#8b5cf6; }
  .complexity-XL { background:rgba(245,158,11,0.12); color:#f59e0b; }
  .complexity-XXL { background:rgba(239,68,68,0.12); color:#ef4444; }
  .cap-bar-track { height:8px; background:#1e2230; border-radius:4px; overflow:hidden; }
  .cap-bar-fill { height:100%; border-radius:4px; transition:width 0.4s ease; }
  .cap-input { background:#1a1d28; border:1px solid #2e3348; border-radius:4px; color:#c5c8d6; font-size:12px; padding:3px 6px; width:58px; font-family:'JetBrains Mono',monospace; text-align:right; }
  .cap-input:focus { outline:none; border-color:#6366f1; }
  .cap-table { width:100%; border-collapse:collapse; }
  .cap-table th { text-align:left; padding:8px 12px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:#464b5e; border-bottom:1px solid #1e2230; }
  .cap-table td { padding:8px 12px; border-bottom:1px solid #1a1d28; vertical-align:middle; }
  .manager-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
  .over-cap-warning { margin-top:8px; padding:6px 10px; background:rgba(239,68,68,0.08); border-radius:6px; font-size:11px; color:#ef4444; border-left:3px solid #ef4444; }
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

  /* ─── RID Table ─── */
  .rid-type { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; padding:3px 7px; border-radius:4px; }
  .rid-type-risk { background:rgba(245,158,11,0.1); color:#f59e0b; }
  .rid-type-issue { background:rgba(239,68,68,0.1); color:#ef4444; }
  .rid-type-dependency { background:rgba(99,102,241,0.1); color:#818cf8; }
  .rid-sev { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:600; padding:2px 6px; border-radius:3px; }
  .rid-status-open { background:rgba(239,68,68,0.08); color:#ef4444; }
  .rid-status-mitigated { background:rgba(245,158,11,0.08); color:#f59e0b; }
  .rid-status-closed { background:rgba(86,91,110,0.08); color:#565b6e; }
  .rid-link { font-size:11px; color:#818cf8; cursor:help; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px; display:inline-block; }
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
function AddCustomerModal({ onClose, onAdd, tmpl, tiers, industries }) {
  const [name,setName]=useState(""); const [tier,setTier]=useState(tiers[0]?.label||""); const [stakeholder,setStakeholder]=useState(""); const [sd,setSd]=useState(""); const [mgr,setMgr]=useState("You"); const [complexity,setComplexity]=useState("M"); const [industry,setIndustry]=useState(industries[0]||"");
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
        <div className="form-group"><label className="form-label">Complexity</label><select className="input select-input" value={complexity} onChange={e=>setComplexity(e.target.value)}>{COMPLEXITY_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Industry</label><select className="input select-input" value={industry} onChange={e=>setIndustry(e.target.value)}><option value="">— None —</option>{industries.map(i=><option key={i} value={i}>{i}</option>)}</select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date *</label><input className="input" type="date" value={sd} onChange={e=>setSd(e.target.value)} /></div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!name||!sd} onClick={()=>onAdd({id:"c"+Date.now(),name,logo:name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),tier,complexity,industry,startDate:sd,targetDate:null,baselineCompletion:null,forecastCompletion:null,onboardingManager:mgr,owner:mgr,stakeholder,milestones:mkCustomerMilestones(tmpl),transcripts:[],weeklyUpdates:[],rids:[]})}>Add Customer</button>
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

function EditCustomerModal({ customer, onClose, onSave, tiers, industries }) {
  const [name,setName]=useState(customer.name);
  const [tier,setTier]=useState(customer.tier);
  const [complexity,setComplexity]=useState(customer.complexity||"M");
  const [industry,setIndustry]=useState(customer.industry||"");
  const [stakeholder,setStakeholder]=useState(customer.stakeholder);
  const [mgr,setMgr]=useState(customer.onboardingManager||"");
  const [sd,setSd]=useState(customer.startDate||"");
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
        <div className="form-group"><label className="form-label">Complexity</label><select className="input select-input" value={complexity} onChange={e=>setComplexity(e.target.value)}>{COMPLEXITY_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Industry</label><select className="input select-input" value={industry} onChange={e=>setIndustry(e.target.value)}><option value="">— None —</option>{(industries||[]).map(i=><option key={i} value={i}>{i}</option>)}{industry&&!(industries||[]).includes(industry)&&<option value={industry}>{industry}</option>}</select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Key Stakeholder</label><input className="input" value={stakeholder} onChange={e=>setStakeholder(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Onboarding Manager</label><input className="input" value={mgr} onChange={e=>setMgr(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date</label><input className="input" type="date" value={sd} onChange={e=>setSd(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Baseline Completion</label><input className="input" type="date" value={bc} onChange={e=>setBc(e.target.value)} /><div style={{fontSize:"10px",color:"#464b5e",marginTop:"4px"}}>Original target date (set once at kickoff)</div></div>
        <div className="form-group"><label className="form-label">Forecast Completion</label><input className="input" type="date" value={fc} onChange={e=>setFc(e.target.value)} /><div style={{fontSize:"10px",color:"#464b5e",marginTop:"4px"}}>Current best estimate</div></div>
      </div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...customer,name,tier,complexity,industry,stakeholder,onboardingManager:mgr,startDate:sd||null,baselineCompletion:bc||null,forecastCompletion:fc||null,logo:name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()})}>Save</button>
      </div>
    </div></div>
  );
}

function EditMilestoneModal({ item, isL0, onClose, onSave, allMilestones }) {
  const [notes,setNotes]=useState(item.notes||"");
  const [status,setStatus]=useState(item.status);
  const [rag,setRag]=useState(item.rag||"green");
  const [sd,setSd]=useState(item.startDate||"");
  const [ed,setEd]=useState(item.endDate||"");
  const [ptg,setPtg]=useState(item.pathToGreen||"");
  const [deps,setDeps]=useState(item.dependsOn||[]);
  const [isNA,setIsNA]=useState(item.isNA||false);

  const canEdit = !isL0 || !(item.children?.length > 0);
  const depOptions = !isL0 && allMilestones ? getAllL1Options(allMilestones, item.id) : [];

  const toggleDep = (id) => setDeps(prev => prev.includes(id) ? prev.filter(d=>d!==id) : [...prev, id]);

  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">
        {isL0 && <span style={{fontSize:"11px",color:"#565b6e",marginRight:"8px"}}>L0 PHASE</span>}
        {item.label}
      </div>

      {isL0 && (
        <div className="form-group" style={{background:"rgba(255,255,255,0.03)",padding:"12px",borderRadius:"8px",border:"1px solid #1e2230"}}>
          <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}}>
            <input type="checkbox" checked={isNA} onChange={e=>setIsNA(e.target.checked)} style={{width:"16px",height:"16px"}} />
            <span style={{fontSize:"13px",color:"#e2e4eb",fontWeight:500}}>Mark phase as Not Applicable (N/A)</span>
          </label>
          <div style={{fontSize:"11px",color:"#6b7088",marginTop:"4px",marginLeft:"24px"}}>This will exclude the phase from overall progress and RAG calculations.</div>
        </div>
      )}

      {!isNA && (
        <>
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

          {(rag === "amber" || rag === "red") && (
            <div className="form-group">
              <label className="form-label" style={{color:RAG_COLORS[rag]}}>Path to Green {rag==="red"?"(Required)":"(Recommended)"}</label>
              <textarea className="textarea" value={ptg} onChange={e=>setPtg(e.target.value)} placeholder={"What actions are needed to get back to Green?"} style={{borderColor:rag==="red"&&!ptg.trim()?"#ef4444":undefined}} />
            </div>
          )}

          {!isL0 && depOptions.length > 0 && (
            <div className="form-group">
              <label className="form-label">Depends On (select predecessors)</label>
              <div style={{maxHeight:"140px",overflowY:"auto",border:"1px solid #2e3348",borderRadius:"7px",background:"#181b26"}}>
                {depOptions.map(opt=>{
                  const sel = deps.includes(opt.id);
                  return <div key={opt.id} onClick={()=>toggleDep(opt.id)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 12px",cursor:"pointer",background:sel?"rgba(99,102,241,0.08)":"transparent",transition:"background 0.12s",borderBottom:"1px solid #1a1d28"}}>
                    <span style={{width:"14px",height:"14px",borderRadius:"3px",border:sel?"2px solid #6366f1":"2px solid #2e3348",background:sel?"#6366f1":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"white",flexShrink:0}}>{sel?"\u2713":""}</span>
                    <span style={{fontSize:"12px",color:sel?"#c5c8d6":"#8b8fa3"}}>{opt.label}</span>
                    <span style={{fontSize:"10px",color:"#464b5e",marginLeft:"auto"}}>{opt.phase}</span>
                  </div>;
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="form-group"><label className="form-label">Notes</label><textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="General notes..." style={{minHeight:"80px"}} /></div>

      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={()=>onSave({...item, isNA, notes, status: isNA ? "complete" : status, rag: isNA ? "blue" : rag, startDate:sd||null, endDate:ed||null, pathToGreen:(rag==="green"||rag==="blue"||isNA)?"":ptg, dependsOn:deps})}>Save</button>
      </div>
    </div></div>
  );
}

function EditRidModal({ rid, milestones, onClose, onSave, onDelete }) {
  const [type,setType]=useState(rid?.type||"Risk");
  const [title,setTitle]=useState(rid?.title||"");
  const [severity,setSeverity]=useState(rid?.severity||"Medium");
  const [status,setStatus]=useState(rid?.status||"Open");
  const [linked,setLinked]=useState(rid?.linkedMilestone||"");
  const [owner,setOwner]=useState(rid?.owner||"");
  const [desc,setDesc]=useState(rid?.description||"");
  const [mit,setMit]=useState(rid?.mitigation||"");
  const isNew = !rid?.id;

  // Build flat list of all L0 + L1 milestones for linking
  const msOptions = [];
  milestones.forEach((l0, i) => {
    msOptions.push({ id: l0.id, label: `L0: ${l0.label}` });
    l0.children.forEach(l1 => msOptions.push({ id: l1.id, label: `  L1: ${l1.label}` }));
  });

  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-title">{isNew ? "Add RID" : "Edit RID"}</div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Type *</label>
          <select className="input select-input" value={type} onChange={e=>setType(e.target.value)}>{RID_TYPES.map(t=><option key={t}>{t}</option>)}</select>
        </div>
        <div className="form-group"><label className="form-label">Severity</label>
          <select className="input select-input" value={severity} onChange={e=>setSeverity(e.target.value)}>{RID_SEVERITIES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Title *</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief description of the risk, issue or dependency" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Status</label>
          <select className="input select-input" value={status} onChange={e=>setStatus(e.target.value)}>{RID_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div className="form-group"><label className="form-label">Owner</label><input className="input" value={owner} onChange={e=>setOwner(e.target.value)} placeholder="e.g. Jamie Chen" /></div>
      </div>
      <div className="form-group"><label className="form-label">Linked Milestone</label>
        <select className="input select-input" value={linked} onChange={e=>setLinked(e.target.value)}>
          <option value="">None</option>
          {msOptions.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="textarea" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Full description of the risk, issue or dependency..." style={{minHeight:"80px"}} /></div>
      <div className="form-group"><label className="form-label">Mitigation / Resolution</label><textarea className="textarea" value={mit} onChange={e=>setMit(e.target.value)} placeholder="What actions are being taken or planned..." style={{minHeight:"80px"}} /></div>
      <div className="modal-actions">
        {!isNew && onDelete && <button className="btn btn-ghost" style={{color:"#ef4444",borderColor:"rgba(239,68,68,0.3)",marginRight:"auto"}} onClick={()=>onDelete(rid.id)}>Delete</button>}
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!title.trim()} onClick={()=>onSave({
          id: rid?.id || `rid-${Date.now()}`,
          type, title: title.trim(), severity, status,
          linkedMilestone: linked || null, owner, description: desc, mitigation: mit,
          createdDate: rid?.createdDate || new Date().toISOString().split("T")[0],
        })}>{isNew ? "Add" : "Save"}</button>
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

function IndustrySettings({ industries, onSave, onClose }) {
  const [items,setItems]=useState([...industries]);
  const [nl,setNl]=useState("");
  const add=()=>{if(nl.trim()&&!items.includes(nl.trim())){setItems([...items,nl.trim()].sort());setNl("");}};
  return (
    <div className="card" style={{maxWidth:"600px"}}>
      <div className="card-header"><span className="card-title">Industries</span></div>
      <p style={{fontSize:"12.5px",color:"#6b7088",marginBottom:"16px",lineHeight:1.6}}>Define the industry options available when creating or editing onboardings.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"14px"}}>
        {items.map(ind=><div key={ind} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"#181b26",borderRadius:"6px"}}>
          <span style={{fontSize:"13px",color:"#e2e4eb",flex:1}}>{ind}</span>
          <button onClick={()=>setItems(items.filter(x=>x!==ind))} style={{background:"none",border:"none",color:"#565b6e",cursor:"pointer",fontSize:"14px"}}>{"\u2715"}</button>
        </div>)}
      </div>
      <div style={{display:"flex",gap:"8px"}}><input className="input" value={nl} onChange={e=>setNl(e.target.value)} placeholder="New industry..." onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1}} /><button className="btn btn-ghost" onClick={add}>Add</button></div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(items)}>Save Industries</button></div>
    </div>
  );
}

// ─── Dashboard Gantt ───
function GanttChart({ customers, onSelectCustomer, showProgress = true, ganttView = "month" }) {
  if(!customers.length) return <div className="empty-state"><div className="empty-state-text">No customers yet</div></div>;

  const getEffEnd = c => {
    if (c.targetDate) return new Date(c.targetDate);
    if (c.forecastCompletion) return new Date(c.forecastCompletion);
    const withEnd = [...c.milestones].filter(m=>m.endDate).reverse();
    if (withEnd.length) return new Date(withEnd[0].endDate);
    const d = new Date(c.startDate); d.setFullYear(d.getFullYear()+1); return d;
  };

  const starts = customers.map(c=>new Date(c.startDate)).filter(d=>!isNaN(d.getTime()));
  const ends   = customers.map(c=>getEffEnd(c)).filter(d=>!isNaN(d.getTime()));

  const UNIT_DAYS = ganttView==="week" ? 7 : ganttView==="month" ? 30 : 91;
  const unitMs = UNIT_DAYS * 86400000;

  const mn = new Date(Math.min(...starts)); mn.setTime(mn.getTime() - unitMs);
  const mx = new Date(Math.max(...ends));   mx.setTime(mx.getTime() + unitMs);
  const totalMs = mx - mn;
  const numUnits = Math.max(1, Math.ceil(totalMs / unitMs));
  const units = Array.from({length:numUnits},(_,i)=>i);

  const pct = d => { if(!d) return null; const dt=new Date(d); if(isNaN(dt.getTime())) return null; return Math.max(0,Math.min(100,((dt-mn)/totalMs)*100)); };

  const unitLabel = i => {
    const d = new Date(mn.getTime() + i * unitMs);
    if(ganttView==="week")    return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    if(ganttView==="month")   return d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
    return `Q${Math.floor(d.getMonth()/3)+1} '${String(d.getFullYear()).slice(2)}`;
  };

  const showEvery = ganttView==="week" ? 2 : 1;
  const todayPct = pct(new Date());

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header">{units.map(u=><div key={u} className="gantt-week">{u%showEvery===0?unitLabel(u):""}</div>)}</div>
      {customers.map((c,ci)=>{
        const cRag=deriveCustomerRag(c.milestones);
        const sp=pct(c.startDate), ep=pct(getEffEnd(c));
        if(sp===null||ep===null) return null;
        const barW=Math.max(ep-sp,0.5), prog=getTotalProgress(c.milestones);
        const filledW=barW*(prog/100), remainW=barW-filledW;
        return <div key={c.id} className="gantt-row">
          <div className="gantt-label" style={{cursor:"pointer"}} onClick={()=>onSelectCustomer&&onSelectCustomer(c.id)}>
            <span className="rag-dot" style={{background:RAG_COLORS[cRag],width:"8px",height:"8px"}} />
            <div className="customer-avatar" style={{background:`linear-gradient(135deg,${c.milestones[0]?.color},${c.milestones[2]?.color})`,width:"22px",height:"22px",fontSize:"8px",borderRadius:"5px"}}>{c.logo}</div>
            <span className="gantt-customer-name" style={{color:"#c5c8ff"}}>{c.name}</span>
          </div>
          <div className="gantt-cells" style={{position:"relative"}}>
            {units.map(u=><div key={u} className="gantt-cell" />)}
            {showProgress ? <>
              {filledW > 0 && <div className="gantt-bar-segment" style={{left:`${sp}%`,width:`${filledW}%`,background:`linear-gradient(90deg,${RAG_COLORS[cRag]}88,${RAG_COLORS[cRag]}cc)`,zIndex:1,borderRadius:remainW>0?"3px 0 0 3px":"3px"}} />}
              {remainW > 0 && <div className="gantt-bar-segment" style={{left:`${sp+filledW}%`,width:`${remainW}%`,background:"#1e2230",zIndex:1,borderRadius:filledW>0?"0 3px 3px 0":"3px"}} />}
            </> : <>
              <div className="gantt-bar-segment" style={{left:`${sp}%`,width:`${barW}%`,background:`linear-gradient(90deg,${RAG_COLORS[cRag]}88,${RAG_COLORS[cRag]}cc)`,zIndex:1,borderRadius:"3px"}} />
            </>}
            {todayPct>0&&todayPct<100&&<div style={{position:"absolute",top:"-4px",bottom:"-4px",left:`${todayPct}%`,width:"2px",background:"#ef4444",zIndex:2,opacity:0.7}}>{ci===0&&<span style={{position:"absolute",top:"-16px",left:"-14px",fontSize:"9px",color:"#ef4444",fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>Today</span>}</div>}
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

function copyStatusUpdate(customer) {
  const EMOJI = { blue:"🔵", green:"🟢", amber:"🟠", red:"🔴" };
  const fmtSlash = d => { if(!d) return "TBD"; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`; };
  const statusLabel = s => s==="complete"?"Complete":s==="in-progress"?"In Progress":"Not Started";
  const lines = customer.milestones
    .filter(l0=>!l0.isNA)
    .map(l0=>{
      const emoji = l0.status==="upcoming" ? "⚪" : (EMOJI[l0.rag]||"⚪");
      return `${emoji} ${l0.label} | ${statusLabel(l0.status)} | ${fmtSlash(l0.endDate)}`;
    });
  return navigator.clipboard.writeText(lines.join("\n")).catch(()=>{});
}

// ─── Per-Customer Gantt ───
function CustomerGantt({ customer, showProgress = true }) {
  const tStart = new Date(customer.startDate); tStart.setDate(tStart.getDate()-7);
  // Extend timeline to cover forecast if it exceeds target
  let tEndDate = new Date(customer.targetDate);
  if (customer.forecastCompletion && new Date(customer.forecastCompletion) > tEndDate) tEndDate = new Date(customer.forecastCompletion);
  // Also check actual milestone end dates
  customer.milestones.forEach(l0 => {
    if (l0.endDate && new Date(l0.endDate) > tEndDate) tEndDate = new Date(l0.endDate);
    l0.children.forEach(l1 => { if (l1.endDate && new Date(l1.endDate) > tEndDate) tEndDate = new Date(l1.endDate); });
  });
  const tEnd = new Date(tEndDate); tEnd.setDate(tEnd.getDate()+14);
  const span = tEnd - tStart;
  const totalWeeks = Math.max(1, Math.ceil(span / (7*24*60*60*1000)));
  const weeks = Array.from({length:totalWeeks},(_,i)=>i);
  const todayPct = Math.max(0,Math.min(100,((new Date()-tStart)/span)*100));
  const pct = d => { if(!d) return null; return Math.max(0,Math.min(100,((new Date(d)-tStart)/span)*100)); };

  // Build a flat list of all visual rows with their Y offsets and L1 positions
  const labelW = 210;
  const l0RowH = 38, l1RowH = 30, headerH = 33;
  let yAccum = headerH;
  customer.milestones.forEach(l0 => {
    yAccum += l0RowH; // L0 row
    if (!l0.isNA) {
      l0.children.forEach(l1 => {
        yAccum += l1RowH;
      });
      if (l0.children.length === 0) yAccum += 4; // spacer
    }
  });
  const totalH = yAccum;

  return (
    <div className="cgantt" style={{position:"relative"}}><div className="cgantt-scroll"><div className="cgantt-inner" style={{position:"relative"}}>
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
        const prog = l0.isNA ? 0 : getL0Progress(l0);
        const fillW = barW * (prog / 100);

        return <div key={l0.id} className="cgantt-l0-group" style={{ opacity: l0.isNA ? 0.5 : 1 }}>
          <div className="cgantt-l0-row">
            <div className="cgantt-l0-label">
              <span className="rag-dot rag-dot-sm" style={{background:RAG_COLORS[l0.rag]}} />
              <span className="cgantt-l0-num">{l0i+1}</span>
              <span className="cgantt-l0-name" style={{textDecoration: l0.isNA ? "line-through" : "none"}}>{l0.label}</span>
              {l0.isNA && <span style={{marginLeft:"6px",fontSize:"9px",padding:"1px 4px",background:"#2e3348",borderRadius:"3px",color:"#c5c8d6",fontWeight:600}}>N/A</span>}
            </div>
            <div className="cgantt-l0-track">
              {/* Always draw the vertical week lines */}
              {weeks.map(w=><div key={w} className="cgantt-l0-track-cell" />)}
              
              {/* Only draw the bars if the milestone is NOT marked as N/A */}
              {!l0.isNA && (
                showProgress ? <>
                  {fillW > 0 && <div className="cgantt-l0-bar-fill" style={{left:`${barLeft}%`,width:`${fillW}%`,background:RAG_COLORS[l0.rag],opacity:0.55,borderRadius: (barW - fillW) > 0.5 ? "4px 0 0 4px" : "4px"}} />}
                  {(barW - fillW) > 0.5 && <div className="cgantt-l0-bar" style={{left:`${barLeft + fillW}%`,width:`${barW - fillW}%`,background:"#1e2230",borderRadius: fillW > 0 ? "0 4px 4px 0" : "4px"}} />}
                </> : <>
                  <div className="cgantt-l0-bar-fill" style={{left:`${barLeft}%`,width:`${barW}%`,background:RAG_COLORS[l0.rag],opacity:0.55,borderRadius:"4px"}} />
                </>
              )}
              
              {todayPct>0&&todayPct<100&&<div className="cgantt-today" style={{left:`${todayPct}%`}}>{l0i===0&&<span className="cgantt-today-label">Today</span>}</div>}
            </div>
          </div>

          {!l0.isNA && l0.children.map(l1=>{
            const l1S = pct(l1.startDate);
            const l1E = pct(l1.endDate);
            const hasL1Span = l1S !== null && l1E !== null;
            const l1Left = hasL1Span ? l1S : barLeft;
            const l1W = hasL1Span ? Math.max(1, l1E - l1S) : barW * 0.6;
            const barColor = showProgress ? (l1.status==="complete" ? "#565b6e" : RAG_COLORS[l1.rag]) : RAG_COLORS[l1.rag];
            const barOp = showProgress ? (l1.status==="complete" ? 0.35 : l1.status==="upcoming" ? 0.2 : 0.7) : 0.5;
            const dotColor = showProgress ? (l1.status==="complete" ? "#565b6e" : RAG_COLORS[l1.rag]) : RAG_COLORS[l1.rag];

            return <div key={l1.id} className="cgantt-l1-row">
              <div className="cgantt-l1-label">
                <span className="cgantt-l1-dot" style={{background:dotColor}} />
                <span className={`cgantt-l1-name ${showProgress && l1.status==="complete"?"done":""}`}>{l1.label}</span>
              </div>
              <div className="cgantt-l1-track">
                {weeks.map(w=><div key={w} className="cgantt-l1-track-cell" />)}
                <div className="cgantt-l1-bar" style={{left:`${l1Left}%`,width:`${l1W}%`,background:barColor,opacity:barOp}} />
                {todayPct>0&&todayPct<100&&<div className="cgantt-today" style={{left:`${todayPct}%`}} />}
              </div>
            </div>;
          })}
          {(!l0.isNA && l0.children.length===0) && <div className="cgantt-l1-row" style={{height:"4px"}} />}
        </div>;
      })}
    </div></div></div>
  );
}

// ─── Portfolio Table ───
function PortfolioTable({ customers, onSelectCustomer, onUpdateCustomer, tiers, industries }) {
  const [sortKey,setSortKey]=useState("name");
  const [sortDir,setSortDir]=useState("asc");
  const [filterRag,setFilterRag]=useState(null);
  const [filterPhase,setFilterPhase]=useState(null);
  const [filterTier,setFilterTier]=useState(null);
  const [filterMgr,setFilterMgr]=useState(null);
  const [filterStatus,setFilterStatus]=useState("active");
  const [editingCustomer,setEditingCustomer]=useState(null);

  const allManagers = [...new Set(customers.map(c=>c.onboardingManager||"Unassigned"))].sort();
  const allPhases = DEFAULT_L0.map(l=>l.label);

  const getCurrentPhase = c => {
    const p = c.milestones.find(m=>m.status==="in-progress")||c.milestones.find(m=>m.status!=="complete")||c.milestones[c.milestones.length-1];
    return p?.label||"\u2014";
  };

  const toggle=(current,val)=>current===val?null:val;

  // Filter
  let filtered = customers;
  if(filterStatus==="active") filtered=filtered.filter(c=>getTotalProgress(c.milestones)<100);
  if(filterStatus==="complete") filtered=filtered.filter(c=>getTotalProgress(c.milestones)===100);
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
      case "industry": av=(a.industry||"").toLowerCase(); bv=(b.industry||"").toLowerCase(); break;
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
      <div style={{display:"flex",gap:"2px",background:"#1a1d28",borderRadius:"6px",padding:"2px",marginRight:"4px"}}>
        {[["active","Active"],["complete","Complete"],["all","All"]].map(([v,l])=><button key={v} onClick={()=>setFilterStatus(v==="all"?null:v)} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"4px",border:"none",cursor:"pointer",background:(filterStatus||"all")===v?"#2e3348":"transparent",color:(filterStatus||"all")===v?"#c5c8d6":"#565b6e",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{l}</button>)}
      </div>
      <div className="filter-sep" />
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
      {(filterRag||filterPhase||filterTier||filterMgr)&&<button className="filter-chip" style={{color:"#818cf8",borderColor:"#6366f1"}} onClick={()=>{setFilterRag(null);setFilterPhase(null);setFilterTier(null);setFilterMgr(null);}}>Clear filters</button>}
    </div>

    <div style={{overflowX:"auto"}}>
      <table className="ptable">
        <thead><tr>
          <SortTh k="name">Customer</SortTh>
          <SortTh k="tier">Tier</SortTh>
          <SortTh k="industry">Industry</SortTh>
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
              <td style={{color:"#8b8fa3",fontSize:"12px"}}>{c.industry||"\u2014"}</td>
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

    {editingCustomer&&<EditCustomerModal customer={editingCustomer} onClose={()=>setEditingCustomer(null)} onSave={u=>{onUpdateCustomer(u);setEditingCustomer(null);}} tiers={tiers} industries={industries} />}
  </div>;
}

// ─── Dashboard ───
function DashboardView({ customers, onSelectCustomer, onUpdateCustomer, tiers, industries }) {
  const t=customers.length;
  const greens=customers.filter(c=>deriveCustomerRag(c.milestones)==="green").length;
  const ambers=customers.filter(c=>deriveCustomerRag(c.milestones)==="amber").length;
  const reds=customers.filter(c=>deriveCustomerRag(c.milestones)==="red").length;
  const [dashShowProgress,setDashShowProgress]=useState(true);
  const [ganttView,setGanttView]=useState("month");

  return <div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-label">Active Onboardings</div><div className="stat-value">{t}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#22c55e"}}>Green</div><div className="stat-value" style={{color:"#22c55e"}}>{greens}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#f59e0b"}}>Amber</div><div className="stat-value" style={{color:"#f59e0b"}}>{ambers}</div></div>
      <div className="stat-card"><div className="stat-label" style={{color:"#ef4444"}}>Red</div><div className="stat-value" style={{color:reds>0?"#ef4444":"#565b6e"}}>{reds}</div></div>
    </div>
    <div className="card">
      <div className="card-header">
        <span className="card-title">Onboarding Timeline</span>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <div style={{display:"flex",gap:"2px",background:"#1a1d28",borderRadius:"6px",padding:"2px"}}>
            {["week","month","quarter"].map(v=><button key={v} onClick={()=>setGanttView(v)} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"4px",border:"none",cursor:"pointer",background:ganttView===v?"#2e3348":"transparent",color:ganttView===v?"#c5c8d6":"#565b6e",fontFamily:"'DM Sans',sans-serif",fontWeight:600,textTransform:"capitalize"}}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>)}
          </div>
          <button className={`btn btn-sm ${dashShowProgress?"btn-primary":"btn-ghost"}`} onClick={()=>setDashShowProgress(p=>!p)} style={{fontSize:"11px"}}>{dashShowProgress?"Progress":"RAG Status"}</button>
        </div>
      </div>
      <GanttChart customers={customers.filter(c=>getTotalProgress(c.milestones)<100)} onSelectCustomer={onSelectCustomer} showProgress={dashShowProgress} ganttView={ganttView} />
    </div>
    <div className="card">
      <div className="card-header"><span className="card-title">Portfolio</span></div>
      <PortfolioTable customers={customers} onSelectCustomer={onSelectCustomer} onUpdateCustomer={onUpdateCustomer} tiers={tiers} industries={industries} />
    </div>
  </div>;
}

// ─── Customer Detail ───
function CustomerDetailView({ customer, onUpdate, tiers, industries }) {
  const [tab,setTab]=useState("plan");
  const [expanded,setExpanded]=useState(()=>{const ip=customer.milestones.findIndex(m=>m.status==="in-progress");return new Set(ip>=0?[ip]:[0]);});
  const [editItem,setEditItem]=useState(null); const [editIsL0,setEditIsL0]=useState(false);
  const [showAddTr,setShowAddTr]=useState(false);
  const [addingL1,setAddingL1]=useState(null); const [newL1,setNewL1]=useState("");
  const [genUp,setGenUp]=useState(false);
  const [showAddUpdate,setShowAddUpdate]=useState(false);
  const [manualDate,setManualDate]=useState(today());
  const [manualCtx,setManualCtx]=useState("");
  const [editCust,setEditCust]=useState(false);
  const [editRid,setEditRid]=useState(null); // null = closed, {} = new, {id:...} = editing
  const [viewingTranscript,setViewingTranscript]=useState(null);
  const [copied,setCopied]=useState(false);
  const [updatesAsc,setUpdatesAsc]=useState(false);
  const [manualSnapshot,setManualSnapshot]=useState([]);
  const [copiedUpdateId,setCopiedUpdateId]=useState(null);
  const [ridSortKey,setRidSortKey]=useState("severity");
  const [ridSortDir,setRidSortDir]=useState("desc");
  const [ridFilterType,setRidFilterType]=useState(null);
  const [ridFilterStatus,setRidFilterStatus]=useState(null);
  const [showProgress,setShowProgress]=useState(true);
  const cRag=deriveCustomerRag(customer.milestones);
  const l1Lookup = buildL1Lookup(customer.milestones);

  const save=ms=>onUpdate({...customer,milestones:ms});

  const cycleL1Status=(l0i,l1Id)=>{
    save(customer.milestones.map((l0,i)=>{
      if(i!==l0i) return l0;
      const nc=l0.children.map(c=>c.id===l1Id?{...c,status:nextStatus(c.status),endDate:nextStatus(c.status)==="complete"&&!c.endDate?today():c.endDate,startDate:!c.startDate&&nextStatus(c.status)==="in-progress"?today():c.startDate}:c);
      return syncL0({...l0, children: nc});
    }));
  };

  const cycleL0Status=(l0i)=>{
    if(customer.milestones[l0i].children.length) return;
    save(customer.milestones.map((m,i)=>i===l0i?{...m,status:nextStatus(m.status),endDate:nextStatus(m.status)==="complete"&&!m.endDate?today():m.endDate,startDate:!m.startDate&&nextStatus(m.status)==="in-progress"?today():m.startDate}:m));
  };

  const handleEditSave=(updated)=>{
    let ms;
    if(editIsL0){
      ms=customer.milestones.map(m=>{
        if(m.id!==updated.id) return m;
        
        // Explicitly include isNA along with the other fields!
        const newL0 = {
          ...m,
          isNA: updated.isNA,
          notes: updated.notes,
          startDate: updated.startDate,
          endDate: updated.endDate,
          pathToGreen: updated.pathToGreen
        };
        
        // If it's N/A, we force it to complete/blue so it doesn't affect calculations.
        // Otherwise, if it has no children, we accept the manual status/rag from the modal.
        if (updated.isNA) {
          newL0.status = "complete";
          newL0.rag = "blue";
        } else if (m.children.length === 0) {
          newL0.status = updated.status;
          newL0.rag = updated.rag;
        }
        
        return newL0;
      });
    } else {
      // Find old endDate for cascading
      let oldEndDate = null;
      customer.milestones.forEach(l0=>l0.children.forEach(c=>{ if(c.id===updated.id) oldEndDate=c.endDate; }));

      ms=customer.milestones.map(l0=>{
        const nc=l0.children.map(c=>c.id===updated.id?updated:c);
        const ch=nc.some((c,i)=>c!==l0.children[i]);
        return ch ? syncL0({...l0, children: nc}) : l0;
      });

      // Cascade date changes to dependents
      if(oldEndDate !== updated.endDate) {
        ms = cascadeDependencies(ms, updated.id, oldEndDate, updated.endDate);
        // Re-derive L0 statuses and dates after cascade
        ms = ms.map(l0 => syncL0(l0));
      }
    }
    save(ms); setEditItem(null);
  };

  const addL1Item=(l0i)=>{
    if(!newL1.trim()) return;
    save(customer.milestones.map((l0,i)=>i!==l0i?l0:syncL0({...l0,children:[...l0.children,mkL1(`l1-${Date.now()}`,newL1.trim())]})));
    setNewL1(""); setAddingL1(null);
  };

  const rmL1=(l0i,l1Id)=>{
    save(customer.milestones.map((l0,i)=>{
      if(i!==l0i) return l0;
      const nc=l0.children.filter(c=>c.id!==l1Id);
      return syncL0({...l0, children: nc});
    }));
  };

  const summarize=async tr=>{
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Summarise this onboarding call transcript in 2-3 sentences, focusing on decisions, blockers, and next steps:\n\n${tr.text}`}]})});const d=await r.json();const s=d.content?.map(b=>b.text||"").join("")||"";onUpdate({...customer,transcripts:customer.transcripts.map(t=>t.id===tr.id?{...t,summary:s}:t)});}catch{}
  };

  const genWeekly=async()=>{
    setGenUp(true); setShowAddUpdate(true); setManualCtx(""); setManualSnapshot(buildSnapshot());
    const mCtx=customer.milestones.map(l0=>{
      const l1s=l0.children.map(c=>`    [L1] ${c.label}: ${c.status} | RAG: ${c.rag} | ${fmtRange(c.startDate,c.endDate)}${c.pathToGreen?` | P2G: ${c.pathToGreen}`:""}${c.notes?` | ${c.notes}`:""}`).join("\n");
      return `[L0] ${l0.label}: ${l0.status} | RAG: ${l0.rag.toUpperCase()} | ${fmtRange(l0.startDate,l0.endDate)} (${getL0Progress(l0)}%)${l0.pathToGreen?`\n    Path to Green: ${l0.pathToGreen}`:""}${l0.notes?` | ${l0.notes}`:""}\n${l1s}`;
    }).join("\n");
    const tCtx=customer.transcripts.slice(-5).map(t=>`Call: ${t.title} (${t.date})\n${t.summary||t.text.slice(0,500)}`).join("\n\n");
    const prev=customer.weeklyUpdates.slice(-3).map(u=>`[${u.date}]\n${u.context||u.text||""}`).join("\n\n");
    const prompt=`You are a senior onboarding manager at Cloudsmith. Generate a weekly status update for ${customer.name}.\n\nCustomer: ${customer.name} (${customer.tier}) | Stakeholder: ${customer.stakeholder}\nTimeline: ${customer.startDate} | Overall RAG: ${cRag.toUpperCase()}\nProgress: ${getTotalProgress(customer.milestones)}%\n\nMilestones with date ranges (phases may overlap):\n${mCtx}\n\nRecent Calls:\n${tCtx||"None."}\n${prev?`\nPrevious Updates:\n${prev}`:""}\n\nWrite a professional 150-250 word weekly status update narrative:\n1. State overall RAG and current phase(s) — note any running in parallel\n2. Highlight accomplishments (reference specific L1s)\n3. For Amber/Red items: state the issue AND Path to Green actions\n4. Next steps for the coming week\n5. Escalation items if any Red milestones exist\n\nDirect, clear tone for leadership. Use GREEN/AMBER/RED labels. Short paragraphs, no bullets. Do NOT repeat the milestone list — that is shown separately above your text.`;
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});const d=await r.json();const txt=d.content?.map(b=>b.text||"").join("")||"Failed.";setManualCtx(txt);}catch{setManualCtx("Error generating update.");}
    setGenUp(false);
  };

  const buildSnapshot=()=>customer.milestones.filter(l0=>!l0.isNA).map(l0=>({label:l0.label,status:l0.status,rag:l0.rag,endDate:l0.endDate}));

  const saveManualUpdate=()=>{
    const update={id:"u"+Date.now(),date:manualDate,milestoneSnapshot:manualSnapshot,context:manualCtx};
    onUpdate({...customer,weeklyUpdates:[...customer.weeklyUpdates,update]});
    setShowAddUpdate(false); setManualCtx(""); setManualDate(today()); setManualSnapshot([]);
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
        <div style={{fontSize:"12.5px",color:"#6b7088",marginTop:"3px"}}>{customer.industry&&<span>{customer.industry} &middot; </span>}{customer.onboardingManager&&<span>{customer.onboardingManager} &middot; </span>}{customer.stakeholder} &middot; {fmtDate(customer.startDate)} &rarr; {fmtDate(customer.targetDate)} &middot; {getTotalProgress(customer.milestones)}% complete{customer.forecastCompletion&&customer.baselineCompletion&&customer.forecastCompletion!==customer.baselineCompletion&&<span style={{color:"#f59e0b"}}> &middot; Forecast: {fmtDate(customer.forecastCompletion)}</span>}</div>
        <div style={{display:"flex",gap:"8px",marginTop:"6px"}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setEditCust(true)}>Edit details</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>copyStatusUpdate(customer).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);})}>{copied?"✓ Copied":"Copy Status Update"}</button>
        </div>
      </div>
    </div>

{/* Phase RAG bar */}
    <div style={{display:"flex",gap:"3px",marginBottom:"18px"}}>
      {customer.milestones.map(l0=>{
        if (l0.isNA) return (
          <div key={l0.id} style={{flex:1,display:"flex",flexDirection:"column",gap:"4px"}} title={`${l0.label}: N/A`}>
            <div style={{height:"6px",background:"#1e2230",borderRadius:"3px",opacity:0.5}} />
            <div style={{fontSize:"9px",color:"#464b5e",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l0.label}</div>
          </div>
        );
        return (
          <div key={l0.id} style={{flex:1,display:"flex",flexDirection:"column",gap:"4px"}} title={`${l0.label}: ${RAG_LABELS[l0.rag]} (${getL0Progress(l0)}%)`}>
            <div style={{height:"6px",background:"#1e2230",borderRadius:"3px",overflow:"hidden"}}><div style={{width:`${getL0Progress(l0)}%`,height:"100%",background:RAG_COLORS[l0.rag],borderRadius:"3px",transition:"width 0.4s"}} /></div>
            <div style={{fontSize:"9px",color:"#6b7088",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l0.label}</div>
          </div>
        );
      })}
    </div>

 <div className="tabs">
      {/* Group 1: Core Project Tracking */}
      <button className={`tab ${tab==="plan"?"active":""}`} onClick={()=>setTab("plan")}>Plan</button>
      <button className={`tab ${tab==="milestones"?"active":""}`} onClick={()=>setTab("milestones")}>Milestones</button>
      <button className={`tab ${tab==="rids"?"active":""}`} onClick={()=>setTab("rids")}>RIDs ({(customer.rids||[]).filter(r=>r.status!=="Closed").length})</button>
      
      {/* Visual Separator */}
      <div style={{ width: "1px", background: "#2e3348", margin: "4px 6px", borderRadius: "1px" }} />
      
      {/* Group 2: Communications & History */}
      <button className={`tab ${tab==="transcripts"?"active":""}`} onClick={()=>setTab("transcripts")}>Transcripts ({customer.transcripts.length})</button>
      <button className={`tab ${tab==="weekly"?"active":""}`} onClick={()=>setTab("weekly")}>Updates ({customer.weeklyUpdates.length})</button>
    </div>

    {/* ── PLAN ── */}
    {tab==="plan"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginBottom:"14px",alignItems:"center"}}>
        <button className={`btn btn-sm ${showProgress?"btn-primary":"btn-ghost"}`} onClick={()=>setShowProgress(p=>!p)} style={{fontSize:"11px"}}>{showProgress?"Progress":"RAG Status"}</button>
        <span style={{width:"1px",height:"18px",background:"#2e3348"}} />
        <button className="btn btn-ghost btn-sm" onClick={()=>exportGanttSVG(customer)}>{"\u2B07"} Export SVG</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>exportGanttPNG(customer)}>{"\u2B07"} Export PNG</button>
      </div>
      <CustomerGantt customer={customer} showProgress={showProgress} />
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
        const open=expanded.has(l0i); 
        const prog=l0.isNA ? 100 : getL0Progress(l0);
        return <div key={l0.id} className="l0-phase" style={{animationDelay:`${l0i*0.05}s`,borderColor:(l0.rag==="amber"||l0.rag==="red")&&!l0.isNA?`${RAG_COLORS[l0.rag]}30`:undefined, opacity: l0.isNA ? 0.6 : 1}}>
          <button className="l0-header" onClick={()=>setExpanded(p=>{const n=new Set(p);n.has(l0i)?n.delete(l0i):n.add(l0i);return n;})}>
            <button className={`milestone-check ${l0.isNA ? 'complete' : l0.status}`} onClick={e=>{e.stopPropagation();if(!l0.isNA) cycleL0Status(l0i);}} disabled={l0.isNA} title={l0.isNA?"Not Applicable":l0.children.length?"Auto-derived":"Click to cycle"}><StatusIcon status={l0.isNA?"complete":l0.status} /></button>
            <div className="l0-label">
              <span className="phase-num">{l0i+1}</span>
              <span style={{textDecoration: l0.isNA ? "line-through" : "none"}}>{l0.label}</span>
              {l0.isNA && <span style={{marginLeft:"8px",fontSize:"10px",padding:"2px 6px",background:"#2e3348",borderRadius:"4px",color:"#c5c8d6",fontWeight:600}}>N/A</span>}
              {l0.children.length>0 && !l0.isNA && <span style={{fontSize:"11px",color:"#565b6e"}}>({l0.children.filter(c=>c.status==="complete").length}/{l0.children.length})</span>}
            </div>
            {!l0.isNA ? (
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div className="l0-progress-bar" style={{width:"60px"}}><div className="l0-progress-fill" style={{width:`${prog}%`,background:RAG_COLORS[l0.rag]}} /></div>
                <span style={{fontSize:"11px",color:"#8b8fa3",fontFamily:"'JetBrains Mono',monospace",minWidth:"28px"}}>{prog}%</span>
              </div>
            ) : <div style={{width:"60px"}} />}
            {!l0.isNA ? <span className={`status-pill status-${l0.status}`}>{l0.status.replace("-"," ")}</span> : <span style={{width:"76px"}} />}
            {!l0.isNA ? <RagPill rag={l0.rag} small onClick={e=>{e.stopPropagation();if(!l0.children.length){save(customer.milestones.map((m,i)=>i===l0i?{...m,rag:nextRag(m.rag)}:m));}}} /> : <span style={{width:"70px"}} />}
            <span className={`l0-chevron ${open?"open":""}`}>{"\u25B8"}</span>
          </button>

          {(l0.rag==="amber"||l0.rag==="red")&&!l0.isNA&&<div className={`ptg-bar ptg-bar-${l0.rag}`} style={{cursor:"pointer"}} onClick={()=>{setEditItem(l0);setEditIsL0(true);}} title="Click to edit Path to Green">
            <span className="ptg-label">Path to Green:</span>
            <span className="ptg-text">{l0.pathToGreen||<span style={{fontStyle:"italic",opacity:0.6}}>Click to set path to green...</span>}</span>
          </div>}

          {open&&<div className="l1-container">
            {l0.isNA && <div style={{padding:"8px 10px 14px 32px",fontSize:"12.5px",color:"#8b8fa3",fontStyle:"italic"}}>This phase is marked as Not Applicable and is excluded from progress calculations.</div>}
            {l0.notes&&<div style={{padding:"6px 10px 10px 32px",fontSize:"12px",color:"#6b7088",fontStyle:"italic"}}>{l0.notes}</div>}
            {(l0.startDate||l0.endDate)&&!l0.isNA&&<div style={{padding:"2px 10px 8px 32px",fontSize:"11px",color:"#464b5e",fontFamily:"'JetBrains Mono',monospace"}}>{fmtRange(l0.startDate,l0.endDate)}</div>}
            
            {!l0.isNA && l0.children.map(l1=><div key={l1.id}>
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
            </div>)}
            {!l0.isNA && (addingL1===l0i?<div className="inline-add">
              <input className="input" value={newL1} onChange={e=>setNewL1(e.target.value)} placeholder="Sub-milestone name..." autoFocus onKeyDown={e=>{if(e.key==="Enter")addL1Item(l0i);if(e.key==="Escape"){setAddingL1(null);setNewL1("");}}} style={{flex:1}} />
              <button className="btn btn-primary btn-sm" onClick={()=>addL1Item(l0i)}>Add</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setAddingL1(null);setNewL1("");}}>Cancel</button>
            </div>:<button className="add-l1-btn" onClick={()=>setAddingL1(l0i)}>+ Add sub-milestone</button>)}
            <div style={{padding:"4px 10px 2px 32px"}}><button style={{background:"none",border:"none",color:"#464b5e",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setEditItem(l0);setEditIsL0(true);}}>Edit phase details</button></div>
          </div>}
        </div>;
      })}
    </div>}

    {tab==="transcripts"&&<div>
      <div className="gong-notice"><strong>Gong Integration:</strong> In production, connects to Gong API (v2/calls) to auto-import. Paste manually for now.</div>
      <div style={{marginBottom:"12px"}}><button className="btn btn-primary" onClick={()=>setShowAddTr(true)}>+ Add Transcript</button></div>
      {!customer.transcripts.length?<div className="empty-state"><div className="empty-state-icon">{"\uD83C\uDF99"}</div><div className="empty-state-text">No transcripts yet.</div></div>:
      <div className="transcript-list">{customer.transcripts.map(t=><div key={t.id} className="transcript-item" style={{cursor:"pointer"}} onClick={()=>setViewingTranscript(t)}>
        <span className="transcript-date">{fmtDate(t.date)}</span>
        <div style={{flex:1}}><div className="transcript-title">{t.title}</div><div className="transcript-summary">{t.summary||<span style={{fontStyle:"italic",color:"#464b5e"}}>No summary yet</span>}</div></div>
        {!t.summary&&<button className="btn btn-ghost" style={{fontSize:"11px",whiteSpace:"nowrap"}} onClick={e=>{e.stopPropagation();summarize(t);}}>{"\u2726"} Summarise</button>}
      </div>)}</div>}
    {viewingTranscript&&<div className="modal-overlay" onClick={()=>setViewingTranscript(null)}><div className="modal" style={{maxWidth:"680px",width:"100%"}} onClick={e=>e.stopPropagation()}>
      <div className="modal-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{viewingTranscript.title}</span>
        <button className="btn btn-ghost btn-sm" onClick={()=>setViewingTranscript(null)}>✕</button>
      </div>
      <div style={{fontSize:"11px",color:"#6b7088",marginBottom:"12px"}}>{fmtDate(viewingTranscript.date)}</div>
      {viewingTranscript.summary&&<div style={{marginBottom:"16px",padding:"10px 12px",background:"#1a1d28",borderRadius:"6px",fontSize:"12.5px",color:"#c5c8d6",lineHeight:1.6,borderLeft:"3px solid #6366f1"}}>
        <div style={{fontSize:"10px",fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"6px"}}>Summary</div>
        {viewingTranscript.summary}
      </div>}
      <div style={{fontSize:"10px",fontWeight:700,color:"#6b7088",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"8px"}}>Full Transcript</div>
      <div style={{fontSize:"12.5px",color:"#c5c8d6",lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:"480px",overflowY:"auto",padding:"12px",background:"#1a1d28",borderRadius:"6px"}}>{viewingTranscript.text}</div>
    </div></div>}
    </div>}

    {tab==="weekly"&&(()=>{
      const fmtSlash=d=>{if(!d)return"TBD";const dt=new Date(d);return`${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;};
      const statusLabel=s=>s==="complete"?"Complete":s==="in-progress"?"In Progress":"Not Started";
      const RAG_STATUS_COLOR={blue:"#3b82f6",green:"#22c55e",amber:"#f59e0b",red:"#ef4444"};
      const snapColor=m=>m.status==="upcoming"?"#565b6e":(RAG_STATUS_COLOR[m.rag]||"#565b6e");

      const SnapshotRow=({m})=>{
        const c=snapColor(m);
        return <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"6px 0",borderBottom:"1px solid #1a1d28"}}>
          <span style={{width:"9px",height:"9px",borderRadius:"50%",background:c,flexShrink:0,boxShadow:`0 0 5px ${c}70`}} />
          <span style={{flex:1,fontSize:"12.5px",color:"#c5c8d6"}}>{m.label}</span>
          <span style={{fontSize:"10px",padding:"2px 7px",borderRadius:"4px",background:`${c}18`,color:c,fontWeight:700,letterSpacing:"0.3px"}}>{statusLabel(m.status)}</span>
          <span style={{fontSize:"11px",color:"#6b7088",fontFamily:"'JetBrains Mono',monospace",minWidth:"72px",textAlign:"right"}}>{fmtSlash(m.endDate)}</span>
        </div>;
      };

      const EditableSnapshotRow=({m,onChange})=>{
        const c=snapColor(m);
        const sel={background:"#1a1d28",border:"1px solid #2e3348",borderRadius:"4px",color:"#c5c8d6",fontSize:"11px",padding:"2px 5px",cursor:"pointer"};
        return <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",borderBottom:"1px solid #1a1d28"}}>
          <span style={{width:"9px",height:"9px",borderRadius:"50%",background:c,flexShrink:0,boxShadow:`0 0 5px ${c}70`}} />
          <span style={{flex:1,fontSize:"12.5px",color:"#c5c8d6"}}>{m.label}</span>
          <select style={sel} value={m.status} onChange={e=>{const s=e.target.value;onChange({...m,status:s,rag:s==="upcoming"?"green":s==="complete"?"blue":m.rag==="blue"?"green":m.rag});}}>
            <option value="upcoming">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
          {m.status!=="upcoming"&&<select style={sel} value={m.rag} onChange={e=>onChange({...m,rag:e.target.value})}>
            <option value="green">Green</option>
            <option value="amber">Amber</option>
            <option value="red">Red</option>
            <option value="blue">Blue (Done)</option>
          </select>}
          <input type="date" value={m.endDate||""} onChange={e=>onChange({...m,endDate:e.target.value})} style={{...sel,width:"130px",fontFamily:"'JetBrains Mono',monospace"}} />
        </div>;
      };

      const copyUpdate=(u,uid)=>{
        const EMOJI={blue:"🔵",green:"🟢",amber:"🟠",red:"🔴"};
        const lines=(u.milestoneSnapshot||[]).map(m=>{
          const emoji=m.status==="upcoming"?"⚪":(EMOJI[m.rag]||"⚪");
          return `${emoji} ${m.label} | ${statusLabel(m.status)} | ${fmtSlash(m.endDate)}`;
        });
        const ctx=u.context||u.text||"";
        const full=[...lines,...(ctx?["",ctx]:[])].join("\n");
        navigator.clipboard.writeText(full).then(()=>{setCopiedUpdateId(uid);setTimeout(()=>setCopiedUpdateId(null),2000);}).catch(()=>{});
      };

      const sorted=[...customer.weeklyUpdates].sort((a,b)=>updatesAsc?new Date(a.date)-new Date(b.date):new Date(b.date)-new Date(a.date));

      return <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        {/* Toolbar */}
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {!showAddUpdate&&<>
            <button className="btn btn-primary" onClick={()=>{setShowAddUpdate(true);setManualDate(today());setManualCtx("");setManualSnapshot(buildSnapshot());}}>+ Add Update</button>
            <button className="btn btn-ghost" onClick={genWeekly} disabled={genUp}>{genUp?"Generating…":"✦ Generate with AI"}</button>
          </>}
          <div style={{flex:1}} />
          {customer.weeklyUpdates.length>1&&<button className="btn btn-ghost btn-sm" onClick={()=>setUpdatesAsc(a=>!a)} style={{fontSize:"11px"}}>{updatesAsc?"Oldest first ↑":"Newest first ↓"}</button>}
        </div>

        {/* Composer */}
        {showAddUpdate&&<div className="card">
          <div className="card-header">
            <span className="card-title">New Update</span>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <label style={{fontSize:"12px",color:"#6b7088"}}>Date</label>
              <input className="input" type="date" value={manualDate} onChange={e=>setManualDate(e.target.value)} style={{width:"140px",padding:"4px 8px",fontSize:"12px"}} />
            </div>
          </div>
          <div style={{fontSize:"11px",fontWeight:600,color:"#6b7088",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"6px"}}>Milestone Status</div>
          <div style={{marginBottom:"14px"}}>
            {manualSnapshot.map((m,i)=><EditableSnapshotRow key={i} m={m} onChange={nm=>setManualSnapshot(prev=>prev.map((r,j)=>j===i?nm:r))} />)}
          </div>
          <div style={{fontSize:"11px",fontWeight:600,color:"#6b7088",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"6px"}}>Context</div>
          {genUp&&<div className="generating"><div className="generating-dot" />Generating narrative...</div>}
          <textarea className="textarea" value={manualCtx} onChange={e=>setManualCtx(e.target.value)} placeholder="Add context, blockers, next steps, escalations..." style={{minHeight:"120px",marginBottom:"12px"}} />
          <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
            <button className="btn btn-ghost" onClick={genWeekly} disabled={genUp}>{genUp?"Generating…":"✦ Generate with AI"}</button>
            <button className="btn btn-ghost" onClick={()=>{setShowAddUpdate(false);setManualCtx("");setManualSnapshot([]);}}>Cancel</button>
            <button className="btn btn-primary" disabled={!manualCtx.trim()} onClick={saveManualUpdate}>Save Update</button>
          </div>
        </div>}

        {/* Update list */}
        {!customer.weeklyUpdates.length&&!showAddUpdate&&<div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No updates yet.</div></div>}
        {sorted.map((u,i)=>{
          const uid=u.id||i;
          const hasSnap=!!u.milestoneSnapshot?.length;
          const isCopied=copiedUpdateId===uid;
          return <div key={uid} className="card">
            <div className="card-header">
              <span className="card-title">Update — {fmtDate(u.date)}</span>
              {hasSnap&&<button className="btn btn-ghost btn-sm" style={{fontSize:"11px"}} onClick={()=>copyUpdate(u,uid)}>{isCopied?"✓ Copied":"Copy"}</button>}
            </div>
            {hasSnap&&<div style={{marginBottom:"8px"}}>{u.milestoneSnapshot.map((m,j)=><SnapshotRow key={j} m={m} />)}</div>}
            {(u.context||u.text)&&<div className="update-output" style={{marginTop:hasSnap?"8px":0}}>{u.context||u.text}</div>}
          </div>;
        })}
      </div>;
    })()}

    {tab==="rids"&&(()=>{
      const rids = customer.rids || [];
      const toggle = (cur,v) => cur===v?null:v;

      // Build milestone lookup
      const msLookup = {};
      customer.milestones.forEach(l0 => { msLookup[l0.id] = l0.label; l0.children.forEach(l1 => { msLookup[l1.id] = l1.label; }); });

      // Filter
      let filtered = rids;
      if(ridFilterType) filtered = filtered.filter(r=>r.type===ridFilterType);
      if(ridFilterStatus) filtered = filtered.filter(r=>r.status===ridFilterStatus);

      // Sort
      const sevOrder = { Critical:0, High:1, Medium:2, Low:3 };
      const statOrder = { Open:0, Mitigated:1, Closed:2 };
      const sorted = [...filtered].sort((a,b)=>{
        let av,bv;
        switch(ridSortKey){
          case "type": av=a.type; bv=b.type; break;
          case "title": av=a.title.toLowerCase(); bv=b.title.toLowerCase(); break;
          case "severity": av=sevOrder[a.severity]; bv=sevOrder[b.severity]; break;
          case "status": av=statOrder[a.status]; bv=statOrder[b.status]; break;
          case "owner": av=(a.owner||"").toLowerCase(); bv=(b.owner||"").toLowerCase(); break;
          case "milestone": av=(msLookup[a.linkedMilestone]||"").toLowerCase(); bv=(msLookup[b.linkedMilestone]||"").toLowerCase(); break;
          case "date": av=a.createdDate||""; bv=b.createdDate||""; break;
          default: av=a.title; bv=b.title;
        }
        if(av<bv) return ridSortDir==="asc"?-1:1;
        if(av>bv) return ridSortDir==="asc"?1:-1;
        return 0;
      });

      const handleRidSort = k => { if(ridSortKey===k) setRidSortDir(d=>d==="asc"?"desc":"asc"); else { setRidSortKey(k); setRidSortDir(k==="severity"?"desc":"asc"); } };
      const SortTh = ({k,children}) => <th className={ridSortKey===k?"sorted":""} onClick={()=>handleRidSort(k)}>{children}<span className="sort-arrow">{ridSortKey===k?(ridSortDir==="asc"?"\u25B2":"\u25BC"):""}</span></th>;

      const handleRidSave = (rid) => {
        const existing = rids.find(r=>r.id===rid.id);
        const newRids = existing ? rids.map(r=>r.id===rid.id?rid:r) : [...rids, rid];
        onUpdate({...customer, rids: newRids});
        setEditRid(null);
      };
      const handleRidDelete = (id) => {
        onUpdate({...customer, rids: rids.filter(r=>r.id!==id)});
        setEditRid(null);
      };

      const openCount = rids.filter(r=>r.status==="Open").length;
      const critCount = rids.filter(r=>r.severity==="Critical"&&r.status!=="Closed").length;

      return <div>
        {/* Summary chips */}
        <div style={{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"center"}}>
          <span style={{fontSize:"13px",color:"#c5c8d6"}}>{rids.length} total</span>
          {openCount>0&&<span style={{fontSize:"12px",color:"#ef4444",background:"rgba(239,68,68,0.08)",padding:"3px 8px",borderRadius:"4px"}}>{openCount} open</span>}
          {critCount>0&&<span style={{fontSize:"12px",color:"#dc2626",background:"rgba(220,38,38,0.08)",padding:"3px 8px",borderRadius:"4px"}}>{critCount} critical</span>}
          <div style={{marginLeft:"auto"}}><button className="btn btn-primary btn-sm" onClick={()=>setEditRid({})}>+ Add RID</button></div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <span className="filter-label">Type</span>
          {RID_TYPES.map(t=><button key={t} className={`filter-chip ${ridFilterType===t?"active":""}`} onClick={()=>setRidFilterType(toggle(ridFilterType,t))}>{t}</button>)}
          <div className="filter-sep" />
          <span className="filter-label">Status</span>
          {RID_STATUSES.map(s=><button key={s} className={`filter-chip ${ridFilterStatus===s?"active":""}`} onClick={()=>setRidFilterStatus(toggle(ridFilterStatus,s))}>{s}</button>)}
          {(ridFilterType||ridFilterStatus)&&<button className="filter-chip" style={{color:"#818cf8",borderColor:"#6366f1"}} onClick={()=>{setRidFilterType(null);setRidFilterStatus(null);}}>Clear</button>}
        </div>

        {/* Table */}
        <div style={{overflowX:"auto"}}>
          <table className="ptable">
            <thead><tr>
              <SortTh k="type">Type</SortTh>
              <SortTh k="severity">Severity</SortTh>
              <SortTh k="title">Title</SortTh>
              <SortTh k="status">Status</SortTh>
              <SortTh k="milestone">Linked Milestone</SortTh>
              <SortTh k="owner">Owner</SortTh>
              <SortTh k="date">Created</SortTh>
              <th style={{cursor:"default"}}></th>
            </tr></thead>
            <tbody>
              {sorted.map(r=><tr key={r.id} className="clickable" onClick={()=>setEditRid(r)}>
                <td><span className={`rid-type rid-type-${r.type.toLowerCase()}`}>{r.type}</span></td>
                <td><span className="rid-sev" style={{background:`${RID_SEV_COLORS[r.severity]}15`,color:RID_SEV_COLORS[r.severity]}}>{r.severity}</span></td>
                <td style={{whiteSpace:"normal",maxWidth:"280px",lineHeight:1.4}}>{r.title}</td>
                <td><span className={`status-pill rid-status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>{r.linkedMilestone?<span className="rid-link" title={msLookup[r.linkedMilestone]||r.linkedMilestone}>{msLookup[r.linkedMilestone]||"\u2014"}</span>:<span className="mono" style={{color:"#464b5e"}}>{"\u2014"}</span>}</td>
                <td style={{color:"#8b8fa3"}}>{r.owner||"\u2014"}</td>
                <td className="mono">{fmtDate(r.createdDate)}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setEditRid(r);}}>Edit</button></td>
              </tr>)}
              {sorted.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:"32px",color:"#464b5e"}}>{rids.length===0?"No risks, issues or dependencies logged yet":"No RIDs match filters"}</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{fontSize:"11px",color:"#464b5e",marginTop:"10px"}}>{sorted.length} of {rids.length} RIDs shown</div>
      </div>;
    })()}

    {editRid!==null&&<EditRidModal rid={editRid.id?editRid:null} milestones={customer.milestones} onClose={()=>setEditRid(null)} onSave={rid=>{const rids=customer.rids||[];const existing=rids.find(r=>r.id===rid.id);onUpdate({...customer,rids:existing?rids.map(r=>r.id===rid.id?rid:r):[...rids,rid]});setEditRid(null);}} onDelete={id=>{onUpdate({...customer,rids:(customer.rids||[]).filter(r=>r.id!==id)});setEditRid(null);}} />}
    {editItem&&<EditMilestoneModal item={editItem} isL0={editIsL0} onClose={()=>setEditItem(null)} onSave={handleEditSave} allMilestones={customer.milestones} />}
    {showAddTr&&<AddTranscriptModal onClose={()=>setShowAddTr(false)} onAdd={t=>{onUpdate({...customer,transcripts:[...customer.transcripts,t]});setShowAddTr(false);}} />}
    {editCust&&<EditCustomerModal customer={customer} onClose={()=>setEditCust(false)} onSave={u=>{onUpdate(u);setEditCust(false);}} tiers={tiers} industries={industries} />}
  </div>;
}

function ComplexityBadge({ complexity }) {
  const k = complexity || "M";
  return <span className={`complexity-badge complexity-${k}`}>{k}</span>;
}

function CapacityView({ customers, complexityConfig, onUpdateComplexity, onSelectCustomer, onUpdateCustomer }) {
  const [cfg, setCfg] = useState([...complexityConfig]);
  const [dirty, setDirty] = useState(false);
  const COMPLEXITY_COLORS = {S:"#22c55e",M:"#0ea5e9",L:"#8b5cf6",XL:"#f59e0b",XXL:"#ef4444"};

  const cfgRow = key => cfg.find(r => r.key === key) || { capPct: 10, maxConcurrent: 6, hoursPerWeek: 4 };
  const isActive = c => getTotalProgress(c.milestones) < 100;
  const active = customers.filter(isActive);
  const managers = [...new Set(customers.map(c => c.onboardingManager || "Unassigned"))].sort();

  const updateCfg = (key, field, val) => {
    setCfg(prev => prev.map(r => r.key === key ? { ...r, [field]: Math.max(1, +val || 1) } : r));
    setDirty(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Capacity Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Complexity Capacity Table</span>
          <div style={{ display: "flex", gap: "8px" }}>
            {dirty && <button className="btn btn-primary btn-sm" onClick={() => { onUpdateComplexity(cfg); setDirty(false); }}>Save changes</button>}
            <button className="btn btn-ghost btn-sm" onClick={() => { setCfg([...DEFAULT_COMPLEXITY]); setDirty(true); }}>Reset defaults</button>
          </div>
        </div>
        <p style={{ fontSize: "12.5px", color: "#6b7088", marginBottom: "14px", lineHeight: 1.5 }}>
          Define how much capacity each complexity tier consumes per onboarding manager. Click any value to edit.
        </p>
        <table className="cap-table">
          <thead>
            <tr>
              <th>Complexity</th>
              <th>Max concurrent</th>
              <th>Capacity % per onboarding</th>
              <th>Hours / week per onboarding</th>
            </tr>
          </thead>
          <tbody>
            {cfg.map(row => (
              <tr key={row.key}>
                <td><ComplexityBadge complexity={row.key} /></td>
                <td><input className="cap-input" type="number" min={1} max={20} value={row.maxConcurrent} onChange={e => updateCfg(row.key, "maxConcurrent", e.target.value)} /></td>
                <td><div style={{ display: "flex", alignItems: "center", gap: "4px" }}><input className="cap-input" type="number" min={1} max={100} value={row.capPct} onChange={e => updateCfg(row.key, "capPct", e.target.value)} /><span style={{ fontSize: "12px", color: "#6b7088" }}>%</span></div></td>
                <td><div style={{ display: "flex", alignItems: "center", gap: "4px" }}><input className="cap-input" type="number" min={1} max={80} value={row.hoursPerWeek} onChange={e => updateCfg(row.key, "hoursPerWeek", e.target.value)} /><span style={{ fontSize: "12px", color: "#6b7088" }}>hrs</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-manager cards */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#c5c8d6", marginBottom: "12px" }}>Manager Capacity</div>
        <div className="manager-grid">
          {managers.map(mgr => {
            const mgrActive = active.filter(c => (c.onboardingManager || "Unassigned") === mgr);
            const mgrAll = customers.filter(c => (c.onboardingManager || "Unassigned") === mgr);
            const totalCap = mgrActive.reduce((s, c) => s + cfgRow(c.complexity || "M").capPct, 0);
            const totalHrs = mgrActive.reduce((s, c) => s + cfgRow(c.complexity || "M").hoursPerWeek, 0);
            const capColor = totalCap >= 100 ? "#ef4444" : totalCap >= 75 ? "#f59e0b" : "#22c55e";
            const overCap = mgrActive.some(c => {
              const maxC = cfgRow(c.complexity || "M").maxConcurrent;
              return mgrActive.filter(x => (x.complexity || "M") === (c.complexity || "M")).length > maxC;
            });

            return (
              <div key={mgr} className="card">
                <div className="card-header" style={{ marginBottom: "10px" }}>
                  <span className="card-title">{mgr}</span>
                  <span style={{ fontSize: "12px", color: capColor, fontWeight: 700 }}>{totalCap}%</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "#6b7088" }}>{mgrActive.length} active · {mgrAll.length - mgrActive.length} complete · {totalHrs} hrs/wk</span>
                    <span style={{ fontSize: "11px", color: capColor, fontWeight: 600 }}>{totalCap}% capacity</span>
                  </div>
                  <div className="cap-bar-track">
                    <div className="cap-bar-fill" style={{ width: `${Math.min(totalCap, 100)}%`, background: capColor }} />
                  </div>
                </div>
                {mgrActive.length === 0
                  ? <div style={{ fontSize: "12px", color: "#464b5e", fontStyle: "italic" }}>No active onboardings</div>
                  : mgrActive.map(c => {
                    const cx = c.complexity || "M";
                    const row = cfgRow(cx);
                    const cRag = deriveCustomerRag(c.milestones);
                    const prog = getTotalProgress(c.milestones);
                    const cxColor = COMPLEXITY_COLORS[cx] || "#6b7088";
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderTop: "1px solid #1a1d28" }}>
                        <select
                          value={cx}
                          onChange={e => onUpdateCustomer({...c, complexity: e.target.value})}
                          onClick={e => e.stopPropagation()}
                          title="Change complexity"
                          style={{ background:`${cxColor}18`, color:cxColor, border:`1px solid ${cxColor}40`, borderRadius:"4px", fontSize:"10px", fontWeight:700, letterSpacing:"0.5px", padding:"2px 5px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", appearance:"none", WebkitAppearance:"none" }}
                        >
                          {COMPLEXITY_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onSelectCustomer(c.id)}>
                          <div style={{ fontSize: "12.5px", color: "#c5c8d6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: "#6b7088" }}>{row.capPct}% · {row.hoursPerWeek}h/wk</div>
                        </div>
                        <span className="rag-dot" style={{ background: RAG_COLORS[cRag], flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "#8b8fa3", fontFamily: "'JetBrains Mono',monospace", minWidth: "28px", textAlign: "right" }}>{prog}%</span>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: "11px", flexShrink: 0 }} onClick={() => onSelectCustomer(c.id)}>View →</button>
                      </div>
                    );
                  })
                }
                {overCap && <div className="over-cap-warning">⚠ Exceeds max concurrent for one or more complexity tiers</div>}
                {totalCap > 100 && <div className="over-cap-warning">⚠ Over capacity — {totalCap - 100}% above limit</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Metrics ───
function MetricsView({ customers, industries }) {
  const [filterComplexity,setFilterComplexity]=useState(null);
  const [filterIndustry,setFilterIndustry]=useState(null);

  const daysBetween=(a,b)=>{if(!a||!b)return null;const da=new Date(a),db=new Date(b);if(isNaN(da)||isNaN(db))return null;return Math.round((db-da)/86400000);};

  const filtered=customers.filter(c=>{
    if(filterComplexity&&c.complexity!==filterComplexity)return false;
    if(filterIndustry&&c.industry!==filterIndustry)return false;
    return true;
  });

  const completed=filtered.filter(c=>getTotalProgress(c.milestones)===100);
  const active=filtered.filter(c=>getTotalProgress(c.milestones)<100);

  // RAG distribution
  const ragCounts={green:0,amber:0,red:0,blue:0};
  filtered.forEach(c=>{ragCounts[deriveCustomerRag(c.milestones)]++;});

  // Phase durations — completed phases only
  const phaseDurMap={};
  filtered.forEach(c=>{
    c.milestones.forEach(l0=>{
      if(l0.status==="complete"&&l0.startDate&&l0.endDate&&!l0.isNA){
        const d=daysBetween(l0.startDate,l0.endDate);
        if(d!==null&&d>=0){
          if(!phaseDurMap[l0.label])phaseDurMap[l0.label]=[];
          phaseDurMap[l0.label].push(d);
        }
      }
    });
  });
  const phaseAvgs=DEFAULT_L0.map(l0=>({
    label:l0.label,color:l0.color,
    vals:phaseDurMap[l0.label]||[],
  })).map(p=>({...p,avg:p.vals.length?Math.round(p.vals.reduce((s,v)=>s+v,0)/p.vals.length):null}))
    .filter(p=>p.avg!==null);
  const maxPhaseAvg=Math.max(...phaseAvgs.map(p=>p.avg),1);

  // Avg overall completion for completed onboardings
  const completedDurations=completed.map(c=>daysBetween(c.startDate,c.forecastCompletion||c.targetDate)).filter(d=>d!==null&&d>0);
  const avgCompletionDays=completedDurations.length?Math.round(completedDurations.reduce((s,v)=>s+v,0)/completedDurations.length):null;

  // Duration by complexity (use forecast/target as end proxy for all, actual end for completed)
  const byComplexity={};
  filtered.forEach(c=>{
    const end=getTotalProgress(c.milestones)===100?(c.forecastCompletion||c.targetDate):(c.forecastCompletion||c.targetDate);
    const d=daysBetween(c.startDate,end);
    if(d!==null&&d>0&&c.complexity){(byComplexity[c.complexity]=byComplexity[c.complexity]||[]).push(d);}
  });
  const complexityAvgs=COMPLEXITY_KEYS.map(k=>({key:k,count:(byComplexity[k]||[]).length,avg:(byComplexity[k]||[]).length?Math.round((byComplexity[k]||[]).reduce((s,v)=>s+v,0)/(byComplexity[k]||[]).length):null})).filter(x=>x.avg!==null);
  const maxComplexityAvg=Math.max(...complexityAvgs.map(x=>x.avg),1);

  // Slip counts
  const slipped=active.filter(c=>getSlipDays(c)>0).length;
  const onTrack=active.filter(c=>getSlipDays(c)<=0).length;

  // Industry breakdown
  const byIndustry={};
  filtered.forEach(c=>{const ind=c.industry||"Unknown";byIndustry[ind]=(byIndustry[ind]||0)+1;});
  const maxInd=Math.max(...Object.values(byIndustry),1);

  const CMPLX_COLORS={S:"#22c55e",M:"#0ea5e9",L:"#8b5cf6",XL:"#f59e0b",XXL:"#ef4444"};
  const presentIndustries=[...new Set(customers.map(c=>c.industry).filter(Boolean))].sort();

  return <div>
    {/* Filters */}
    <div className="filter-bar" style={{marginBottom:"24px",flexWrap:"wrap"}}>
      <span className="filter-label">Complexity</span>
      {COMPLEXITY_KEYS.map(k=><button key={k} className={`filter-chip ${filterComplexity===k?"active":""}`} onClick={()=>setFilterComplexity(filterComplexity===k?null:k)}>{k}</button>)}
      {presentIndustries.length>0&&<><div className="filter-sep"/><span className="filter-label">Industry</span>
      {presentIndustries.map(ind=><button key={ind} className={`filter-chip ${filterIndustry===ind?"active":""}`} onClick={()=>setFilterIndustry(filterIndustry===ind?null:ind)}>{ind}</button>)}</>}
      {(filterComplexity||filterIndustry)&&<button className="filter-chip" style={{color:"#818cf8",borderColor:"#6366f1"}} onClick={()=>{setFilterComplexity(null);setFilterIndustry(null);}}>Clear filters</button>}
    </div>

    {/* KPI strip */}
    <div className="stats-grid" style={{marginBottom:"24px"}}>
      <div className="stat-card">
        <div className="stat-value">{filtered.length}</div>
        <div className="stat-label">Onboardings</div>
        <div style={{fontSize:"11px",color:"#464b5e",marginTop:"4px"}}>{active.length} active &middot; {completed.length} complete</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{avgCompletionDays!==null?`${avgCompletionDays}d`:"—"}</div>
        <div className="stat-label">Avg Completion Time</div>
        <div style={{fontSize:"11px",color:"#464b5e",marginTop:"4px"}}>{completed.length} completed onboarding{completed.length!==1?"s":""}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{color:slipped>0?"#f59e0b":"#22c55e"}}>{onTrack}</div>
        <div className="stat-label">Active On Track</div>
        <div style={{fontSize:"11px",color:"#464b5e",marginTop:"4px"}}>{slipped} slipped</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{filtered.length?`${Math.round((ragCounts.green+ragCounts.blue)/filtered.length*100)}%`:"—"}</div>
        <div className="stat-label">Green / Blue RAG</div>
        <div style={{fontSize:"11px",color:"#464b5e",marginTop:"4px"}}>{ragCounts.amber} amber &middot; {ragCounts.red} red</div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
      {/* Phase avg duration */}
      <div className="card">
        <div className="card-header"><span className="card-title">Avg Phase Duration</span><span style={{fontSize:"11px",color:"#464b5e"}}>completed phases only</span></div>
        {phaseAvgs.length===0
          ?<div style={{color:"#464b5e",fontSize:"12px",padding:"12px 0"}}>No completed phases in selection</div>
          :<div style={{display:"flex",flexDirection:"column",gap:"12px",paddingTop:"4px"}}>
            {phaseAvgs.map(p=><div key={p.label}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                <span style={{fontSize:"12px",color:"#c5c8ff"}}>{p.label}</span>
                <span style={{fontSize:"12px",color:"#8b8fa3"}}>{p.avg}d <span style={{fontSize:"10px",color:"#464b5e"}}>({p.vals.length} sample{p.vals.length!==1?"s":""})</span></span>
              </div>
              <div style={{height:"6px",background:"#1e2230",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{width:`${Math.round((p.avg/maxPhaseAvg)*100)}%`,height:"100%",background:p.color,borderRadius:"3px"}}/>
              </div>
            </div>)}
          </div>}
      </div>

      {/* Duration by complexity */}
      <div className="card">
        <div className="card-header"><span className="card-title">Avg Duration by Complexity</span><span style={{fontSize:"11px",color:"#464b5e"}}>forecast or target end date</span></div>
        {complexityAvgs.length===0
          ?<div style={{color:"#464b5e",fontSize:"12px",padding:"12px 0"}}>No data in selection</div>
          :<div style={{display:"flex",flexDirection:"column",gap:"12px",paddingTop:"4px"}}>
            {complexityAvgs.map(x=><div key={x.key}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                <span style={{fontSize:"12px",color:"#c5c8ff"}}>{x.key}</span>
                <span style={{fontSize:"12px",color:"#8b8fa3"}}>{x.avg}d <span style={{fontSize:"10px",color:"#464b5e"}}>({x.count} onboarding{x.count!==1?"s":""})</span></span>
              </div>
              <div style={{height:"6px",background:"#1e2230",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{width:`${Math.round((x.avg/maxComplexityAvg)*100)}%`,height:"100%",background:CMPLX_COLORS[x.key],borderRadius:"3px"}}/>
              </div>
            </div>)}
          </div>}
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
      {/* RAG distribution */}
      <div className="card">
        <div className="card-header"><span className="card-title">RAG Distribution</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",paddingTop:"4px"}}>
          {[["green","Green"],["amber","Amber"],["red","Red"],["blue","Blue"]].map(([r,label])=>{
            const count=ragCounts[r];
            const pct=filtered.length?Math.round((count/filtered.length)*100):0;
            return <div key={r}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                <span style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#c5c8ff"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"50%",background:RAG_COLORS[r],display:"inline-block"}}/>
                  {label}
                </span>
                <span style={{fontSize:"12px",color:"#8b8fa3"}}>{count} <span style={{fontSize:"10px",color:"#464b5e"}}>({pct}%)</span></span>
              </div>
              <div style={{height:"6px",background:"#1e2230",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:RAG_COLORS[r],borderRadius:"3px"}}/>
              </div>
            </div>;
          })}
        </div>
      </div>

      {/* Industry breakdown */}
      <div className="card">
        <div className="card-header"><span className="card-title">Onboardings by Industry</span></div>
        {Object.keys(byIndustry).length===0
          ?<div style={{color:"#464b5e",fontSize:"12px",padding:"12px 0"}}>No industry data in selection</div>
          :<div style={{display:"flex",flexDirection:"column",gap:"10px",paddingTop:"4px"}}>
            {Object.entries(byIndustry).sort((a,b)=>b[1]-a[1]).map(([ind,count])=><div key={ind}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{fontSize:"12px",color:"#c5c8ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"75%"}}>{ind}</span>
                <span style={{fontSize:"12px",color:"#8b8fa3"}}>{count}</span>
              </div>
              <div style={{height:"5px",background:"#1e2230",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{width:`${Math.round((count/maxInd)*100)}%`,height:"100%",background:"#6366f1",borderRadius:"3px"}}/>
              </div>
            </div>)}
          </div>}
      </div>
    </div>

    {/* Phase heatmap */}
    <div className="card">
      <div className="card-header"><span className="card-title">Phase Status Heatmap</span></div>
      <div style={{overflowX:"auto"}}>
        <table className="ptable">
          <thead><tr>
            <th style={{minWidth:"140px"}}>Customer</th>
            <th style={{minWidth:"72px",textAlign:"center",fontSize:"10px",color:"#6b7088"}}>Complexity</th>
            {DEFAULT_L0.map(l0=><th key={l0.id} style={{textAlign:"center",fontSize:"11px",minWidth:"96px",color:l0.color}}>{l0.label}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(c=><tr key={c.id}>
              <td className="name-cell" style={{fontSize:"12px"}}>{c.name}</td>
              <td style={{textAlign:"center"}}><span style={{fontSize:"10px",fontWeight:600,color:"#8b8fa3"}}>{c.complexity||"—"}</span></td>
              {DEFAULT_L0.map(l0=>{
                const phase=c.milestones.find(m=>m.label===l0.label);
                if(!phase||phase.isNA)return<td key={l0.id} style={{textAlign:"center"}}><span style={{fontSize:"10px",color:"#2e3348"}}>N/A</span></td>;
                const d=daysBetween(phase.startDate,phase.endDate);
                return <td key={l0.id} style={{textAlign:"center"}}>
                  <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                    <span className={`rag-pill rag-pill-${phase.rag}`} style={{fontSize:"9px",padding:"1px 6px"}}>
                      <span className="rag-dot rag-dot-sm" style={{background:RAG_COLORS[phase.rag]}}/>
                      {phase.status==="complete"?"Done":phase.status==="in-progress"?"Active":"—"}
                    </span>
                    {d!==null&&phase.status==="complete"&&<span style={{fontSize:"9px",color:"#565b6e"}}>{d}d</span>}
                  </div>
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
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
  const [industries,setIndustries]=useState(DEFAULT_INDUSTRIES);
  const [complexityConfig,setComplexityConfig]=useState(DEFAULT_COMPLEXITY);

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
        <button className={`nav-item ${view==="capacity"?"active":""}`} onClick={()=>setView("capacity")}><span className="nav-icon">◈</span> Capacity</button>
        <button className={`nav-item ${view==="metrics"?"active":""}`} onClick={()=>setView("metrics")}><span className="nav-icon">{"◎"}</span> Metrics</button>
        <button className={`nav-item ${view==="settings"?"active":""}`} onClick={()=>setView("settings")}><span className="nav-icon">{"\u2699"}</span> Settings</button>
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
          <div className="main-title">{view==="customer"&&cur?cur.name:view==="settings"?"Workspace Settings":view==="capacity"?"Capacity Planning":view==="metrics"?"Metrics":"Dashboard"}</div>
          <div className="main-subtitle">
            {view==="dashboard"&&`${customers.length} active onboardings`}
            {view==="customer"&&cur&&`${cur.tier} \u00B7 ${cur.stakeholder}`}
            {view==="settings"&&"Manage default templates and categorization"}
            {view==="capacity"&&`${customers.length} onboardings across ${[...new Set(customers.map(c=>c.onboardingManager||"Unassigned"))].length} managers`}
            {view==="metrics"&&`Aggregated data across ${customers.length} onboarding${customers.length!==1?"s":""}`}
          </div>
        </div>
        {view==="dashboard"&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ New Customer</button>}
      </div>
      <div className="main-body">
        {view==="dashboard"&&<DashboardView customers={customers} onSelectCustomer={id=>{setSelId(id);setView("customer");}} onUpdateCustomer={u=>setCustomers(customers.map(c=>c.id===u.id?u:c))} tiers={tiers} industries={industries} />}
        {view==="customer"&&cur&&<CustomerDetailView customer={cur} onUpdate={u=>setCustomers(customers.map(c=>c.id===u.id?u:c))} tiers={tiers} industries={industries} />}
        {view==="metrics"&&<MetricsView customers={customers} industries={industries} />}
        {view==="capacity"&&<CapacityView customers={customers} complexityConfig={complexityConfig} onUpdateComplexity={setComplexityConfig} onSelectCustomer={id=>{setSelId(id);setView("customer");}} onUpdateCustomer={u=>setCustomers(customers.map(c=>c.id===u.id?u:c))} />}
        
        {/* Settings View - Grouped Phase Template & Tiers */}
        {view==="settings"&&(
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "flex-start" }}>
            <MilestoneSettings milestones={tmpl} onSave={i=>{setTmpl(i);}} onClose={()=>setView("dashboard")} />
            <TierSettings tiers={tiers} onSave={i=>{setTiers(i);}} onClose={()=>setView("dashboard")} />
            <IndustrySettings industries={industries} onSave={i=>{setIndustries(i);}} onClose={()=>setView("dashboard")} />
          </div>
        )}
      </div>
    </div>

    {showAdd&&<AddCustomerModal onClose={()=>setShowAdd(false)} onAdd={nc=>{setCustomers([...customers,nc]);setShowAdd(false);setSelId(nc.id);setView("customer");}} tmpl={tmpl} tiers={tiers} industries={industries} />}
  </div>;
}


// Tell React to render the app inside the <div id="root"> from our index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
