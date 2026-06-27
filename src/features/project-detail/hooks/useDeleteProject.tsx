import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { projects } from "@/services/projects";
import { deleteOpenedId } from "@/stores/opened-projects";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function useDeleteProject() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingIdRef = useRef<string | number | null>(null);

  const { mutate, isPending } = projects.delete.useMutation({
    onSuccess: (_, variables) => {
      deleteOpenedId(variables.id);
      toast.success("Project deleted");
      navigate({ to: "/projects" });
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const handleDelete = (projectId: string | number) => {
    pendingIdRef.current = projectId;
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pendingIdRef.current !== null) {
      mutate({ id: pendingIdRef.current });
      pendingIdRef.current = null;
    }
    setDialogOpen(false);
  };

  const dialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this project? This will remove all resources associated with it.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [handleDelete, dialog] as const;
}
