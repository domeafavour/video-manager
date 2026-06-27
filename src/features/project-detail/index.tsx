import { Skeleton } from "@/components/ui/skeleton";
import { projects } from "@/services/projects";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AddResource } from "./components/AddResource";
import { DeleteProject } from "./components/DeleteProject";
import { DropFilesToAdd } from "./components/DropFilesToAdd";
import { ProjectTitle } from "./components/ProjectTitle";
import { ProjectDescription } from "./components/ProjectDescription";
import { Resources } from "./components/Resources";

interface Props {
  id: string | number;
}

export type ProjectDetailProps = Props;

function LoadingSkeleton() {
  return (
    <div>
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border rounded-md overflow-hidden bg-card">
            <Skeleton className="w-full h-36 rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetail({ id }: Props) {
  const { data, isLoading, dataUpdatedAt } = projects.byId.useQuery({ variables: { id } });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <DropFilesToAdd projectId={id}>
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to projects
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4 gap-4">
        <ProjectTitle
          key={dataUpdatedAt}
          projectId={id}
          initialTitle={data.title}
        />
        <div className="flex items-center gap-2 shrink-0">
          <AddResource projectId={id} />
          <DeleteProject projectId={id} />
        </div>
      </div>

      <div className="mb-8">
        <ProjectDescription
          key={dataUpdatedAt}
          projectId={id}
          initialDescription={data.description}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Resources</h2>
        </div>

        <Resources projectId={id} />
      </div>
    </DropFilesToAdd>
  );
}
