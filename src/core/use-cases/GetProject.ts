import { IProjectRepository } from '../infra/repositories/IProjectRepository';
import { Project } from '../domain/entities/Project';

export class GetProject {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project | null> {
    return await this.projectRepository.getProjectById(id);
  }
}
