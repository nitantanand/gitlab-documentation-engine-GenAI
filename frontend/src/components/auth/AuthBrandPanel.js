import Image from "next/image";
import { FiCheck, FiFileText } from "react-icons/fi";

/* Decorative only — static markup, no data. */
const previewSteps = [
  { label: "Upload", state: "done" },
  { label: "Context Reader", state: "done" },
  { label: "Writer", state: "done" },
  { label: "Reviewer", state: "active" },
  { label: "Tone", state: "pending" },
  { label: "Publish", state: "pending" },
];

function StepNode({ state }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/40">
        <FiCheck className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E24329]/20 ring-2 ring-[#E24329]">
        <span className="pulse-dot h-2 w-2 rounded-full bg-[#ff7a5c] text-[#E24329]" />
      </span>
    );
  }
  return <span className="block h-6 w-6 rounded-full border border-dashed border-white/25 bg-white/[0.03]" />;
}

function PipelinePreview() {
  return (
    <div className="relative mt-9 hidden pb-5 lg:block [@media(max-height:700px)]:hidden" aria-hidden="true">
      {/* stacked sheets */}
      <div className="glass absolute inset-x-10 bottom-0 h-16 rounded-2xl opacity-40" />
      <div className="glass absolute inset-x-5 bottom-2.5 h-16 rounded-2xl opacity-70" />

      <div className="glass relative rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-white">Content pipeline</span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[12px] font-medium text-slate-300 ring-1 ring-white/10">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#F59E0B] text-[#F59E0B]" />
            Running
          </span>
        </div>

        <div className="relative mt-5 grid grid-cols-6 gap-1">
          <div className="absolute left-[8.33%] right-[8.33%] top-3 h-px bg-white/15" />
          <div className="absolute left-[8.33%] top-3 h-px w-[50%] bg-gradient-to-r from-emerald-300/70 via-[#F59E0B] to-[#E24329]" />
          {previewSteps.map(({ label, state }) => (
            <div key={label} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
              <StepNode state={state} />
              <span className={`text-[12px] leading-tight ${state === "pending" ? "text-slate-400" : "text-slate-200"}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/[0.08] text-slate-200">
            <FiFileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="truncate font-mono text-[12px] text-slate-300">release-notes.md</div>
            <div className="h-1.5 w-11/12 rounded-full bg-white/10" />
            <div className="h-1.5 w-7/12 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthBrandPanel({ title, description, features = [] }) {
  return (
    <section className="relative isolate overflow-hidden text-white lg:sticky lg:top-0 lg:h-dvh lg:w-1/2 lg:flex-none">
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-grid" />
        <div className="aurora-noise" />
      </div>

      <div className="relative flex h-full flex-col justify-center px-5 pb-12 pt-5 sm:px-10 sm:pb-14 sm:pt-7 lg:px-14 lg:py-10 xl:px-20">
        <div className="mx-auto w-full max-w-[540px]">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:block">
          <div className="flex items-center gap-3">
            <Image
              src="/gitlab.jpg"
              alt="GitLab icon"
              width={40}
              height={40}
              priority
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/20 lg:h-10 lg:w-10"
            />
            <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-white">GitLab</span>
          </div>

          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium text-slate-100 sm:text-[13px] lg:mt-10">
            <span className="text-[#FDBA74]" aria-hidden="true">✦</span>
            AI Powered Documentation
          </div>
          </div>

          <h1 className="mt-5 font-display text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-[30px] lg:mt-5 lg:text-[36px]">
            {title}
          </h1>

          <p className="mt-3 max-w-[50ch] text-[14px] leading-[1.65] text-slate-300 sm:text-[15px] lg:mt-4 lg:text-[16px]">
            {description}
          </p>

          <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mx-0 lg:mt-7 lg:flex-wrap lg:gap-2.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {features.map(({ icon, text }) => (
              <li key={text} className="glass flex flex-none items-center whitespace-nowrap gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium text-slate-100 lg:py-1.5 lg:pl-1.5 lg:pr-3.5 lg:text-[14px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E24329]/20 text-[13px] text-[#FDBA74] ring-1 ring-[#E24329]/40 lg:h-7 lg:w-7" aria-hidden="true">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>

          <PipelinePreview />
        </div>
      </div>
    </section>
  );
}
