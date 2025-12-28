export interface BaseEntity {
  id: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectEntity extends BaseEntity {
  title?: string;
  description?: string;
  resourcesCount: number;
}

export interface MaterialEntity extends BaseEntity {
  projectId: number;
  alias?: string;
  name: string;
  size: number;
  path: string;
}
