export class Project {
  constructor(
    public readonly id: string,
    public name: string,
    public canvasState: Record<string, any>,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    id: string,
    name: string,
    canvasState: Record<string, any>,
    createdAt: Date,
    updatedAt: Date
  ): Project {
    return new Project(id, name, canvasState, createdAt, updatedAt);
  }
}
