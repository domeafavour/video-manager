import { Textarea } from "@/components/ui/textarea";
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
    <Textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      onBlur={() => {
        mutate({ id: +projectId, description });
      }}
      placeholder="Add a description..."
      className="text-base resize-none"
      rows={3}
    />
  );
}
