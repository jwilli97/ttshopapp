import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        processing: "border-transparent bg-blue-300 text-blue-800 hover:bg-blue-400",
        preparing: "border-transparent bg-yellow-300 text-yellow-800 hover:bg-yellow-400",
        outForDelivery: "border-transparent bg-accent text-black hover:bg-accent/80",
        completed: "border-transparent bg-green-300 text-green-800 hover:bg-green-400",
        cancelled: "border-transparent bg-red-300 text-red-800 hover:bg-red-400",
        betaTester: "bg-purple-600 hover:bg-purple-700 text-white",
        dev: "bg-blue-600 hover:bg-blue-700 text-white",
        ceo: "bg-accent hover:bg-accent/80 text-black",
        hr: "bg-pink-600 hover:bg-pink-700 text-white",
        designer: "bg-indigo-600 hover:bg-indigo-700 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
