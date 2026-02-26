import { Slot, SlotProps } from "@radix-ui/react-slot";
import { useDeleteResource } from "../hooks/useDeleteResource";

interface Props extends SlotProps {
  resourceId: number;
}

export type DeleteResourceProps = Props;

export function DeleteResource({
  resourceId,
  children,
  onClick,
  ...props
}: Props) {
  const [deleteResource] = useDeleteResource();
  return (
    <Slot
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) {
          return;
        }
        deleteResource(resourceId);
      }}
      {...props}
    >
      {children}
    </Slot>
  );
}
