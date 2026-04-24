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
    <Button
      variant="destructive"
      className="size-10 rounded-2xl border border-[rgba(239,68,68,0.24)] bg-[rgba(127,29,29,0.72)] shadow-none hover:bg-[rgba(153,27,27,0.92)]"
      onClick={() => handleDelete(projectId)}
    >
      <Trash />
    </Button>
  );
}
