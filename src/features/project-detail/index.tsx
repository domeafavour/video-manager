import { projects } from "@/services/projects";
import {
  VmEyebrow,
  VmPanel,
  VmShell,
  VmShellGlow,
  VmTitle,
} from "@/components/ui/vm";
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

export function ProjectDetail({ id }: Props) {
  const { data, dataUpdatedAt } = projects.byId.useQuery({ variables: { id } });

  if (!data) {
    return (
      <VmShell className="flex min-h-80 items-center justify-center rounded-[28px] border border-[rgba(214,174,102,0.12)] text-sm text-[#9d937f]">
        Loading project...
      </VmShell>
    );
  }

  return (
    <DropFilesToAdd projectId={id}>
      <VmShell className="overflow-hidden rounded-[30px] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:px-7 md:py-7">
        <VmShellGlow aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <VmEyebrow>Project</VmEyebrow>
              <ProjectTitle
                key={dataUpdatedAt}
                projectId={id}
                initialTitle={data.title}
              />
            </div>
          </div>

          <VmPanel>
            <VmEyebrow className="mb-3 tracking-[0.18em]">
              Notes
            </VmEyebrow>
            <ProjectDescription
              key={dataUpdatedAt}
              projectId={id}
              initialDescription={data.description}
            />
          </VmPanel>

          <VmPanel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <VmTitle as="h2" className="text-[24px] font-semibold leading-none">
                  Resources
                </VmTitle>
                <VmEyebrow as="p" className="mt-1 tracking-[0.16em]">
                  Manage and curate project assets
                </VmEyebrow>
              </div>
              <div className="inline-flex items-center gap-2">
                <AddResource projectId={id} />
                <DeleteProject projectId={id} />
              </div>
            </div>

            <Resources projectId={id} />
          </VmPanel>
        </div>
      </VmShell>
    </DropFilesToAdd>
  );
}
