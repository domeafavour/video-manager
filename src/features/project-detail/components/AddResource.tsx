import { Button } from "@/components/ui/button";
import { resources } from "@/services/resources";
import { Plus } from "lucide-react";

interface Props {
  projectId: string | number;
}

export type AddResourceProps = Props;

export function AddResource({ projectId }: Props) {
  const { mutate } = resources.add.useMutation();
  return (
    <Button
      onClick={() => {
        mutate({ projectId });
      }}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Resource
    </Button>
  );
}
