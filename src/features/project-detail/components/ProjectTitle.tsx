import { VmTitleInput } from "@/components/ui/vm";
import { projects } from "@/services/projects";
import { useState } from "react";

interface Props {
  projectId: string | number;
  initialTitle?: string;
}

export type ProjectTitleProps = Props;

export function ProjectTitle({ projectId, initialTitle }: Props) {
  const [title, setTitle] = useState(initialTitle || "");
  const { mutate } = projects.update.useMutation({});
  return (
    <VmTitleInput
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => {
        mutate({ id: +projectId, title });
      }}
    />
  );
}
