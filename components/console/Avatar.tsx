// Monogram avatar derived from a name. Calm and neutral, with a signal ring for "you".

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: "h-8 w-8 text-[12px]",
  md: "h-10 w-10 text-[14px]",
  lg: "h-12 w-12 text-[16px]",
};

export function Avatar({
  name,
  you = false,
  size = "md",
}: {
  name: string;
  you?: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-full border font-mono font-medium ${SIZES[size]} ${
        you
          ? "border-signal/50 bg-signal-deep text-signal"
          : "border-line-strong bg-raised text-muted"
      }`}
    >
      {initials(name)}
    </span>
  );
}
