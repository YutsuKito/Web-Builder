import { Project } from '../../domain/entities/Project';

export interface IProjectRepository {
  saveProject(project: Project): Promise<void>;
  getProjectById(id: string): Promise<Project | null>;
}
