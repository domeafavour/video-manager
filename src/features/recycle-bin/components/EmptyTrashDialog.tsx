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
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  itemCount: number;
  onConfirm: (deleteNative: boolean) => void;
}

export function EmptyTrashDialog({ itemCount, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteNative, setDeleteNative] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="size-3.5 mr-1" />
          Empty Recycle Bin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Empty Recycle Bin</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will permanently delete all {itemCount} item(s) in the recycle
          bin. This action cannot be undone.
        </DialogDescription>
        <div>
          <label className="inline-flex flex-row items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={deleteNative}
              onChange={(e) => setDeleteNative(e.target.checked)}
            />
            <span className="text-xs text-destructive">
              Also delete native files from disk for all items.
            </span>
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(deleteNative);
              setOpen(false);
            }}
          >
            Empty Recycle Bin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
