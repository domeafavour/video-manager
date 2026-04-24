import { forwardRef } from "react";
import type { ComponentProps, ElementRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { DialogContent } from "./dialog";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface VmShellProps extends ComponentProps<"div"> {}

export const VmShell = forwardRef<HTMLDivElement, VmShellProps>(
  function VmShell({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-(--vm-shell-bg) text-(--vm-foreground) [font-family:"DM Sans",system-ui,sans-serif]',
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmShellGlowProps extends ComponentProps<"div"> {}

export const VmShellGlow = forwardRef<HTMLDivElement, VmShellGlowProps>(
  function VmShellGlow({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute inset-0 [background:var(--vm-shell-glow)]",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmPanelProps extends ComponentProps<"div"> {}

export const VmPanel = forwardRef<HTMLDivElement, VmPanelProps>(function VmPanel(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border p-4 backdrop-blur-sm md:p-5",
        "border-(--vm-panel-border) bg-(--vm-panel-bg)",
        className,
      )}
      {...props}
    />
  );
});

interface VmTextBaseProps {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

type VmEyebrowProps = VmTextBaseProps &
  Omit<ComponentProps<"div">, "children" | "className">;

export const VmEyebrow = forwardRef<HTMLElement, VmEyebrowProps>(
  function VmEyebrow({ as: Component = "div", className, children, ...props }, ref) {
    return (
      <Component
        ref={ref as never}
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em] text-(--vm-muted)",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

type VmTitleProps = VmTextBaseProps &
  Omit<ComponentProps<"div">, "children" | "className">;

export const VmTitle = forwardRef<HTMLElement, VmTitleProps>(function VmTitle(
  { as: Component = "div", className, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref as never}
      className={cn(
        'text-(--vm-title) [font-family:"Playfair Display",serif]',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

interface VmDialogContentProps extends ComponentProps<typeof DialogContent> {}

export const VmDialogContent = forwardRef<
  ElementRef<typeof DialogContent>,
  VmDialogContentProps
>(function VmDialogContent({ className, ...props }, ref) {
  return (
    <DialogContent
      ref={ref}
      className={cn(
        'border-[rgba(214,174,102,0.16)] bg-(--vm-shell-bg) p-6 text-(--vm-foreground) shadow-[0_28px_70px_rgba(0,0,0,0.34)] [font-family:"DM Sans",system-ui,sans-serif]',
        className,
      )}
      {...props}
    />
  );
});

interface VmInputProps extends ComponentProps<typeof Input> {}

export const VmInput = forwardRef<ElementRef<typeof Input>, VmInputProps>(
  function VmInput({ className, ...props }, ref) {
    return (
      <Input
        ref={ref}
        className={cn(
          "shadow-none border-(--vm-input-border) bg-(--vm-input-bg) text-(--vm-foreground) placeholder:text-[#756d60] focus-visible:border-[rgba(214,174,102,0.38)] focus-visible:ring-[rgba(214,174,102,0.12)]",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmTitleInputProps extends ComponentProps<typeof Input> {}

export const VmTitleInput = forwardRef<
  ElementRef<typeof Input>,
  VmTitleInputProps
>(function VmTitleInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      className={cn(
        'h-auto border-0 bg-transparent px-0 py-0 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[0.95] text-(--vm-title) shadow-none ring-0 placeholder:text-[#756d60] focus-visible:ring-0 [font-family:"Playfair Display",serif]',
        className,
      )}
      {...props}
    />
  );
});

interface VmTextareaProps extends ComponentProps<typeof Textarea> {}

export const VmTextarea = forwardRef<
  ElementRef<typeof Textarea>,
  VmTextareaProps
>(function VmTextarea({ className, ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "shadow-none border-(--vm-input-border) bg-(--vm-input-bg) text-(--vm-foreground) placeholder:text-[#756d60] focus-visible:border-[rgba(214,174,102,0.38)] focus-visible:ring-[rgba(214,174,102,0.12)]",
        className,
      )}
      {...props}
    />
  );
});

type VmButtonTone = "gold" | "muted";
type VmGlassIconButtonTone = "default" | "danger";

interface VmButtonProps extends ComponentProps<typeof Button> {
  tone?: VmButtonTone;
}

export const VmButton = forwardRef<ElementRef<typeof Button>, VmButtonProps>(
  function VmButton({ tone = "gold", className, ...props }, ref) {
    return (
      <Button
        ref={ref}
        className={cn(
          tone === "gold"
            ? "border border-[rgba(214,174,102,0.24)] bg-(--vm-gold-bg) text-(--vm-gold-text) shadow-none hover:bg-(--vm-gold-bg-strong)"
            : "border-[rgba(214,174,102,0.16)] bg-[rgba(255,255,255,0.04)] text-[#cfc5b5] shadow-none hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5dec0]",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmGlassIconButtonProps extends ComponentProps<typeof Button> {
  tone?: VmGlassIconButtonTone;
}

export const VmGlassIconButton = forwardRef<
  ElementRef<typeof Button>,
  VmGlassIconButtonProps
>(function VmGlassIconButton({ tone = "default", className, ...props }, ref) {
  return (
    <Button
      ref={ref}
      className={cn(
        "rounded-xl border-0 bg-[rgba(255,255,255,0.08)] text-[#d8c7aa] shadow-none backdrop-blur-sm",
        tone === "danger"
          ? "hover:bg-[rgba(239,68,68,0.16)] hover:text-[#ffb3b3]"
          : "hover:bg-[rgba(255,255,255,0.14)] hover:text-[#f5dec0]",
        className,
      )}
      {...props}
    />
  );
});

interface VmChipProps extends ComponentProps<"div"> {
  as?: ElementType;
}

export const VmChip = forwardRef<HTMLElement, VmChipProps>(function VmChip(
  { as: Component = "div", className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref as never}
      className={cn(
        "rounded-full border border-[rgba(214,174,102,0.18)] bg-[rgba(214,174,102,0.1)] text-(--vm-gold-soft-text)",
        className,
      )}
      {...props}
    />
  );
});

interface VmNavChipProps extends ComponentProps<"div"> {
  active?: boolean;
}

export const VmNavChip = forwardRef<HTMLDivElement, VmNavChipProps>(
  function VmNavChip({ active = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border transition-all duration-200",
          active
            ? "border-[rgba(214,174,102,0.24)] bg-[rgba(214,174,102,0.14)] text-[#f1d6a0] shadow-[0_10px_20px_rgba(0,0,0,0.18)]"
            : "border-transparent text-[#9d937f] hover:border-[rgba(214,174,102,0.14)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e7dece]",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmIconBadgeProps extends ComponentProps<"div"> {}

export const VmIconBadge = forwardRef<HTMLDivElement, VmIconBadgeProps>(
  function VmIconBadge({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex aspect-square items-center justify-center rounded-lg border border-[rgba(214,174,102,0.18)] bg-[rgba(214,174,102,0.12)] text-[#f1d6a0]",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmGlassToolbarProps extends ComponentProps<"div"> {}

export const VmGlassToolbar = forwardRef<HTMLDivElement, VmGlassToolbarProps>(
  function VmGlassToolbar({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-[rgba(214,174,102,0.16)] bg-[rgba(10,11,14,0.64)] p-1 backdrop-blur-md",
          className,
        )}
        {...props}
      />
    );
  },
);

interface VmEmptyStateProps extends ComponentProps<"div"> {}

export const VmEmptyState = forwardRef<HTMLDivElement, VmEmptyStateProps>(
  function VmEmptyState({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border border-dashed border-[rgba(214,174,102,0.18)] bg-[rgba(19,21,26,0.72)] px-6 py-16 text-center text-(--vm-muted-strong)",
          className,
        )}
        {...props}
      />
    );
  },
);

VmShell.displayName = "VmShell";
VmShellGlow.displayName = "VmShellGlow";
VmPanel.displayName = "VmPanel";
VmEyebrow.displayName = "VmEyebrow";
VmTitle.displayName = "VmTitle";
VmDialogContent.displayName = "VmDialogContent";
VmInput.displayName = "VmInput";
VmTitleInput.displayName = "VmTitleInput";
VmTextarea.displayName = "VmTextarea";
VmButton.displayName = "VmButton";
VmGlassIconButton.displayName = "VmGlassIconButton";
VmChip.displayName = "VmChip";
VmNavChip.displayName = "VmNavChip";
VmIconBadge.displayName = "VmIconBadge";
VmGlassToolbar.displayName = "VmGlassToolbar";
VmEmptyState.displayName = "VmEmptyState";