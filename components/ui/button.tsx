import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variant === "default" && "bg-primary text-white dark:text-black",
        variant === "outline" && "border border-border bg-card",
        variant === "ghost" && "hover:bg-accent",
        className
      )}
      {...props}
    />
  );
}
