import { Input } from "@/components/ui/input";
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
    <Input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => {
        mutate({ id: +projectId, title });
      }}
      className="text-3xl font-bold text-blue-600 h-auto py-2 px-4"
    />
  );
}
