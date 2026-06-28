"use client";

import { useEffect, useState } from "react";

// Types a phrase, holds, deletes, advances. setTimeout driven, no Date.now, no library.
// The animated text is aria-hidden; a static label carries meaning for assistive tech.
export function Typewriter({
  words,
  typingSpeed = 58,
  deletingSpeed = 30,
  pause = 1700,
  className = "",
  caretClassName = "",
}: {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
  className?: string;
  caretClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    let timer: number;

    if (!deleting && text === current) {
      timer = window.setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    } else {
      timer = window.setTimeout(
        () => setText((s) => (deleting ? current.slice(0, s.length - 1) : current.slice(0, s.length + 1))),
        deleting ? deletingSpeed : typingSpeed,
      );
    }
    return () => window.clearTimeout(timer);
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pause]);

  return (
    <span className={className} aria-label={words.join(". ")}>
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className={`ml-0.5 inline-block ${caretClassName}`}
        style={{ animation: "caret 1.05s steps(1) infinite" }}
      >
        ▍
      </span>
    </span>
  );
}
