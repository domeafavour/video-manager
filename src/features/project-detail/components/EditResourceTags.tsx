import { useDisclosure } from "@domeadev/react-disclosure";
import { Slot, SlotProps } from "@radix-ui/react-slot";
import { EditTagsDialog } from "./EditTagsDialog";

interface Props extends SlotProps {
  resourceId: number;
  tags?: string[];
}

export type EditResourceTagsProps = Props;

export function EditResourceTags({
  resourceId,
  tags,
  children,
  ...props
}: Props) {
  const [open, toggleOpen] = useDisclosure();
  return (
    <>
      <Slot
        onClick={() => {
          toggleOpen(true);
        }}
        {...props}
      >
        {children}
      </Slot>
      <EditTagsDialog
        open={open}
        onOpenChange={toggleOpen}
        resourceId={resourceId}
        initialTags={tags ?? []}
      />
    </>
  );
}
