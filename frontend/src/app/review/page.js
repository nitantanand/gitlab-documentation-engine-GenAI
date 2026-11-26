"use client";

import { useEffect, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiHelpCircle,
  FiLink2,
  FiShield,
  FiXOctagon,
} from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import EmptyIllustration from "@/components/ui/EmptyIllustration";
import ToastStack from "@/components/ui/ToastStack";
import { useAuth } from "@/hooks/useAuth";
import { getBackendUrl } from "@/lib/backend";

const BACKEND_URL = getBackendUrl();

const listTones = {
  success: "bg-success-soft text-success ring-success-line",
  warning: "bg-warning-soft text-warning ring-warning-line",
  danger: "bg-danger-soft text-danger ring-danger-line",
  neutral: "bg-neutral-soft text-neutral ring-neutral-line",
  info: "bg-link-soft text-link ring-link-line",
};

function ReviewList({ title, items, empty, tone = "neutral", mono = false, icon: Icon }) {
  const values = (Array.isArray(items) ? items : items ? [items] : []).map((item) => {
    if (typeof item === "string") return item.trim();
    if (!item || typeof item !== "object") return "";
    const refs = Array.isArray(item.source_refs) ? item.source_refs : item.source_refs ? [item.source_refs] : [];
    return [item.fact || item.claim || item.text || item.description || "", ...refs.filter(Boolean).map((source) => `Source: ${source}`)].filter(Boolean).join(" | ").trim();
  }).filter(Boolean);
  return <section className="min-w-0">
    {title && <h3 className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
      {Icon && <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg ring-1 ${listTones[tone]}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" /></span>}
      <span className="min-w-0 flex-1">{title}</span>
      {values.length > 0 && <span className="rounded-full bg-neutral-soft px-2 text-[12px] font-semibold text-muted ring-1 ring-neutral-line">{values.length}</span>}
    </h3>}
    {values.length ? <ul className={`mt-3 space-y-2 text-[14px] leading-6 text-body ${mono ? "font-mono text-[13px]" : ""}`}>{values.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2.5"><span className="mt-[10px] h-1 w-1 flex-none rounded-full bg-faint" aria-hidden="true" /><span className="break-anywhere">{item}</span></li>)}</ul> : <p className="mt-2 text-[13px] text-muted">{empty}</p>}
  </section>;
}

function statusTone(status = "") {
  if (["approved", "publish_ready", "published"].includes(status)) return "badge-success";
  if (["failed", "rejected"].includes(status)) return "badge-danger";
  return "badge-warning";
}

/* Pure presentational ring gauge for the existing score value. */
function QualityGauge({ value }) {
  const numeric = Number(value);
  const valid = value !== null && value !== undefined && value !== "—" && Number.isFinite(numeric);
  const pct = valid ? Math.max(0, Math.min(100, numeric)) : 0;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#f59e0b" : "#e24329";
  return (
    <div className="relative h-[68px] w-[68px] flex-none">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--gauge-track)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="display-num absolute inset-0 flex items-center justify-center text-[18px]">{value}</div>
    </div>
  );
}

export default function ReviewPage() {
  const { user, userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [comments, setComments] = useState("");
  const [action, setAction] = useState("");
  const role = (userProfile?.role || "writer").toLowerCase();
  const canApprove = ["reviewer", "approver", "admin"].includes(role);
  const canPublish = ["approver", "admin"].includes(role);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/content-jobs`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.detail || "Unable to load review jobs.");
        const reviewJobs = data.filter((job) => ["review", "revision_requested", "approved", "publish_ready", "published"].includes(job.status));
        if (active) { setJobs(reviewJobs); setSelectedId(reviewJobs[0] ? String(reviewJobs[0].id) : ""); }
      } catch (err) { if (active) setError(err.message || "Unable to load review jobs."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user || !selectedId) { setDetail(null); return; }
    let active = true;
    setDetail(null);
    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/content-jobs/${selectedId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Unable to load this document.");
        if (active) setDetail(data);
      } catch (err) { if (active) setError(err.message || "Unable to load this document."); }
    })();
    return () => { active = false; };
  }, [user, selectedId]);

  const draft = detail?.drafts?.at(-1);
  const review = draft?.technical_review || detail?.technical_review || {};
  const formatDate = (value) => value ? new Date(value).toLocaleString() : "Not available";

  const refreshSelectedJob = async (token) => {
    const [jobResponse, listResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/content-jobs/${selectedId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BACKEND_URL}/api/content-jobs`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const jobData = await jobResponse.json().catch(() => ({}));
    const listData = await listResponse.json().catch(() => []);
    if (!jobResponse.ok) throw new Error(jobData.detail || "Unable to refresh this document.");
    if (!listResponse.ok) throw new Error(listData.detail || "Unable to refresh the review queue.");
    setDetail(jobData);
    setJobs(listData.filter((job) => ["review", "revision_requested", "approved", "publish_ready", "published"].includes(job.status)));
  };

  const submitReviewDecision = async (decision) => {
    if (!user || !draft) return;
    setAction(decision);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/drafts/${draft.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision, comments }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to submit the review decision.");

      if (decision === "request_revision") {
        const refineResponse = await fetch(`${BACKEND_URL}/api/drafts/${draft.id}/refine`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ comments }),
        });
        const refineData = await refineResponse.json().catch(() => ({}));
        if (!refineResponse.ok) throw new Error(refineData.detail || "Revision was requested, but refinement failed.");
        setNotice("Revision generated and returned to the review queue.");
        setComments("");
      } else {
        setNotice("Draft approved. It is ready to publish.");
      }
      await refreshSelectedJob(token);
    } catch (err) {
      setError(err.message || "Unable to complete this review action.");
      try { await refreshSelectedJob(await user.getIdToken()); } catch { /* keep the original action error */ }
    } finally {
      setAction("");
    }
  };

  const publishDraft = async () => {
    if (!user || !draft) return;
    setAction("publish");
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/publish/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draft_id: draft.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to publish this document.");
      const file = new Blob([data.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`Published successfully. ${data.filename} was downloaded.`);
      await refreshSelectedJob(token);
    } catch (err) {
      setError(err.message || "Unable to publish this document.");
    } finally {
      setAction("");
    }
  };

  return <AppLayout initialSelectedNav="Review">
    <div className="page max-w-[1320px]">
      <div className="page-header">
        <div className="min-w-0">
          <p className="eyebrow text-brand-ink">Documentation review</p>
          <h1 className="page-title mt-1">Review generated document</h1>
          <p className="page-subtitle">Read the customer facing Markdown alongside its technical evidence.</p>
        </div>
        <label className="block w-full min-w-0 md:max-w-sm" htmlFor="review-queue">
          <span className="field-label">Review queue</span>
          <select id="review-queue" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="input">
            <option value="">Select a document</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title} · #{job.id}</option>)}
          </select>
        </label>
      </div>

      <ToastStack toasts={[{ id: "review-error", message: error, tone: "error" }, { id: "review-notice", message: notice, tone: "success" }]} />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]" role="status" aria-label="Loading review queue">
          <div className="paper space-y-4 p-8">
            <span className="skeleton block h-7 w-1/2" />
            <span className="skeleton block h-4 w-full" />
            <span className="skeleton block h-4 w-11/12" />
            <span className="skeleton block h-4 w-4/5" />
          </div>
          <div className="space-y-4">
            <span className="skeleton block h-36 w-full rounded-2xl" />
            <span className="skeleton block h-48 w-full rounded-2xl" />
          </div>
          <p className="meta lg:col-span-2">Loading review queue…</p>
        </div>
      ) : !jobs.length ? (
        <div className="empty-state rounded-[16px] border border-dashed border-line-strong bg-surface/70 py-16">
          <EmptyIllustration className="h-28 w-36" />
          <h2 className="empty-state-title">No documents are waiting for review</h2>
          <p>Generated drafts will appear here once their workflow completes.</p>
        </div>
      ) : detail && draft ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
          {/* Document — paper page */}
          <section className="paper min-w-0 overflow-hidden">
            <header className="border-b border-line bg-gradient-to-b from-subtle to-surface px-5 py-5 sm:px-8 lg:px-12">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-anywhere text-[22px] font-bold text-ink">{detail.title}</h2>
                  <p className="mt-1 text-[14px] text-muted"><span className="mono">{detail.content_type}</span> · {detail.audience}</p>
                </div>
                <span className={`badge ${statusTone(detail.status)}`}>{detail.status.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted">
                <span>Generated {formatDate(draft.generated_at || draft.created_at)}</span>
                <span>Version <span className="mono text-body">{draft.version}</span></span>
                <span>Channel: {detail.channel}</span>
              </div>
            </header>
            <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12"><MarkdownRenderer content={draft.final_document || draft.content || ""} /></div>
          </section>

          {/* Evidence panels */}
          <aside className="flex min-w-0 flex-col gap-4 lg:self-stretch">
            <section className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="card-title flex items-center gap-2">
                  <FiActivity className="h-4 w-4 text-brand" aria-hidden="true" />
                  Technical review
                </h2>
                <span className={`badge ${review.verdict === "PASS" ? "badge-success" : "badge-warning"}`}>{review.verdict || "NEEDS REVIEW"}</span>
              </div>
              <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <QualityGauge value={review.quality_score ?? detail.quality_score ?? "—"} />
                <div className="grid min-w-0 grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-muted">Quality score</p>
                    <p className="display-num mt-0.5 text-[20px]">{review.quality_score ?? detail.quality_score ?? "—"}<span className="ml-1 font-sans text-[13px] font-normal tracking-normal text-muted">/100</span></p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-muted">Supported facts</p>
                    <p className="display-num mt-0.5 text-[20px]">{review.evidence_count ?? "—"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="card p-5">
              <ReviewList title="Supported information" tone="success" icon={FiCheckCircle} items={review.supported_information || review.supported_sections || []} empty="No supported information was extracted." />
            </section>
            <section className="card p-5">
              <ReviewList title="Context gaps" tone="warning" icon={FiHelpCircle} items={review.context_gaps || review.missing_information || []} empty="No context gaps identified." />
            </section>
            <section className="card p-5">
              <ReviewList title="Unsupported claims" tone="danger" icon={FiXOctagon} items={review.unsupported_claims || []} empty="No unsupported claims identified." />
            </section>
            <section className="card p-5">
              <ReviewList title="Technical risks" tone="danger" icon={FiAlertTriangle} items={review.risks || draft.risk_flags || []} empty="No technical risks identified." />
            </section>

            <section className="card p-5">
              <h3 className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg ring-1 ${listTones.info}`}><FiLink2 className="h-3.5 w-3.5" aria-hidden="true" /></span>
                Source references
              </h3>
              <ReviewList title="" mono items={review.source_refs || draft.source_refs || []} empty="No source references recorded." />
            </section>

            {/* Actions — sticky at the bottom of the column on desktop */}
            <div className="flex flex-col gap-4 lg:sticky lg:bottom-4 lg:mt-auto">
              {['review', 'revision_requested'].includes(detail.status) && <section className="card p-5 lg:shadow-[var(--shadow-pop)]">
                <label className="field-label flex items-center gap-2" htmlFor="review-comments">
                  <FiShield className="h-4 w-4 text-brand" aria-hidden="true" />
                  Reviewer comments
                </label>
                <textarea id="review-comments" value={comments} onChange={(event) => setComments(event.target.value)} rows={3} placeholder="Add guidance for the requested revision (optional)." className="input" />
                <div className="mt-4 grid gap-3 min-[420px]:grid-cols-2">
                  <button type="button" disabled={Boolean(action)} onClick={() => submitReviewDecision("request_revision")} className="btn btn-secondary w-full disabled:cursor-wait">{action === "request_revision" ? "Generating revision…" : "Request Revision"}</button>
                  {canApprove && <button type="button" disabled={Boolean(action)} onClick={() => submitReviewDecision("approve")} className="btn btn-primary w-full disabled:cursor-wait">{action === "approve" ? "Approving…" : "Approve"}</button>}
                </div>
                {!canApprove && <p className="field-hint mt-3">An approver must approve this draft before it can be published.</p>}
              </section>}

              {["approved", "publish_ready"].includes(detail.status) && canPublish && <section className="rounded-[16px] border border-success-line bg-surface bg-gradient-to-b from-success-soft to-success-soft p-5 shadow-[var(--shadow-card)] lg:shadow-[var(--shadow-pop)]">
                <h3 className="card-title flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-success" aria-hidden="true" />Ready to publish</h3>
                <p className="mt-1 text-[14px] text-body">Publish the approved Markdown document and download a copy.</p>
                <button type="button" disabled={Boolean(action)} onClick={publishDraft} className="btn btn-success mt-4 w-full disabled:cursor-wait">{action === "publish" ? "Publishing…" : "Publish"}</button>
              </section>}
              {["approved", "publish_ready"].includes(detail.status) && !canPublish && <p className="alert alert-success lg:shadow-[var(--shadow-pop)]">Approved and waiting for an approver or admin to publish.</p>}
              {detail.status === "published" && <p className="alert alert-success flex items-center gap-2 font-semibold lg:shadow-[var(--shadow-pop)]"><FiCheckCircle className="h-4 w-4 flex-none" aria-hidden="true" />Published</p>}
            </div>
          </aside>
        </div>
      ) : jobs.length ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]" role="status">
          <div className="paper space-y-4 p-8">
            <span className="skeleton block h-7 w-1/2" />
            <span className="skeleton block h-4 w-full" />
            <span className="skeleton block h-4 w-11/12" />
            <span className="skeleton block h-4 w-3/4" />
          </div>
          <span className="skeleton block h-40 w-full rounded-2xl" />
          <p className="meta lg:col-span-2">Loading document…</p>
        </div>
      ) : null}
    </div>
  </AppLayout>;
}
