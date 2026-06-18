/**
 * A CSS 3D flip card. Shows `front`; flips on hover/focus to reveal `back`.
 * Pure CSS (no JS) — give it a fixed height via `className` (e.g. "h-72") so
 * the absolutely-positioned back matches the front.
 */
export function FlipCard({
  front,
  back,
  className = "",
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group [perspective:1200px] ${className}`} tabIndex={0}>
      <div className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
        <div className="h-full w-full [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
}
