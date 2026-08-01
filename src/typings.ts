export interface BaseEntity {
  id: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectEntity extends BaseEntity {
  title?: string;
  description?: string;
  resourcesCount: number;
  tags?: string[];
}

export interface MaterialEntity extends BaseEntity {
  projectId: number;
  alias?: string;
  name: string;
  size: number;
  path: string;
  status: 'used' | 'unused';
  tags?: string[];
  deletedAt?: number;
  /** Set on materials exported from a video piece — the source material's name. */
  sourceName?: string;
}

export interface ClipEntity extends BaseEntity {
  materialId: number;
  name: string;
  start: number; // seconds, fractional ok
  end: number; // seconds, fractional ok
}
