// Server only Aicoo client. Never import this into a client component.
// The key is a user owned credential. It is read from the store on the server,
// passed straight to Aicoo, and never returned to the browser or written to a log.

const BASE = "https://www.aicoo.io/api/v1";

// Agent calls can take a while. Cap them so a slow agent does not hang a route.
const TIMEOUT_MS = 25000;

export class AicooError extends Error {
  status: number;
  code: string;
  body: unknown;
  constructor(status: number, code: string, body: unknown) {
    super(`aicoo request failed: ${status} ${code}`);
    this.name = "AicooError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

// Pull an error code out of whatever Aicoo returned on a failure.
function extractCode(body: unknown): string | null {
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    for (const k of ["code", "error", "message"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return null;
}

// Low level fetch wrapper. Parses JSON when present, falls back to raw text,
// and throws AicooError on any non 2xx response.
export async function aicoo<T = unknown>(
  key: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });

  const raw = await res.text();
  let body: unknown = raw;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  } else {
    body = null;
  }

  if (!res.ok) {
    throw new AicooError(res.status, extractCode(body) ?? `http_${res.status}`, body);
  }
  return body as T;
}

// Validate a freshly connected key by hitting /init. True only on a 200.
export async function validateKey(key: string): Promise<boolean> {
  try {
    await aicoo(key, "/init", { method: "POST", body: "{}" });
    return true;
  } catch {
    return false;
  }
}

export interface AgentReply {
  answer: string;
  escalate: boolean;
}

// Dig the assistant text out of the /chat response. The shape can vary, so we
// check the common fields and recurse into nested objects and arrays.
function extractText(data: unknown): string {
  if (typeof data === "string") return data.trim();
  if (Array.isArray(data)) {
    for (const item of data) {
      const t = extractText(item);
      if (t) return t;
    }
    return "";
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["message", "text", "content", "response", "answer", "reply", "result", "output"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    for (const k of ["message", "data", "result", "choices", "output"]) {
      const v = o[k];
      if (v && typeof v === "object") {
        const nested = extractText(v);
        if (nested) return nested;
      }
    }
  }
  return "";
}

// An empty reply, or one whose first word is the ESCALATE token, means the
// agent could not answer from permitted context.
function isEscalate(text: string): boolean {
  if (!text) return true;
  const firstWord = text.replace(/[`*_"'.,!?\s]+/g, " ").trim().toUpperCase().split(" ")[0];
  return firstWord === "ESCALATE";
}

// Ask a member's agent a question on that member's behalf. The agent answers
// from its owner's permitted context, or replies with ESCALATE when it cannot.
export async function askAgent(
  key: string,
  question: string,
  askerName: string,
): Promise<AgentReply> {
  const message = [
    "You are answering on behalf of your owner inside Relay, a team network where teammates query each other's agents instead of interrupting the person directly.",
    `A teammate named ${askerName} is asking your owner the question below. Answer it directly and concisely, in two to four sentences, using only the context your owner has permitted you to access. Write as your owner's assistant.`,
    "If you do not have enough permitted context to answer, or the question is sensitive, personal, or needs the human's own judgment, reply with exactly the single word ESCALATE and nothing else.",
    "",
    `Question from ${askerName}: ${question}`,
  ].join("\n");

  const data = await aicoo(key, "/chat", {
    method: "POST",
    body: JSON.stringify({ message, stream: false }),
  });

  const answer = extractText(data);
  const escalate = isEscalate(answer);
  return { answer: escalate ? "" : answer, escalate };
}

// Notify the human behind an agent that a request was escalated to them.
// Non critical, so this fails soft and reports whether it went through.
export async function notifyHuman(key: string, summary: string): Promise<boolean> {
  try {
    await aicoo(key, "/tools", {
      method: "POST",
      body: JSON.stringify({
        tool: "messaging.send_message_to_human",
        params: { message: summary },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

// Write a resolved question and answer back into the member's Relay folder so
// the next identical question is instant. Non critical, fails soft.
export async function accumulate(
  key: string,
  title: string,
  content: string,
): Promise<boolean> {
  try {
    await aicoo(key, "/accumulate", {
      method: "POST",
      body: JSON.stringify({
        texts: [{ title, content, folder: "Relay" }],
        folders: { create: ["Relay"] },
      }),
    });
    return true;
  } catch {
    return false;
  }
}
