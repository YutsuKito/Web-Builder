'use server';

import { PostgresProjectRepository } from '@/core/infra/repositories/PostgresProjectRepository';
import { SaveProject } from '@/core/use-cases/SaveProject';
import { GetProject } from '@/core/use-cases/GetProject';
import { Project } from '@/core/domain/entities/Project';
import { revalidatePath } from 'next/cache';

const repository = new PostgresProjectRepository();

export async function upsertProjectAction(data: { id: string; name: string; canvasState: any }) {
  const saveProject = new SaveProject(repository);
  
  const project = Project.create(
    data.id,
    data.name,
    data.canvasState,
    new Date(), // This will be handled by prisma upsert if it already exists but we pass it anyway
    new Date()
  );

  await saveProject.execute(project);
  // revalidatePath('/editor'); // Adjust if needed
  return { success: true, id: project.id };
}

export async function fetchProjectAction(id: string) {
  const getProject = new GetProject(repository);
  const project = await getProject.execute(id);

  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    canvasState: project.canvasState,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
