import { VmButton } from "@/components/ui/vm";
import { resources } from "@/services/resources";
import { Plus } from "lucide-react";

interface Props {
  projectId: string | number;
}

export type AddResourceProps = Props;

export function AddResource({ projectId }: Props) {
  const { mutate } = resources.save.useMutation();
  return (
    <VmButton className="relative size-10 rounded-2xl border-[rgba(214,174,102,0.22)] bg-[rgba(214,174,102,0.12)] p-0 text-[#d6ae66] hover:bg-[rgba(214,174,102,0.22)] hover:text-[#f1d6a0]">
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
      <Plus className="h-4 w-4" />
    </VmButton>
  );
}
