import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useDeleteProject } from "../hooks/useDeleteProject";

interface Props {
  projectId: string | number;
}

export type DeleteProjectProps = Props;

export function DeleteProject({ projectId }: Props) {
  const [handleDelete] = useDeleteProject();

  return (
    <Button variant="destructive" onClick={() => handleDelete(projectId)}>
      <Trash />
    </Button>
  );
}
