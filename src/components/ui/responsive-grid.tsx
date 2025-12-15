import { cn } from "@/lib/utils";
import React from "react";

const Root = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, forwardedRef) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        className
      )}
      ref={forwardedRef}
      {...props}
    />
  );
});
Root.displayName = "ResponsiveGrid.Root";

const Item = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, forwardedRef) => {
  return (
    <div
      className={cn(
        "relative flex flex-col border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all ",
        className
      )}
      ref={forwardedRef}
      {...props}
    />
  );
});
Item.displayName = "ResponsiveGrid.item";

export const ResponseGrid = Object.assign(Root, {
  Item,
});
