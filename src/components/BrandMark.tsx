export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} aria-label="Harmonije Panonije">
      <svg className="brand-mark__icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 35V21L24 10l16 11v14H8Z" />
        <path d="M17 35V25h14v10" />
        <ellipse cx="36.5" cy="10.5" rx="4.5" ry="3.2" transform="rotate(-18 36.5 10.5)" />
        <path className="brand-mark__bee-line" d="M32.5 10.5h8M35.5 7.5l2 6M32.5 7c-2.5-3.5-6-1.5-5 1.5M40.5 7c2-3.5 5.2-2.5 5 1" />
      </svg>
      <span className="brand-mark__words">
        <strong>Harmonije</strong>
        <span>Panonije</span>
      </span>
    </span>
  );
}
