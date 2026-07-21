import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Logo } from "@/components/ui/Logo";
import { SpeakIcon } from "@/components/ui/SpeakIcon";
import userEvent from "@testing-library/user-event";

// ── EmptyState ────────────────────────────────────────────────────────

describe("EmptyState", () => {
  it("renders title and default icon", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Empty" description="Nothing to see here" />);
    expect(screen.getByText("Nothing to see here")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        title="No lessons"
        action={{ label: "Go to lessons", onClick: () => {} }}
      />
    );
    expect(screen.getByText("Go to lessons →")).toBeInTheDocument();
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

// ── ErrorState ────────────────────────────────────────────────────────

describe("ErrorState", () => {
  it("renders default message when none provided", () => {
    render(<ErrorState />);
    expect(screen.getByText("Failed to load data.")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorState message="Custom error occurred" />);
    expect(screen.getByText("Custom error occurred")).toBeInTheDocument();
  });

  it("renders retry button when onRetry provided", () => {
    render(<ErrorState message="Error" onRetry={() => {}} />);
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls onRetry when button clicked", async () => {
    let called = false;
    render(<ErrorState message="Error" onRetry={() => { called = true; }} />);
    await userEvent.click(screen.getByText("Try Again"));
    expect(called).toBe(true);
  });

  it("does not render retry button when onRetry not provided", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});

// ── Skeleton ──────────────────────────────────────────────────────────

describe("Skeleton", () => {
  it("card variant renders without crashing", () => {
    const { container } = render(<Skeleton variant="card" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("dashboard variant renders without crashing", () => {
    const { container } = render(<Skeleton variant="dashboard" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("list variant renders correct number of items", () => {
    const { container } = render(<Skeleton variant="list" lines={3} />);
    // Should render 3 list item skeletons with shimmer
    const items = container.querySelectorAll(".shimmer");
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
});

// ── Logo ──────────────────────────────────────────────────────────────

describe("Logo", () => {
  it("renders an SVG logo", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 48 48");
  });

  it("renders with different sizes", () => {
    const { container } = render(<Logo size={60} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("60");
    expect(svg?.getAttribute("height")).toBe("60");
  });
});

// ── SpeakIcon ─────────────────────────────────────────────────────────

describe("SpeakIcon", () => {
  it("renders an SVG icon", () => {
    const { container } = render(<SpeakIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("renders at custom size", () => {
    const { container } = render(<SpeakIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
  });
});
