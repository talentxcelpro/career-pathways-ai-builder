import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-elegant hover:shadow-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-gradient-card hover:text-accent-foreground hover:shadow-card",
        secondary: "bg-gradient-card text-secondary-foreground hover:bg-secondary/80 hover:shadow-card",
        ghost: "hover:bg-gradient-card hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-light",
        brand: "bg-gradient-brand text-white hover:shadow-brand hover:shadow-glow",
        premium: "bg-gradient-glass backdrop-blur-apple border border-glass-border text-foreground hover:shadow-glass hover:bg-gradient-brand-soft",
        glow: "bg-primary text-primary-foreground hover:shadow-glow animate-glow-pulse",
        // Mobile-optimized variants
        "mobile-primary": "bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] touch-manipulation",
        "mobile-glass": "bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 border border-white/20 touch-manipulation",
        // Reels-specific variants
        "reels-action": "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20 rounded-full h-9 w-9 touch-manipulation",
        "reels-follow": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg touch-manipulation border border-white/20 rounded-full h-9 w-9",
        "reels-overlay": "bg-black/50 text-white hover:bg-black/70 rounded-full touch-manipulation",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-md px-6 text-base font-semibold",
        xl: "h-12 rounded-md px-8 text-lg font-semibold",
        icon: "h-8 w-8",
        "mobile-touch": "h-11 px-4 text-sm font-medium min-w-[44px]",
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
