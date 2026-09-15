import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Apple-grade Card
 * - Hairline border, no heavy shadows by default
 * - Generous padding rhythm (p-6 / p-8 via size)
 * - Tokenized only; legacy variants kept as soft aliases
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "muted" | "outline" | "premium" | "glass" | "elegant" | "floating"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses: Record<string, string> = {
    default: "rounded-2xl border border-border bg-card text-card-foreground",
    muted: "rounded-2xl border border-border bg-muted/40 text-card-foreground",
    outline: "rounded-2xl border border-border bg-transparent text-card-foreground",
    // Legacy aliases — flattened to Apple-grade
    premium: "rounded-2xl border border-border bg-card text-card-foreground transition-colors duration-200",
    glass: "rounded-2xl border border-border/60 bg-background/70 text-card-foreground backdrop-blur-xl",
    elegant: "rounded-2xl border border-border bg-card text-card-foreground transition-colors duration-200",
    floating: "rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md",
  }

  return (
    <div
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-title-2 font-semibold tracking-[-0.01em] text-card-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
