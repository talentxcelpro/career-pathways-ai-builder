import * as React from "react"
import { cn } from "@/lib/utils"
import { useAppleDesign } from "@/hooks/useAppleDesign"

// Apple-enhanced card with performance optimizations
const AppleCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'glass' | 'elevated' | 'minimal'
    appleEnhanced?: boolean
  }
>(({ className, variant = 'default', appleEnhanced = true, ...props }, ref) => {
  const { elementRef, classes } = useAppleDesign()
  
  const combinedRef = React.useCallback((node: HTMLDivElement) => {
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
    
    if (elementRef) {
      elementRef.current = node
    }
  }, [ref, elementRef])

  const variantClasses = {
    default: "rounded-xl border bg-card text-card-foreground shadow",
    glass: "rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-card-foreground shadow-lg",
    elevated: "rounded-xl border bg-card text-card-foreground shadow-xl hover:shadow-2xl transition-shadow duration-300",
    minimal: "rounded-lg bg-transparent text-card-foreground"
  }

  const appleClasses = appleEnhanced ? `${classes.optimized} ${classes.contain} ${classes.text}` : ''

  return (
    <div
      ref={combinedRef}
      className={cn(
        variantClasses[variant],
        appleClasses,
        className
      )}
      {...props}
    />
  )
})
AppleCard.displayName = "AppleCard"

const AppleCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { classes } = useAppleDesign()
  
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", classes.text, className)}
      {...props}
    />
  )
})
AppleCardHeader.displayName = "AppleCardHeader"

const AppleCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { classes } = useAppleDesign()
  
  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        classes.textPrimary,
        classes.cardTitle,
        className
      )}
      {...props}
    />
  )
})
AppleCardTitle.displayName = "AppleCardTitle"

const AppleCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { classes } = useAppleDesign()
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        classes.textSecondary,
        classes.cardText,
        className
      )}
      {...props}
    />
  )
})
AppleCardDescription.displayName = "AppleCardDescription"

const AppleCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { classes } = useAppleDesign()
  
  return (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", classes.cardText, className)} 
      {...props} 
    />
  )
})
AppleCardContent.displayName = "AppleCardContent"

const AppleCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { classes } = useAppleDesign()
  
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", classes.text, className)}
      {...props}
    />
  )
})
AppleCardFooter.displayName = "AppleCardFooter"

export {
  AppleCard,
  AppleCardHeader,
  AppleCardFooter,
  AppleCardTitle,
  AppleCardDescription,
  AppleCardContent,
}