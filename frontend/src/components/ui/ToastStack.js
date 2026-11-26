"use client";

import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

/*
 * Presents existing success/error messages as toasts.
 * UI-only state: whether the user dismissed the current message.
 */
function Toast({ message, tone }) {
  const [shownMessage, setShownMessage] = useState(message);
  const [dismissed, setDismissed] = useState(false);

  // Reset the dismissed flag whenever the page sets a new message.
  if (message !== shownMessage) {
    setShownMessage(message);
    setDismissed(false);
  }

  useEffect(() => {
    if (!message || dismissed || tone === "error") return undefined;
    const timer = setTimeout(() => setDismissed(true), 6000);
    return () => clearTimeout(timer);
  }, [message, dismissed, tone]);

  if (!message || dismissed) return null;

  const isError = tone === "error";
  return (
    <div className="toast" role={isError ? "alert" : "status"}>
      <span
        className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ring-1 ${
          isError ? "bg-danger-soft text-danger ring-danger-line" : "bg-success-soft text-success ring-success-line"
        }`}
      >
        {isError ? <FiAlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> : <FiCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <p className="min-w-0 flex-1 pt-px">{message}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
        className="-m-1 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted transition hover:bg-neutral-soft hover:text-ink"
      >
        <FiX className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ToastStack({ toasts = [] }) {
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map(({ id, message, tone }) => (
        <Toast key={id} message={message} tone={tone} />
      ))}
    </div>
  );
}
