"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiPlus,
} from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import CountUp from "@/components/ui/CountUp";
import EmptyIllustration from "@/components/ui/EmptyIllustration";
import { useAuth } from "@/hooks/useAuth";
import { getBackendUrl } from "@/lib/backend";

const BACKEND_URL = getBackendUrl();

const statCards = [
  { label: "Total Jobs", key: "total_jobs", icon: FiFileText },
  { label: "Drafts Created", key: "drafts", icon: FiEdit3 },
  { label: "In Review", key: "review_jobs", icon: FiBriefcase },
  { label: "Published", key: "published_jobs", icon: FiCheckCircle },
];

/* ---- presentational maps ---- */
const statTileColors = {
  total_jobs: "bg-link-soft text-link ring-1 ring-link-line",
  drafts: "bg-brand-soft text-brand-ink ring-1 ring-brand-line",
  review_jobs: "bg-warning-soft text-warning ring-1 ring-warning-line",
  published_jobs: "bg-success-soft text-success ring-1 ring-success-line",
};

const statTones = {
  total_jobs: "tone-info",
  drafts: "tone-brand",
  review_jobs: "tone-warning",
  published_jobs: "tone-success",
};

const statStroke = {
  total_jobs: "#6366f1",
  drafts: "#e24329",
  review_jobs: "#f59e0b",
  published_jobs: "#22c55e",
};

const pipelineColors = {
  Intake: "from-[#94a3b8] to-[#cbd5e1]",
  Context: "from-[#3b82f6] to-[#60a5fa]",
  Draft: "from-[#6366f1] to-[#818cf8]",
  Refine: "from-[#a855f7] to-[#c084fc]",
  Review: "from-[#f59e0b] to-[#fbbf24]",
  Publish: "from-[#22c55e] to-[#4ade80]",
};

const statusLabels = {
  context_preparation: "Preparing Context",
  revision_requested: "Revision Requested",
  publish_ready: "Ready to Publish",
};

const statusColors = {
  intake: "badge-info",
  context_preparation: "badge-info",
  review: "badge-warning",
  revision_requested: "badge-warning",
  approved: "badge-success",
  publish_ready: "badge-success",
  published: "badge-success",
  failed: "badge-danger",
  rejected: "badge-danger",
  refining: "badge-info",
};

function StatusPill({ status = "unknown" }) {
  const label = statusLabels[status] || status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <span className={`badge ${statusColors[status] || "badge-neutral"}`}>{label}</span>;
}

function relativeTime(value) {
  if (!value) return "—";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  if (Math.abs(seconds) < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
}

/* Decorative sparkline drawn from existing numbers (pipeline stage counts). */
function Sparkline({ values, color }) {
  const gradientId = useId();
  if (!values || values.length < 2) return null;
  const max = Math.max(1, ...values);
  const width = 120;
  const height = 36;
  const step = width / (values.length - 1);
  const points = values.map((value, index) => [index * step, height - 4 - (value / max) * (height - 8)]);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-[120px]" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" className="spark-line animate-[draw-line_1s_ease-out_backwards]" />
    </svg>
  );
}

/* Decorative ratio arc (value / total). */
function RatioArc({ value, total, color }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-11 w-11 flex-none" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--gauge-track)" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-muted">{Math.round(ratio * 100)}%</span>
    </div>
  );
}

