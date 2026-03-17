import { IProjectRepository } from '../infra/repositories/IProjectRepository';
import { Project } from '../domain/entities/Project';

export class SaveProject {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(project: Project): Promise<void> {
    await this.projectRepository.saveProject(project);
  }
}
