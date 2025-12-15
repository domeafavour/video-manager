import { projects } from "@/services/projects";
import { AddResource } from "./components/AddResource";
import { DeleteProject } from "./components/DeleteProject";
import { DropFilesToAdd } from "./components/DropFilesToAdd";
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
    <DropFilesToAdd projectId={id}>
      <div className="flex items-center justify-between mb-8 gap-4">
        <ProjectTitle
          key={dataUpdatedAt}
          projectId={id}
          initialTitle={data.title}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Resource</h2>
          <div className="inline-flex flex-row items-center gap-2">
            <AddResource projectId={id} />
            <DeleteProject projectId={id} />
          </div>
        </div>

        <Resources projectId={id} />
      </div>
    </DropFilesToAdd>
  );
}
