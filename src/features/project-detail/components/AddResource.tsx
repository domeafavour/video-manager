import { Button } from "@/components/ui/button";
import { resources } from "@/services/resources";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  projectId: string | number;
}

export type AddResourceProps = Props;

export function AddResource({ projectId }: Props) {
  const { mutate } = resources.save.useMutation({
    onSuccess: () => {
      toast.success("Resources added");
    },
    onError: () => {
      toast.error("Failed to add resources");
    },
  });
  return (
    <Button className="relative" title="Add files">
      <input
        className="w-full absolute inset-0 appearance-none opacity-0"
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            mutate({ files: [...e.target.files], projectId });
            e.target.value = "";
          }
        }}
      />
      <Plus className="w-4 h-4" />
    </Button>
  );
}
