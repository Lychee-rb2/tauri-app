import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const codeVariants = cva("px-2 py-1 font-jb-mono", {
  variants: {
    variant: {
      title: "text-blue-700 dark:text-blue-300",
      cmd: "text-lime-700 dark:text-lime-300",
      stdout: "text-foreground/50 italic",
    },
  },
  defaultVariants: {
    variant: "stdout",
  },
});

export interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {
  content: string;
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, variant, content, ...props }, ref) => {
    const prefix = {
      title: "$ ",
      cmd: "> ",
      stdout: "",
    }[variant || "stdout"];
    return (
      <code
        className={cn(codeVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {prefix + content}
      </code>
    );
  },
);

Code.displayName = "Code";

const codeBlockVariants = cva("flex flex-col text-sm bg-muted rounded", {
  variants: {
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface CodeBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeBlockVariants> {
  asChild?: boolean;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn(codeBlockVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { Code, codeVariants, CodeBlock, codeBlockVariants };
