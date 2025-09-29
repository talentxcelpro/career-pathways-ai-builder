import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useAppleDesign } from "@/hooks/useAppleDesign"

// Apple-enhanced button variants that extend existing button styles
const appleButtonVariants = cva(
  "apple-optimized apple-hover apple-focus apple-text button-text-apple inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Enhanced default variants with Apple styling
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // New Apple-inspired variants
        apple: "bg-gradient-to-b from-white/10 to-white/5 text-apple-primary border border-white/20 shadow-lg backdrop-blur-sm hover:from-white/20 hover:to-white/10",
        appleSecondary: "bg-white/5 text-apple-secondary border border-white/10 hover:bg-white/10",
        applePrimary: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      appleStyle: {
        none: "",
        subtle: "backdrop-blur-sm",
        glass: "backdrop-blur-md bg-white/10 border border-white/20",
        elevated: "shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      appleStyle: "none",
    },
  }
)

export interface AppleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appleButtonVariants> {
  asChild?: boolean
}

const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ className, variant, size, appleStyle, asChild = false, ...props }, ref) => {
    const { elementRef } = useAppleDesign()
    
    const Comp = asChild ? Slot : "button"
    
    const combinedRef = React.useCallback((node: HTMLButtonElement) => {
      // Set both refs
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
      
      if (elementRef) {
        elementRef.current = node
      }
    }, [ref, elementRef])
    
    return (
      <Comp
        className={cn(appleButtonVariants({ variant, size, appleStyle, className }))}
        ref={combinedRef}
        {...props}
      />
    )
  }
)
AppleButton.displayName = "AppleButton"

export { AppleButton, appleButtonVariants }