import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'

const DB_NAME = 'database.sqlite'

interface BaseEntity {
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

let db: Database.Database

export function initDB() {
  const dbPath = path.join(app.getPath('userData'), DB_NAME)
  db = new Database(dbPath)
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      alias TEXT,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
    );
  `)
}

export function getProjects(): ProjectEntity[] {
  return db.prepare('SELECT * FROM projects ORDER BY updatedAt DESC').all() as ProjectEntity[]
}

export function getProject(id: number): ProjectEntity | undefined {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectEntity | undefined
}

export function saveProject(project: Partial<ProjectEntity>): ProjectEntity {
  const now = Date.now()
  if (project.id) {
    const stmt = db.prepare(`
      UPDATE projects 
      SET title = @title, updatedAt = @updatedAt
      WHERE id = @id
    `)
    stmt.run({ ...project, updatedAt: now })
    return { ...project, updatedAt: now } as ProjectEntity
  } else {
    const stmt = db.prepare(`
      INSERT INTO projects (title, createdAt, updatedAt)
      VALUES (@title, @createdAt, @updatedAt)
    `)
    const info = stmt.run({ ...project, createdAt: now, updatedAt: now })
    return { ...project, id: Number(info.lastInsertRowid), createdAt: now, updatedAt: now } as ProjectEntity
  }
}

export function deleteProject(id: number): number {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  return id
}

export function getMaterials(): MaterialEntity[] {
  return db.prepare('SELECT * FROM materials ORDER BY updatedAt DESC').all() as MaterialEntity[]
}

export function saveMaterial(material: Partial<MaterialEntity>): MaterialEntity {
  const now = Date.now()
  if (material.id) {
    const stmt = db.prepare(`
      UPDATE materials 
      SET projectId = @projectId, alias = @alias, name = @name, size = @size, path = @path, updatedAt = @updatedAt
      WHERE id = @id
    `)
    stmt.run({ ...material, updatedAt: now })
    return { ...material, updatedAt: now } as MaterialEntity
  } else {
    const stmt = db.prepare(`
      INSERT INTO materials (projectId, alias, name, size, path, createdAt, updatedAt)
      VALUES (@projectId, @alias, @name, @size, @path, @createdAt, @updatedAt)
    `)
    const info = stmt.run({ ...material, createdAt: now, updatedAt: now })
    return { ...material, id: Number(info.lastInsertRowid), createdAt: now, updatedAt: now } as MaterialEntity
  }
}

export function deleteMaterial(id: number): number {
  db.prepare('DELETE FROM materials WHERE id = ?').run(id)
  return id
}
