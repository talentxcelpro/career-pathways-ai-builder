import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader — Apple-grade page intro used at the top of every route.
 *
 * Slots:
 *   eyebrow  — small uppercase label above the title (optional)
 *   title    — the page H1
 *   description — one-sentence subtitle (optional)
 *   actions  — primary actions (right-aligned on desktop)
 *
 * Sizes:
 *   sm  = sub-pages (settings, list views)
 *   md  = main app pages (default)
 *   lg  = marketing / hero
 */
interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  size = "md",
  align = "start",
  className,
}) => {
  const titleClass =
    size === "lg"
      ? "text-display-2 md:text-display-1"
      : size === "md"
        ? "text-headline md:text-display-3"
        : "text-title-1";

  const descClass =
    size === "lg" ? "text-body-lg md:text-lg" : "text-body md:text-body-lg";

  return (
    <header
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className={cn("text-foreground tracking-tight", titleClass)}>
          {title}
        </h1>
        {description ? (
          <p className={cn("text-muted-foreground", descClass)}>{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
};
