"use client";

import { useEffect, useState } from "react";
import { FiAward, FiCheckCircle, FiEdit3, FiFileText } from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import CountUp from "@/components/ui/CountUp";
import EmptyIllustration from "@/components/ui/EmptyIllustration";
import { useAuth } from "@/hooks/useAuth";
import { getBackendUrl } from "@/lib/backend";

const BACKEND_URL = getBackendUrl();

const statCards = [
  { label: "Total Content Jobs", key: "total_jobs", format: (value) => value },
  { label: "Published", key: "published_jobs", format: (value) => value },
  { label: "Drafts Created", key: "drafts", format: (value) => value },
  { label: "Average Quality", key: "average_quality", format: (value) => `${value}/100` },
];

/* Presentational: icon + tone per metric key */
const statDecor = {
  total_jobs: { icon: FiFileText, tone: "tone-info", tile: "bg-link-soft text-link ring-1 ring-link-line" },
  published_jobs: { icon: FiCheckCircle, tone: "tone-success", tile: "bg-success-soft text-success ring-1 ring-success-line" },
  drafts: { icon: FiEdit3, tone: "tone-brand", tile: "bg-brand-soft text-brand-ink ring-1 ring-brand-line" },
  average_quality: { icon: FiAward, tone: "tone-warning", tile: "bg-warning-soft text-warning ring-1 ring-warning-line" },
};

/* Presentational: trend line/area aligned to bar tops (column centres), plus the peak month. */
function buildTrendGeometry(trend, maxJobs) {
  const count = Math.max(trend.length, 1);
  const points = [];
  let peak = null;
  for (let index = 0; index < trend.length; index += 1) {
    const month = trend[index];
    const value = month.jobs || 0;
    const height = maxJobs ? Math.max(value ? 8 : 0, (value / maxJobs) * 100) : 0;
    points.push([((index + 0.5) / count) * 100, 100 - height]);
    if (!peak || value > (peak.jobs || 0)) peak = month;
  }
  if (!points.length) return { linePath: "", areaPath: "", peak };
  const linePath = points.map((point, index) => (index ? "L" : "M") + point[0].toFixed(2) + "," + point[1].toFixed(2)).join(" ");
  const areaPath = linePath + " L" + points[points.length - 1][0].toFixed(2) + ",100 L" + points[0][0].toFixed(2) + ",100 Z";
  return { linePath, areaPath, peak };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
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
        if (!response.ok) throw new Error(data.detail || "Unable to load analytics data.");
        if (active) setAnalytics(data);
      } catch (err) {
        if (active) setError(err.message || "Unable to load analytics data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const trend = analytics?.trend || [];
  const maxJobs = Math.max(0, ...trend.map((month) => month.jobs || 0));

  const { linePath: trendPath, areaPath: trendArea, peak: peakMonth } = buildTrendGeometry(trend, maxJobs);

  return (
    <AppLayout initialSelectedNav="Analytics">
      <div className="page">
        <div className="page-header">
          <div className="min-w-0">
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Job volume, publishing progress, and document quality from your database.</p>
          </div>
          <div className="badge badge-neutral self-start px-3 py-1 text-[13px] before:hidden md:self-auto">Last 7 months</div>
        </div>

        {error && <p role="alert" className="alert alert-danger mb-6">{error}</p>}

        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, key, format }) => {
            const { icon: Icon, tone, tile } = statDecor[key];
            return (
              <div key={label} className={`card stat-card ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className={`icon-tile ${tile}`}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success-solid text-success-solid" aria-hidden="true" />
                    Live database value
                  </div>
                </div>
                <div className="display-num mt-4 text-[32px] leading-none" title={loading ? undefined : String(format(analytics?.[key] ?? 0))}>
                  {loading ? <span className="skeleton h-8 w-16 align-middle" aria-label="Loading" /> : <CountUp value={analytics?.[key] ?? 0} suffix={key === "average_quality" ? "/100" : ""} />}
                </div>
                <div className="mt-2 text-[13px] font-medium text-muted">{label}</div>
              </div>
            );
          })}
        </div>

        <section className="card card-pad mt-6">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="section-title">Content Trend</h2>
              <p className="mt-1 text-[14px] text-muted">Jobs created per month</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
              {peakMonth && <span>Peak <span className="font-semibold text-ink">{peakMonth.month}</span> · {peakMonth.jobs || 0}</span>}
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-gradient-to-t from-brand to-amber" aria-hidden="true" />Jobs</span>
              <span className="flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-indigo" aria-hidden="true" />Trend</span>
            </div>
          </div>

          {trend.length > 0 ? (
            <div className="min-w-0">
              {/* Plot area */}
              <div className="relative ml-8 h-60 border-b border-line-strong">
                {/* y-axis + soft gridlines */}
                {[1, 0.5, 0].map((fraction) => (
                  <div key={fraction} className="pointer-events-none absolute inset-x-0" style={{ top: `${(1 - fraction) * 100}%` }} aria-hidden="true">
                    {fraction > 0 && <div className="chart-grid-line" />}
                    <span className="absolute -left-8 w-6 -translate-y-1/2 text-right text-[12px] tabular-nums text-faint">
                      {Number((maxJobs * fraction).toFixed(1))}
                    </span>
                  </div>
                ))}

                {/* Trend area + line (same data as the bars) */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={trendArea} fill="url(#trend-area)" className="animate-[fade-in_0.8s_ease-out_backwards]" />
                  <path d={trendPath} fill="none" stroke="#818cf8" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray="1" className="spark-line animate-[draw-line_1.1s_ease-out_backwards]" />
                </svg>

                {/* Bars */}
                <div className="absolute inset-0 grid items-end" style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }} role="list" aria-label="Jobs created per month">
                  {trend.map((month, index) => {
                    const value = month.jobs || 0;
                    const height = maxJobs ? Math.max(value ? 8 : 0, (value / maxJobs) * 100) : 0;
                    return (
                      <div
                        key={`${month.month}-${index}`}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`${month.month}: ${value} jobs`}
                        className="chart-col group relative flex h-full min-w-0 cursor-default flex-col items-center justify-end rounded-md px-1 outline-none focus-visible:bg-neutral-soft sm:px-2.5"
                      >
                        <div className="relative flex w-full max-w-12 flex-col justify-end" style={{ height: `${height}%` }}>
                          <span className="chart-tip">{month.month} · {value} jobs</span>
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-semibold text-ink transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">{value}</span>
                          <div
                            className="chart-bar h-full w-full rounded-t-[10px] bg-gradient-to-t from-brand to-amber opacity-90 shadow-[0_-6px_16px_-6px_rgba(226,67,41,0.55)] transition-[opacity,filter] duration-150 group-hover:opacity-100 group-hover:brightness-110"
                            style={{ animationDelay: `${index * 60}ms` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* x-axis labels */}
              <div className="ml-8 mt-2 grid" style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }} aria-hidden="true">
                {trend.map((month, index) => (
                  <span key={`${month.month}-label-${index}`} className="truncate px-0.5 text-center text-[12px] text-muted">{month.month}</span>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div role="status">
              <div className="flex h-60 items-end gap-3 px-2" aria-hidden="true">
                {[40, 65, 30, 80, 55, 70, 45].map((h, i) => <span key={i} className="skeleton flex-1 rounded-t-[10px] rounded-b-none" style={{ height: `${h}%` }} />)}
              </div>
              <p className="meta mt-3 text-center">Loading trend…</p>
            </div>
          ) : (
            <div className="empty-state h-60">
              <EmptyIllustration />
              <p>No job history for this period.</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
