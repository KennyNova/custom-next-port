import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-destructive/20",
        outline:
          "border-2 border-primary bg-background hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 shadow-sm hover:shadow-md text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-secondary/30",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-success/20",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-warning/20",
        info: "bg-info text-info-foreground hover:bg-info/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-info/20",
        gradient: "bg-gradient-to-r from-pastel-pink via-pastel-lavender to-pastel-sky text-foreground hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-pastel-pink/30",
        'gradient-secondary': "bg-gradient-to-r from-pastel-mint via-pastel-peach to-pastel-rose text-foreground hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-pastel-mint/30",
        'gradient-sunset': "bg-gradient-to-r from-pastel-peach via-pastel-rose to-pastel-pink text-foreground hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-pastel-peach/30",
        'gradient-ocean': "bg-gradient-to-r from-pastel-sky via-pastel-mint to-pastel-sage text-foreground hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-pastel-sky/30",
        'gradient-dream': "bg-gradient-to-r from-pastel-lavender via-pastel-pink to-pastel-cream text-foreground hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-pastel-lavender/30",

      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        'icon-sm': "h-8 w-8",
        'icon-lg': "h-12 w-12",
      },
      animation: {
        none: "",
        bounce: "animate-bounce-in",
        slide: "animate-slide-in",
        scale: "animate-scale-in",
        float: "animate-float",
        glow: "animate-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading
    
    const content = (
      <>
        {loading && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        )}
        {!loading && (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </>
    )
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }