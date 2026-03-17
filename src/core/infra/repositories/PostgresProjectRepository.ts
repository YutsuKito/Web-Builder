import { IProjectRepository } from './IProjectRepository';
import { Project } from '../../domain/entities/Project';
import { prisma } from '../../../lib/prisma'; // Assumes a generic prisma instance exists, we'll create it

export class PostgresProjectRepository implements IProjectRepository {
  async saveProject(project: Project): Promise<void> {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        canvasState: project.canvasState,
      },
      create: {
        id: project.id,
        name: project.name,
        canvasState: project.canvasState,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    const data = await prisma.project.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Project.create(
      data.id,
      data.name,
      data.canvasState as Record<string, any>,
      data.createdAt,
      data.updatedAt
    );
  }
}
