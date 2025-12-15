import { projects } from "@/services/projects";
import { AddResource } from "./components/AddResource";
import { DeleteProject } from "./components/DeleteProject";
import { ProjectTitle } from "./components/ProjectTitle";
import { Resources } from "./components/Resources";

interface Props {
  id: string | number;
}

export type ProjectDetailProps = Props;

export function ProjectDetail({ id }: Props) {
  const { data, dataUpdatedAt } = projects.byId.useQuery({ variables: { id } });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <ProjectTitle
          key={dataUpdatedAt}
          projectId={id}
          initialTitle={data.title}
        />
        <div className="flex gap-2">
          <DeleteProject projectId={id} />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Resource</h2>
          <AddResource projectId={id} />
        </div>

        <Resources projectId={id} />
      </div>
    </div>
  );
}
