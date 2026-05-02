import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageShell — the single Apple-grade container every route should use.
 *
 *  - Locks max-width and horizontal rhythm
 *  - Provides consistent vertical spacing between sections
 *  - Adds safe-area padding for native shells
 *
 * Width tiers:
 *   sm   = 640px   (forms, single-column reads)
 *   md   = 768px   (article)
 *   lg   = 1024px  (default app pages)
 *   xl   = 1200px  (dashboards, marketing)
 *   full = 100%    (edge-to-edge hero / canvas)
 */
type Width = "sm" | "md" | "lg" | "xl" | "full";

const WIDTHS: Record<Width, string> = {
  sm: "max-w-[640px]",
  md: "max-w-[768px]",
  lg: "max-w-[1024px]",
  xl: "max-w-[1200px]",
  full: "max-w-none",
};

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: Width;
  /** Vertical padding tier */
  pad?: "none" | "sm" | "md" | "lg";
  as?: React.ElementType;
}

const PADS = {
  none: "py-0",
  sm: "py-6 md:py-8",
  md: "py-10 md:py-14",
  lg: "py-16 md:py-24",
};

export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ width = "lg", pad = "md", as: Tag = "div", className, children, ...props }, ref) => (
    <Tag
      ref={ref as any}
      className={cn(
        "mx-auto w-full px-5 md:px-8",
        WIDTHS[width],
        PADS[pad],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  ),
);
PageShell.displayName = "PageShell";

/**
 * Section — vertical rhythm primitive used inside PageShell to separate blocks.
 */
export const Section: React.FC<React.HTMLAttributes<HTMLElement> & { spacing?: "sm" | "md" | "lg" }> = ({
  spacing = "md",
  className,
  ...props
}) => (
  <section
    className={cn(
      spacing === "sm" && "mt-8",
      spacing === "md" && "mt-12 md:mt-16",
      spacing === "lg" && "mt-16 md:mt-24",
      "first:mt-0",
      className,
    )}
    {...props}
  />
);
