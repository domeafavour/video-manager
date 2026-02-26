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
import { useState } from "react";

interface Props extends SlotProps {
  resourceId: number;
  resourcePath: string;
}

export type DeleteResourceProps = Props;

export function DeleteResource({
  resourceId,
  resourcePath,
  children,
  ...props
}: Props) {
  const deleteMutation = resources.delete.useMutation();
  const { data, refetch } = resources.getMaterialsByPath.useQuery({
    variables: { path: resourcePath },
  });
  const [open, toggleOpen] = useDisclosure();
  const shouldConfirmDeleteNative =
    data?.length === 1 && data[0].id === resourceId;
  const [shouldDeleteNative, setShouldDeleteNative] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogTrigger
        asChild
        onClick={() => {
          refetch();
          setShouldDeleteNative(false);
        }}
      >
        <Slot {...props}>{children}</Slot>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Resource</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this resource?
        </DialogDescription>
        {shouldConfirmDeleteNative ? (
          <div>
            <label className="inline-flex flex-row items-start space-x-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={shouldDeleteNative}
                onChange={(e) => setShouldDeleteNative(e.target.checked)}
              />
              <span className="text-xs text-destructive">
                This file is not used by any other projects. Do you want to
                delete the native file as well?
              </span>
            </label>
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={deleteMutation.isPending}
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate(
                {
                  id: resourceId,
                  shouldDeleteNative,
                },
                {
                  onSuccess: () => {
                    toggleOpen(false);
                  },
                },
              );
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
