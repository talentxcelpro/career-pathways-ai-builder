import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & {
  variant?: 'default' | 'premium' | 'glass';
}>(({ className, type, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
    premium: "flex h-10 w-full rounded-md border border-input bg-gradient-card px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:shadow-elegant disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 hover:shadow-card",
    glass: "flex h-10 w-full rounded-md border border-glass-border bg-gradient-glass backdrop-blur-apple px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:shadow-glass disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300"
  };

  return (
    <input
      type={type}
      className={cn(variantClasses[variant], className)}
      ref={ref}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }
