"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiPlus, FiX } from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import EmptyIllustration from "@/components/ui/EmptyIllustration";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useAuth } from "@/hooks/useAuth";
import { getBackendUrl } from "@/lib/backend";

const BACKEND_URL = getBackendUrl();
const filters = ["All", "In Progress", "Completed", "Failed"];

const statusLabels = {
  intake: "Intake",
  context_preparation: "Preparing Context",
  review: "In Review",
  revision_requested: "Revision Requested",
  refining: "Refining",
  approved: "Approved",
  publish_ready: "Ready to Publish",
  published: "Published",
  failed: "Failed",
  rejected: "Rejected",
};

const statusStyles = {
  published: "badge-success",
  approved: "badge-success",
  publish_ready: "badge-success",
  intake: "badge-info",
  context_preparation: "badge-info",
  review: "badge-warning",
  revision_requested: "badge-warning",
  refining: "badge-info",
  failed: "badge-danger",
  rejected: "badge-danger",
};

function jobCategory(status) {
  if (status === "published") return "Completed";
  if (["failed", "rejected"].includes(status)) return "Failed";
  return "In Progress";
}

function formatStatus(status) {
  return statusLabels[status] || status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function StatusBadge({ status }) {
  return <span className={`badge ${statusStyles[status] || "badge-neutral"}`}>{formatStatus(status)}</span>;
}

const jobGrid = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4";

export default function MyJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/content-jobs`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Unable to load content jobs.");
        if (active) setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load content jobs.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const filteredJobs = useMemo(() => selectedFilter === "All" ? jobs : jobs.filter((job) => jobCategory(job.status) === selectedFilter), [jobs, selectedFilter]);

  const openJob = async (jobId) => {
    if (!user) return;
    setDetailLoading(true);
    setSelectedJob(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/content-jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to load this job.");
      setSelectedJob(data);
    } catch (err) {
      setError(err.message || "Unable to load this job.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AppLayout initialSelectedNav="My Jobs">
      <div className="page">
        <div className="page-header">
          <div className="min-w-0">
            <h1 className="page-title">My Jobs</h1>
            <p className="page-subtitle">Manage your content workflow and monitor each job status.</p>
          </div>
          <Link href="/create-content" className="btn btn-primary w-full md:w-auto">
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            New Content Job
          </Link>
        </div>

        {error && <p role="alert" className="alert alert-danger mb-5">{error}</p>}

        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter jobs by status">
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                aria-pressed={isSelected}
                className={`btn btn-sm min-h-[44px] rounded-full px-4 lg:min-h-[36px] ${isSelected ? "border-ink bg-ink text-paper shadow-[var(--shadow-card)] hover:bg-ink" : "btn-secondary"}`}
              >
                {filter}
                <span className={`rounded-full px-1.5 text-[12px] font-semibold ${isSelected ? "bg-paper/20 text-paper" : "bg-neutral-soft text-muted"}`}>
                  {filter === "All" ? jobs.length : jobs.filter((job) => jobCategory(job.status) === filter).length}
                </span>
              </button>
            );
          })}
        </div>

        <section className="card overflow-hidden">
          <div className={`list-head hidden px-6 py-2.5 ${jobGrid}`}>
            <span>Title</span><span>Type</span><span>Status</span><span>Updated</span><span className="text-right">Actions</span>
          </div>
          {filteredJobs.map((job) => (
            <div key={job.id} className={`list-row flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3.5 text-[14px] sm:px-6 ${jobGrid}`}>
              <div className="break-anywhere w-full font-medium text-ink md:w-auto">{job.title}</div>
              <div className="mono break-anywhere text-[13px] text-muted">{job.content_type}</div>
              <div><StatusBadge status={job.status} /></div>
              <div className="text-[13px] text-muted">{relativeTime(job.updated_at || job.created_at)}</div>
              <div className="ml-auto md:ml-0 md:text-right">
                <button type="button" onClick={() => openJob(job.id)} aria-label={`View ${job.title}`} className="btn btn-secondary btn-sm min-h-[44px] lg:min-h-[36px]">View</button>
              </div>
            </div>
          ))}
          {!loading && filteredJobs.length === 0 && (
            <div className="empty-state">
              <EmptyIllustration />
              <p>{error ? "Jobs could not be loaded." : jobs.length ? `No ${selectedFilter.toLowerCase()} jobs.` : "No jobs yet. Create a content job to get started."}</p>
            </div>
          )}
          {loading && (
            <div className="space-y-4 px-5 py-6 sm:px-6" role="status">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-4">
                  <span className="skeleton h-4 w-2/5" />
                  <span className="skeleton h-4 w-1/6" />
                  <span className="skeleton h-5 w-20 rounded-full" />
                  <span className="skeleton ml-auto h-8 w-14" />
                </div>
              ))}
              <p className="meta pt-1">Loading jobs…</p>
            </div>
          )}
        </section>
      </div>

      {(detailLoading || selectedJob) && <div className="fixed inset-0 z-50 flex items-end justify-center animate-[fade-in_0.15s_ease-out] bg-[rgba(9,9,11,0.5)] p-0 backdrop-blur-[3px] sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Job details">
        <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[16px] border border-line bg-surface shadow-[var(--shadow-pop)] sm:max-h-[88vh] sm:rounded-[12px]">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="eyebrow">Job details</p>
              <h2 className="break-anywhere mt-1 text-[20px] font-semibold text-ink">{selectedJob?.title || "Loading job…"}</h2>
            </div>
            <button type="button" onClick={() => setSelectedJob(null)} aria-label="Close job details" className="btn btn-secondary btn-sm min-h-[44px] flex-none lg:min-h-[36px]">
              <FiX className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
          </header>
          {detailLoading ? (
            <div className="empty-state py-12" role="status"><span className="spinner" aria-hidden="true" /><p>Loading job details…</p></div>
          ) : selectedJob && (
            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
                <StatusBadge status={selectedJob.status} />
                <span className="mono">{selectedJob.content_type}</span>
                <span>{selectedJob.audience}</span>
                <span>Quality score: <span className="font-semibold text-ink">{selectedJob.quality_score ?? "—"}</span></span>
              </div>
              {selectedJob.final_document ? <MarkdownRenderer content={selectedJob.final_document} /> : (
                <>
                  <h3 className="mb-2 text-[15px] font-semibold text-ink">Source document text</h3>
                  <pre className="whitespace-pre-wrap break-words rounded-[10px] border border-line bg-subtle p-4 font-mono text-[13px] leading-6 text-body">{selectedJob.source_text || "No source text is available."}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>}
    </AppLayout>
  );
}
