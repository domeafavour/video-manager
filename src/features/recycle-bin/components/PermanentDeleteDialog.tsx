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
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  material: { id: number; name: string; path: string };
  onConfirm: (shouldDeleteNative: boolean) => void;
}

export function PermanentDeleteDialog({ material, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [shouldDeleteNative, setShouldDeleteNative] = useState(false);
  const { data, refetch } = resources.getMaterialsByPath.useQuery({
    variables: { path: material.path },
  });

  useEffect(() => {
    if (open) {
      setShouldDeleteNative(false);
      refetch();
    }
  }, [open, refetch]);

  const canDeleteNative = data?.length === 1 && data[0].id === material.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="size-3.5 mr-1" />
          Delete Forever
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently Delete</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This action cannot be undone. The resource will be permanently removed
          from the recycle bin.
        </DialogDescription>
        <div className="text-sm space-y-1">
          <p>
            <strong>File:</strong> {material.name}
          </p>
          <p className="text-muted-foreground break-all">{material.path}</p>
        </div>
        {canDeleteNative && (
          <div>
            <label className="inline-flex flex-row items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={shouldDeleteNative}
                onChange={(e) => setShouldDeleteNative(e.target.checked)}
              />
              <span className="text-xs text-destructive">
                Also delete the native file from disk. This cannot be undone.
              </span>
            </label>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(shouldDeleteNative);
              setOpen(false);
            }}
          >
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
