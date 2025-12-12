export interface BaseEntity {
  id: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectEntity extends BaseEntity {
  title?: string;
}

export interface MaterialEntity extends BaseEntity {
  projectId: number;
  alias?: string;
  name: string;
  size: number;
  path: string;
}
