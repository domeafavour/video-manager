import { ProjectEntity, MaterialEntity } from '@/typings'

export const db = {
  getProjects: () => window.ipcRenderer.invoke('db:get-projects') as Promise<ProjectEntity[]>,
  getProject: (id: number) => window.ipcRenderer.invoke('db:get-project', id) as Promise<ProjectEntity | undefined>,
  saveProject: (project: Partial<ProjectEntity>) => window.ipcRenderer.invoke('db:save-project', project) as Promise<ProjectEntity>,
  deleteProject: (id: number) => window.ipcRenderer.invoke('db:delete-project', id) as Promise<number>,
  getMaterials: () => window.ipcRenderer.invoke('db:get-materials') as Promise<MaterialEntity[]>,
  getProjectMaterials: (projectId: number) => window.ipcRenderer.invoke('db:get-project-materials', projectId) as Promise<MaterialEntity[]>,
  addMaterialDialog: (projectId: number) => window.ipcRenderer.invoke('app:add-material-dialog', projectId) as Promise<MaterialEntity[]>,
  saveMaterial: (material: Partial<MaterialEntity>) => window.ipcRenderer.invoke('db:save-material', material) as Promise<MaterialEntity>,
  deleteMaterial: (id: number) => window.ipcRenderer.invoke('db:delete-material', id) as Promise<number>,
  openFileLocation: (path: string) => window.ipcRenderer.invoke('app:open-file-location', path) as Promise<void>,
}


