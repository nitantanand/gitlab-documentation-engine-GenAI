"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiLink2,
  FiLoader,
  FiMessageSquare,
  FiShield,
  FiUploadCloud,
  FiZap,
} from "react-icons/fi";
import AppLayout from "@/components/layout/AppLayout";
import { getBackendUrl } from "@/lib/backend";

const BACKEND_URL = getBackendUrl();

const workflowSteps = [
  "Upload document",
  "Extract source context",
  "Build context pack",
  "Run AI workflow",
  "Review & publish",
];
const completedStepsByStatus = {
  intake: 1,
  context_preparation: 3,
  review: 4,
  approved: 5,
  published: 5,
};

export default function CreateContentPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("Templates");
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [statusLog, setStatusLog] = useState([
    "Waiting for document upload",
    "Ready to process source input",
  ]);

  const [form, setForm] = useState({
    title: "",
    content_type: "documentation",
    audience: "Developers",
    product_area: "General",
    channel: "Documentation",
  });

  const hasSelectedFile = Boolean(selectedFile);
  const [isDragging, setIsDragging] = useState(false); // UI-only: drag-over highlight

  const progressPercent = useMemo(() => {
    if (!job) return 10;
    const statusMap = {
      intake: 20,
      context_preparation: 45,
      review: 80,
      failed: 100,
      published: 100,
    };
    return statusMap[job.status] ?? 60;
  }, [job]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      updateStatus(["Document uploaded successfully", "Ready to process source input"]);
    }
  };

  const updateStatus = (messages) => setStatusLog(messages);

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in before processing a document.");
      return;
    }

    if (!selectedFile && !rawText.trim()) {
      setError("Please upload a document or paste raw text to process.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a title for your content job.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setJob(null);
    updateStatus([
      selectedFile ? "Uploading document..." : "Submitting raw text...",
      "Validating source content and metadata...",
    ]);

    try {
      const token = await user.getIdToken();
      let jobPayload;

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("title", form.title);
        uploadForm.append("content_type", form.content_type);
        uploadForm.append("audience", form.audience);
        uploadForm.append("product_area", form.product_area);
        uploadForm.append("channel", form.channel);
        uploadForm.append("file", selectedFile);

        const uploadResponse = await fetch(`${BACKEND_URL}/api/content-jobs/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadForm,
        });

        const uploadData = await uploadResponse.json().catch(() => ({}));

        if (!uploadResponse.ok) {
          throw new Error(uploadData.detail || "Document upload failed.");
        }

        jobPayload = uploadData;
        updateStatus([
          "Document uploaded successfully",
          "Extracting source text and metadata...",
          "Preparing context package...",
        ]);
      } else {
        const createResponse = await fetch(`${BACKEND_URL}/api/content-jobs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            content_type: form.content_type,
            audience: form.audience,
            product_area: form.product_area,
            channel: form.channel,
            source_text: rawText.trim(),
          }),
        });

        const createData = await createResponse.json().catch(() => ({}));

        if (!createResponse.ok) {
          throw new Error(createData.detail || "Raw text submission failed.");
        }

        jobPayload = createData;
        updateStatus([
          "Raw text submitted successfully",
          "Extracting source context...",
          "Preparing context package...",
        ]);
      }

      const runResponse = await fetch(`${BACKEND_URL}/api/content-jobs/${jobPayload.id}/run`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const runData = await runResponse.json().catch(() => ({}));

      if (!runResponse.ok) {
        throw new Error(runData.detail || "Content workflow failed.");
      }

      setJob(runData);

      updateStatus([
        selectedFile ? "Document uploaded successfully" : "Raw text submitted successfully",
        "Source context extracted",
        "AI workflow completed",
        "Draft generated. Navigate to the Review panel to review it.",
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong while processing the source.");
      updateStatus([selectedFile ? "Upload failed" : "Processing failed", "Please review the input and try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- presentational helpers (derived from existing state only) ---- */
  const workflowStatus = job?.status || "idle";
  const doneCount = completedStepsByStatus[job?.status] ?? 0;
  const statusBadge =
    workflowStatus === "failed"
      ? "badge-danger"
      : ["approved", "published"].includes(workflowStatus)
        ? "badge-success"
        : workflowStatus === "review"
          ? "badge-warning"
          : workflowStatus === "idle"
            ? "badge-neutral"
            : "badge-info";

  return (
    <AppLayout initialSelectedNav="Create Content">
      <div className="page">
        <div className="page-header mb-5">
          <div className="min-w-0">
            <p className="eyebrow">GitLab AI</p>
            <h1 className="page-title mt-1">Create Content</h1>
            <p className="page-subtitle">
              Upload a source document, extract the technical context, and run the AI workflow to produce a ready-to-review draft.
            </p>
          </div>
        </div>

        <div className="tabs mb-6" role="tablist" aria-label="Content source">
          {["Templates", "Custom", "From Existing"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selectedTab === tab}
              onClick={() => setSelectedTab(tab)}
              className="tab"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Intake form */}
          <section className="card card-pad min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="card-title">Document intake</h2>
              <div className={`break-anywhere text-[13px] ${selectedFile ? "mono text-body" : "text-muted"}`}>{selectedFile ? selectedFile.name : "No file selected"}</div>
            </div>

            <label
              className={`dropzone group mt-4 ${hasSelectedFile ? "dropzone-done" : ""} ${isDragging ? "dropzone-drag" : ""}`}
              onDragEnter={() => setIsDragging(true)}
              onDragOver={() => setIsDragging(true)}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
              onDrop={() => setIsDragging(false)}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-150 group-hover:-translate-y-0.5 ${
                  isDragging
                    ? "-translate-y-1 bg-brand text-white shadow-[0_8px_20px_-6px_rgba(226,67,41,0.6)]"
                    : hasSelectedFile ? "bg-success-soft text-success ring-1 ring-success-line" : "bg-surface text-brand shadow-[0_4px_12px_-4px_rgba(226,67,41,0.35)] ring-1 ring-line"
                }`}
              >
                {hasSelectedFile && !isDragging ? <FiCheckCircle className="h-6 w-6" aria-hidden="true" /> : <FiUploadCloud className="h-6 w-6" aria-hidden="true" />}
              </div>
              <div className={`mt-3 text-[15px] font-semibold ${hasSelectedFile && !isDragging ? "text-success" : "text-ink"}`}>
                {isDragging ? "Drop to upload" : hasSelectedFile ? "Document uploaded" : "Upload source document"}
              </div>
              <div className={`break-anywhere mt-1 max-w-full text-[13px] ${hasSelectedFile ? "mono text-success" : "text-muted"}`}>
                {hasSelectedFile ? selectedFile.name : "PDF, DOCX, TXT, MD, or CSV"}
              </div>
              {!hasSelectedFile && <div className="mt-3 text-[12px] font-medium text-muted">Click to browse or drop a file here</div>}
              <input type="file" title="Upload source document" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleFileSelection} />
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0 sm:col-span-2">
                <span className="field-label">Raw text source</span>
                <textarea
                  value={rawText}
                  onChange={(event) => setRawText(event.target.value)}
                  rows={5}
                  className="input"
                  placeholder="Paste release notes, product context, or any raw text here. This can be processed even without uploading a file."
                />
              </label>

              <label className="block min-w-0">
                <span className="field-label">Title</span>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="input"
                  placeholder="Product onboarding guide"
                />
              </label>

              <label className="block min-w-0">
                <span className="field-label">Content type</span>
                <select
                  value={form.content_type}
                  onChange={(event) => updateField("content_type", event.target.value)}
                  className="input"
                >
                  <option value="documentation">Documentation</option>
                  <option value="release_notes">Release Notes</option>
                  <option value="api_docs">API Documentation</option>
                  <option value="blog_post">Blog Post</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              <label className="block min-w-0">
                <span className="field-label">Audience</span>
                <input
                  value={form.audience}
                  onChange={(event) => updateField("audience", event.target.value)}
                  className="input"
                  placeholder="Developers"
                />
              </label>

              <label className="block min-w-0">
                <span className="field-label">Product area</span>
                <input
                  value={form.product_area}
                  onChange={(event) => updateField("product_area", event.target.value)}
                  className="input"
                  placeholder="General"
                />
              </label>

              <label className="block min-w-0 sm:col-span-2">
                <span className="field-label">Channel</span>
                <select
                  value={form.channel}
                  onChange={(event) => updateField("channel", event.target.value)}
                  className="input"
                >
                  <option value="Documentation">Documentation</option>
                  <option value="Blog">Blog</option>
                  <option value="Release Notes">Release Notes</option>
                  <option value="Knowledge Base">Knowledge Base</option>
                </select>
              </label>
            </div>

            {error ? <div role="alert" className="alert alert-danger mt-5">{error}</div> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Insert document" className="btn btn-secondary btn-icon">
                  <FiFileText className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Insert link" className="btn btn-secondary btn-icon">
                  <FiLink2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiZap className="h-4 w-4" aria-hidden="true" />
                    {selectedFile ? "Process Document" : rawText.trim() ? "Process Raw Text" : "Process Source"}
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Workflow status */}
          <aside className="card card-pad min-w-0 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="card-title">Workflow status</h2>
              <span className={`badge ${statusBadge}`}><span className="mono">{workflowStatus}</span></span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[13px] text-muted">
                <span>Progress</span>
                <span className="font-semibold text-ink">{progressPercent}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Workflow progress"
              >
                <div
                  className={`progress-fill ${job?.status === "failed" ? "progress-fill-danger" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <ol className="mt-6 space-y-0">
              {workflowSteps.map((step, index) => {
                const isDone = index < doneCount;
                const isFailed = !isDone && job?.status === "failed" && index === doneCount;
                const isActive = !isDone && !isFailed && index === doneCount && (isSubmitting || Boolean(job));
                const isLast = index === workflowSteps.length - 1;

                return (
                  <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
                    {!isLast && (
                      <span
                        className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px ${isDone ? "bg-gradient-to-b from-success-solid to-success-line" : "bg-line"}`}
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-7 w-7 flex-none items-center justify-center rounded-full ring-1 ${
                        isDone
                          ? "bg-success-solid text-white ring-success-solid shadow-[0_2px_6px_-1px_rgba(22,163,74,0.4)]"
                          : isFailed
                            ? "bg-danger-soft text-danger ring-danger-line"
                            : isActive
                              ? "step-active bg-surface text-brand ring-2 ring-brand"
                              : "bg-surface text-faint ring-line"
                      }`}
                    >
                      {isDone ? (
                        <FiCheck className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      ) : isFailed ? (
                        <FiAlertCircle className="h-4 w-4" aria-hidden="true" />
                      ) : isActive ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
                      ) : (
                        <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <span className={`text-[14px] ${isDone || isActive ? "font-medium text-ink" : isFailed ? "font-medium text-danger" : "text-muted"}`}>
                        {step}
                      </span>
                      <span className="sr-only">
                        {isDone ? " (done)" : isFailed ? " (failed)" : isActive ? " (in progress)" : " (pending)"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="card-inset mt-6 p-4">
              <div className="eyebrow">Operations log</div>
              <ul className="mt-3 space-y-2 text-[14px] text-body" aria-live="polite">
                {statusLog.map((log) => (
                  <li key={log} className="flex items-start gap-2">
                    <FiArrowRight className="mt-1 h-3.5 w-3.5 flex-none text-brand" aria-hidden="true" />
                    <span className="break-anywhere">{log}</span>
                  </li>
                ))}
              </ul>
              {job?.status === "review" && (
                <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
                  <p className="text-[14px] text-body">Draft generated. Open the Review panel to review it.</p>
                  <Link href="/review" className="btn btn-primary w-full">
                    Go to Review panel
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
