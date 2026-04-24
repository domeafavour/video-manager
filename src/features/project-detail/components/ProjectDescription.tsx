import { VmTextarea } from "@/components/ui/vm";
import { projects } from "@/services/projects";
import { useState } from "react";

interface Props {
  projectId: string | number;
  initialDescription?: string;
}

export type ProjectDescriptionProps = Props;

export function ProjectDescription({ projectId, initialDescription }: Props) {
  const [description, setDescription] = useState(initialDescription || "");
  const { mutate } = projects.update.useMutation({});
  return (
    <VmTextarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      onBlur={() => {
        mutate({ id: +projectId, description });
      }}
      placeholder="Add a description..."
      className='min-h-28 resize-none border px-4 py-3 text-sm leading-7 [font-family:"DM Sans",system-ui,sans-serif] focus-visible:ring-[3px]'
      rows={3}
    />
  );
}