const jobGrid = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] md:items-center md:gap-4";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/metrics`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Unable to load dashboard data.");
        if (active) setDashboard(data);
      } catch (err) {
        if (active) setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const jobs = dashboard?.recent_jobs || [];
  const pipeline = dashboard?.pipeline || [];
  const displayName = userProfile?.displayName || userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "there";

  /* presentational derivations from data already on the page */
  const totalJobs = Number(dashboard?.total_jobs) || 0;
  const publishedJobs = Number(dashboard?.published_jobs) || 0;
  const publishRate = totalJobs ? Math.round((publishedJobs / totalJobs) * 100) : 0;
  const pipelineValues = pipeline.map(({ value }) => Number(value) || 0);
  const pipelineMax = Math.max(1, ...pipelineValues);

  return (
    <AppLayout initialSelectedNav="Dashboard">
      <div className="page">
        {error && <p role="alert" className="alert alert-danger mb-6">{error}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Hero tile */}
          <section className="card hero-tile flex min-h-[260px] flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-2 lg:row-span-2">
            <div className="min-w-0">
              <p className="eyebrow">Dashboard</p>
              <h1 className="page-title mt-2">
                Welcome back, {displayName} <span aria-label="wave">👋</span>
              </h1>
              <p className="page-subtitle">Turn source material into reviewed, publish-ready documentation.</p>
            </div>

            <div className="space-y-6">
              <div className="max-w-sm">
                <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-medium text-muted">Publish rate</span>
                  <span className="display-num text-[15px]">{loading ? "—" : `${publishRate}%`}</span>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${loading ? 0 : Math.max(publishRate, publishRate ? 4 : 0)}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/create-content" className="btn btn-primary btn-lg w-full sm:w-auto">
                  <FiPlus className="h-4 w-4" aria-hidden="true" />
                  New Content Job
                </Link>
                <Link href="/my-jobs" className="btn btn-secondary btn-lg w-full sm:w-auto">
                  My Jobs
                  <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          {/* Stat tiles */}
          {statCards.map(({ label, key, icon: Icon }) => (
            <div key={label} className={`card stat-card flex flex-col justify-between gap-4 ${statTones[key]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`icon-tile ${statTileColors[key]}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                {!loading && (key === "total_jobs"
                  ? <Sparkline values={pipelineValues} color={statStroke[key]} />
                  : <RatioArc value={Number(dashboard?.[key]) || 0} total={totalJobs} color={statStroke[key]} />)}
              </div>
              <div>
                <div className="display-num text-[34px] leading-none">
                  {loading ? <span className="skeleton h-8 w-14 align-middle" aria-label="Loading" /> : <CountUp value={dashboard?.[key] ?? 0} />}
                </div>
                <div className="mt-2 text-[13px] font-medium text-muted">{label}</div>
              </div>
            </div>
          ))}

          {/* Recent jobs tile */}
          <section className="card overflow-hidden md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
              <h2 className="section-title">Recent Jobs</h2>
              <Link href="/my-jobs" className="link text-[14px]">View all →</Link>
            </div>
            <div className="border-t border-line">
              <div className={`list-head hidden px-6 py-2.5 ${jobGrid}`}>
                <span>Title</span><span>Type</span><span>Status</span><span>Updated</span><span>Owner</span>
              </div>
              {jobs.map((job) => (
                <div key={job.id} className={`list-row flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3.5 text-[14px] sm:px-6 ${jobGrid}`}>
                  <div className="break-anywhere w-full font-medium text-ink md:w-auto">{job.title}</div>
                  <div className="mono break-anywhere text-[13px] text-muted">{job.content_type}</div>
                  <div><StatusPill status={job.status} /></div>
                  <div className="text-[13px] text-muted">{relativeTime(job.updated_at)}</div>
                  <div className="break-anywhere text-[13px] text-body md:text-[14px]">{job.owner}</div>
                </div>
              ))}
              {loading && (
                <div className="space-y-3 px-5 py-5 sm:px-6" role="status" aria-label="Loading recent jobs">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-4">
                      <span className="skeleton h-4 w-2/5" />
                      <span className="skeleton h-4 w-1/6" />
                      <span className="skeleton h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              )}
              {!loading && jobs.length === 0 && (
                <div className="empty-state">
                  <EmptyIllustration />
                  <p>{error ? "Dashboard jobs could not be loaded." : "No content jobs yet. Create a job to get started."}</p>
                </div>
              )}
            </div>
          </section>

          {/* Pipeline tile */}
          <section className="card card-pad md:col-span-2 lg:col-span-1">
            <h2 className="section-title">Content Pipeline</h2>
            <ul className="mt-5 space-y-3.5">
              {pipeline.map(({ name, value }) => (
                <li key={name} className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="break-anywhere text-[13px] font-medium text-body">{name}</span>
                    <span className="display-num text-[15px]">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-soft" aria-hidden="true">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ${pipelineColors[name] || "from-[#94a3b8] to-[#cbd5e1]"}`}
                      style={{ width: `${((Number(value) || 0) / pipelineMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
              {loading && [0, 1, 2, 3].map((row) => <li key={row}><span className="skeleton h-7 w-full" /></li>)}
            </ul>
            {!loading && pipeline.length === 0 && <p className="empty-state py-6">No pipeline data yet.</p>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
