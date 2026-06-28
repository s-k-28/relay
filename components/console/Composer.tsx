"use client";

import { useEffect, useRef, useState } from "react";
import type { Member, ThreadMessage } from "../types";
import { Avatar } from "./Avatar";
import { SignalDot } from "../brand";
import { ArrowUpRight, Hand, Node, Send } from "../icons";

function startersFor(member: Member): string[] {
  const r = member.role.toLowerCase();
  let topical: string[];
  if (/product|pm\b|head of product/.test(r)) {
    topical = ["What is the Q3 launch date and who owns it?", "What is the priority order this cycle?"];
  } else if (/eng|platform|developer|software|infra/.test(r)) {
    topical = ["How do deploys go out to production?", "What are the agent API rate limits?"];
  } else if (/design/.test(r)) {
    topical = ["What is our color and type system?", "Where do the components live?"];
  } else if (/revenue|sales|ops|account exec/.test(r)) {
    topical = ["What is our standing discount authority?", "What is the list price per seat?"];
  } else if (/success|support|customer/.test(r)) {
    topical = ["How do we onboard a new account?", "When do renewals open?"];
  } else {
    topical = [`What should I know before I ask ${member.name.split(" ")[0]} directly?`];
  }
  // one sensitive prompt so the escalation path is one click away in a demo
  return [...topical, "What is the comp band for this role?"].slice(0, 3);
}

function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Composer({
  selected,
  messages,
  thinking,
  escalated,
  onSend,
}: {
  selected: Member | null;
  messages: ThreadMessage[];
  thinking: boolean;
  escalated: boolean;
  onSend: (q: string) => void;
}) {
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  function send() {
    const q = value.trim();
    if (!q || !selected || thinking) return;
    onSend(q);
    setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!selected) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-line bg-card px-8 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-raised text-faint">
          <Node className="h-6 w-6" />
        </span>
        <p className="mt-5 text-[16px] font-medium text-ink">Pick an agent to ask</p>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
          Choose anyone in the network. Their agent answers from the context they allowed, and only
          pulls them in when it has to.
        </p>
      </div>
    );
  }

  const firstName = selected.name.split(" ")[0];
  const empty = messages.length === 0 && !thinking;

  return (
    <div className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-2xl border border-line bg-card">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-panel/40 px-5 py-4">
        <Avatar name={selected.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-ink">{selected.name}</p>
          <p className="truncate text-[12px] text-faint">{selected.role}</p>
        </div>
        <span className="flex items-center gap-1.5">
          <SignalDot online={selected.online} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {selected.online ? "agent live" : "agent away"}
          </span>
        </span>
      </div>

      {/* thread */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {empty && (
          <div className="anim-fade">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
              Ask {firstName}&apos;s agent
            </p>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
              It answers from {firstName}&apos;s permitted context. Try one of these, or write your
              own.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {startersFor(selected).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-bg/40 px-3.5 py-2.5 text-left text-[13.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  {s}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ghost transition-colors group-hover:text-signal-dim" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={`${m.ts}-${i}`} message={m} name={selected.name} isLatest={i === messages.length - 1} />
        ))}

        {thinking && (
          <div className="flex items-start gap-3 anim-fade">
            <Avatar name={selected.name} size="sm" />
            <div className="rounded-2xl rounded-tl-sm border border-line bg-raised px-4 py-3">
              <span className="flex items-center gap-1.5">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-faint"
                    style={{ animation: `thinking 1.3s ease-in-out ${d * 0.18}s infinite` }}
                  />
                ))}
                <span className="ml-1.5 text-[12.5px] text-faint">
                  {firstName}&apos;s agent is checking their context
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* escalation banner */}
      {escalated && !thinking && (
        <div className="anim-fade flex items-start gap-2.5 border-t border-amber/30 bg-amber-deep/40 px-5 py-3">
          <Hand className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[13px] leading-relaxed text-amber">
            Escalated to {firstName}. The agent stepped back and notified the human with the full
            thread attached. You will hear back from them directly.
          </p>
        </div>
      )}

      {/* composer */}
      <div className="border-t border-line bg-panel/40 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-line-strong bg-bg/60 px-3 py-2 focus-within:border-signal/60">
          <label htmlFor="composer" className="sr-only">
            Ask {selected.name} a question
          </label>
          <textarea
            id="composer"
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={thinking}
            placeholder={`Ask ${firstName}'s agent a question`}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[14.5px] leading-relaxed text-ink placeholder:text-ghost focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!value.trim() || thinking}
            aria-label="Send question"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-signal text-bg transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1 font-mono text-[10.5px] text-ghost">
          Enter to send, Shift and Enter for a new line.
        </p>
      </div>
    </div>
  );
}

function Bubble({ message, name, isLatest }: { message: ThreadMessage; name: string; isLatest: boolean }) {
  if (message.role === "requester") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-br-sm border border-line-strong bg-raised px-4 py-2.5 text-[14.5px] leading-relaxed text-ink">
            {message.text}
          </div>
          <p className="mt-1 pr-1 text-right font-mono text-[10px] text-ghost">You · {clock(message.ts)}</p>
        </div>
      </div>
    );
  }

  const human = message.role === "human";
  return (
    <div className={`flex items-start gap-3 ${isLatest ? "anim-fade" : ""}`}>
      <Avatar name={name} size="sm" />
      <div className="max-w-[82%]">
        <div
          className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-[14.5px] leading-relaxed ${
            human ? "border-amber/35 bg-amber-deep/30 text-ink" : "border-line bg-raised text-ink"
          }`}
        >
          {isLatest ? (
            <span aria-label={message.text}>
              {message.text.split(" ").map((w, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="mr-[0.26em] inline-block"
                  style={{ animation: `word-rise 0.42s ease ${Math.min(i * 0.02, 0.7)}s both` }}
                >
                  {w}
                </span>
              ))}
            </span>
          ) : (
            message.text
          )}
        </div>
        <p className="mt-1 pl-1 font-mono text-[10px] text-ghost">
          {human ? `${name.split(" ")[0]} (human)` : `${name.split(" ")[0]}'s agent`} · {clock(message.ts)}
        </p>
      </div>
    </div>
  );
}
