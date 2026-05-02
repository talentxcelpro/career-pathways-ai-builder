import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Apple-grade Badge
 * - Pill, subdued by default, no glow/animation
 * - Soft tonal variants for status; legacy aliases kept
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-[-0.005em] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background",
        secondary:
          "border-transparent bg-muted text-foreground",
        outline:
          "border-border bg-transparent text-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive",
        success:
          "border-transparent bg-success/10 text-success",
        warning:
          "border-transparent bg-warning/10 text-warning",
        // Legacy aliases — flattened
        brand:
          "border-transparent bg-primary text-primary-foreground",
        premium:
          "border-border bg-background text-foreground",
        glow:
          "border-transparent bg-primary text-primary-foreground",
      },
      size: {
        default: "h-5 px-2.5 text-[11px]",
        sm: "h-4 px-2 text-[10px]",
        lg: "h-6 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
