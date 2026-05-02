import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Apple-grade Button
 * - Subtle motion (opacity + 1px translate), no scale jumps
 * - Tokenized colors only
 * - Inter, refined weight + tracking
 * - Legacy variants kept as soft aliases for backward compatibility
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-full font-medium tracking-[-0.01em]",
    "ring-offset-background transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:translate-y-px",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost:
          "bg-transparent text-foreground hover:bg-muted",
        link:
          "rounded-none px-0 text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // --- Legacy aliases, toned down to match Apple-grade system ---
        brand:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        premium:
          "border border-border bg-background text-foreground hover:bg-muted",
        glow:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        "mobile-primary":
          "bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] touch-manipulation",
        "mobile-glass":
          "border border-border bg-background/70 text-foreground backdrop-blur-md hover:bg-background touch-manipulation",
        "reels-action":
          "h-9 w-9 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 touch-manipulation",
        "reels-follow":
          "h-9 w-9 rounded-full border border-white/20 bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation",
        "reels-overlay":
          "rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10",
        "mobile-touch": "h-11 px-5 text-sm min-w-[44px]",
        "mobile-icon": "h-11 w-11 min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
