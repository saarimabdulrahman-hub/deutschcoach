/**
 * SplitPane — Two-panel split layout (left/right).
 * Used primarily for AuthLayout. Responsive: side-by-side on desktop, stacked on mobile.
 */

import type { CSSProperties, ReactNode } from "react";

type SplitRatio = "50/50" | "40/60" | "60/40" | "30/70";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  /** Left panel width ratio */
  ratio?: SplitRatio;
  /** Min height (default: 100vh) */
  minHeight?: string;
  className?: string;
  style?: CSSProperties;
}

const ratioMap: Record<SplitRatio, string> = {
  "50/50": "1fr 1fr",
  "40/60": "2fr 3fr",
  "60/40": "3fr 2fr",
  "30/70": "1fr 2.33fr",
};

export function SplitPane({
  left,
  right,
  ratio = "50/50",
  minHeight = "100vh",
  className = "",
  style,
}: SplitPaneProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        minHeight,
        ...style,
      }}
    >
      {/* Left panel — visible on all screen sizes, full-width on mobile */}
      <div
        className="split-pane-left"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {left}
      </div>

      {/* Right panel — below left on mobile, side-by-side on tablet+ */}
      <div
        className="split-pane-right"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {right}
      </div>

      {/* Desktop: side-by-side grid */}
      <style>{`
        @media (min-width: 640px) {
          .split-pane-left,
          .split-pane-right {
            grid-row: 1;
          }
          .split-pane-left { grid-column: 1; }
          .split-pane-right { grid-column: 2; }
        }
      `}</style>
    </div>
  );
}
