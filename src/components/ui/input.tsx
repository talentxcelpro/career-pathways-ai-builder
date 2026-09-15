import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Apple-grade Input
 * - 44px touch height, hairline border, calm focus ring
 * - Tokenized only; legacy `premium` / `glass` flattened
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    variant?: "default" | "premium" | "glass"
  }
>(({ className, type, variant = "default", ...props }, ref) => {
  const base =
    "flex h-11 w-full rounded-xl border bg-background px-4 py-2 text-sm text-foreground ring-offset-background " +
    "placeholder:text-muted-foreground/70 " +
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "transition-colors duration-200"

  const variantClasses: Record<string, string> = {
    default: `${base} border-border`,
    premium: `${base} border-border`,
    glass: `${base} border-border/60 bg-background/70 backdrop-blur-xl`,
  }

  return (
    <input
      type={type}
      className={cn(variantClasses[variant], className)}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
