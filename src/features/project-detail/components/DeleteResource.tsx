import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resources } from "@/services/resources";
import { useDisclosure } from "@domeadev/react-disclosure";
import { Slot, SlotProps } from "@radix-ui/react-slot";
import { toast } from "sonner";

interface Props extends SlotProps {
  resourceId: number;
}

export type DeleteResourceProps = Props;

export function DeleteResource({
  resourceId,
  children,
  ...props
}: Props) {
  const deleteMutation = resources.delete.useMutation();
  const [open, toggleOpen] = useDisclosure();

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>
        <Slot {...props}>{children}</Slot>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Recycle Bin</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to move this resource to the recycle bin?
          You can restore it later or permanently delete it from there.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={deleteMutation.isPending}
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate(
                { id: resourceId },
                {
                  onSuccess: () => {
                    toast.success("Resource moved to recycle bin");
                    toggleOpen(false);
                  },
                  onError: () => {
                    toast.error("Failed to move resource to recycle bin");
                  },
                },
              );
            }}
          >
            Move to Recycle Bin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
