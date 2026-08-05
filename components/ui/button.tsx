import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-brand)] text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]",
        accent: "bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]",
        outline:
          "border border-[var(--color-line-strong)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface)]",
        ghost: "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]",
        crisis:
          "border border-[var(--color-crisis)] bg-transparent text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { button as buttonVariants };
