"use client";

import { Fragment, useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

/* UI-only: copy a code block to the clipboard. */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard unavailable — leave the button as-is */
    }
  };

  return (
    <button type="button" className="copy-btn" onClick={copy} data-copied={copied} aria-label={copied ? "Copied" : "Copy code"}>
      {copied ? <FiCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <FiCopy className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function InlineMarkdown({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export default function MarkdownRenderer({ content = "" }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      index += 1;
      blocks.push(<div key={`code-${index}`} className="code-block"><pre><code>{code.join("\n")}</code></pre><CopyButton text={code.join("\n")} /></div>);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      blocks.push(<Tag key={`heading-${index}`}><InlineMarkdown text={heading[2]} /></Tag>);
      index += 1; continue;
    }
    if (/^\s*([-*+] |\d+\. )/.test(line)) {
      const ordered = /^\s*\d+\. /.test(line);
      const items = [];
      while (index < lines.length && /^\s*([-*+] |\d+\. )/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*(?:[-*+] |\d+\. )/, "")); index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown text={item} /></li>)}</List>);
      continue;
    }
    if (line.startsWith("> ")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith("> ")) quote.push(lines[index++].slice(2));
      blocks.push(<blockquote key={`quote-${index}`}>{quote.map((text, i) => <p key={i}><InlineMarkdown text={text} /></p>)}</blockquote>);
      continue;
    }
    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) { blocks.push(<hr key={`hr-${index}`} />); index += 1; continue; }
    const paragraph = [line]; index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,4}\s|```|\s*([-*+] |\d+\. )|> )/.test(lines[index])) paragraph.push(lines[index++]);
    blocks.push(<p key={`p-${index}`}>{paragraph.map((text, i) => <Fragment key={i}>{i > 0 && <br />}<InlineMarkdown text={text.replace(/\s{2,}$/, "")} /></Fragment>)}</p>);
  }
  return <article className="prose-doc">{blocks}</article>;
}
