import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { ProjectEntity, MaterialEntity } from "@/typings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectEntity | null>(null);
  const [materials, setMaterials] = useState<MaterialEntity[]>([]);
  const [title, setTitle] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      const data = await db.getProject(Number(id));
      if (data) {
        setProject(data);
        setTitle(data.title || "");
      }
    };
    const loadMaterials = async () => {
      const data = await db.getProjectMaterials(Number(id));
      setMaterials(data);
    };
    loadProject();
    loadMaterials();
  }, [id]);

  const handleSave = async () => {
    if (!project) return;
    const updatedProject = await db.saveProject({ ...project, title });
    setProject(updatedProject);
  };

  const handleDelete = async () => {
    if (!project) return;
    if (confirm("Are you sure you want to delete this project?")) {
      await db.deleteProject(project.id);
      navigate({ to: "/projects" });
    }
  };

  const handleAddMaterial = async () => {
    if (!project) return;
    const newMaterials = await db.addMaterialDialog(project.id);
    if (newMaterials.length > 0) {
      setMaterials((prev) => [...newMaterials, ...prev]);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      await db.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    }
  };

  const handleOpenFolder = (path: string) => {
    db.openFileLocation(path);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const handlePreview = (path: string) => {
    setPreviewImage(`file://${path}`);
  };

  const isImage = (path: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path);
  };

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <Input
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold text-blue-600 h-auto py-2 px-4"
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Materials</h2>
          <Button onClick={handleAddMaterial} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {materials.map((material) => (
            <ContextMenu key={material.id}>
              <ContextMenuTrigger>
                <div
                  className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-medium truncate" title={material.name}>
                      {material.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate" title={material.path}>
                      {material.path}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-sm text-gray-500">
                      {formatBytes(material.size)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(material.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {isImage(material.path) && (
                  <ContextMenuItem onClick={() => handlePreview(material.path)}>
                    Preview
                  </ContextMenuItem>
                )}
                <ContextMenuItem onClick={() => handleOpenFolder(material.path)}>
                  Open containing folder
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCopyPath(material.path)}>
                  Copy path
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => handleDeleteMaterial(material.id)}
                >
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
          {materials.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              No materials added yet. Click "Add Material" to get started.
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5 rounded-md">
            {previewImage && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

