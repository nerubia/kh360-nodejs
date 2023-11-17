import * as ProjectRole from "../repositories/project-role-repository"

export const getById = async (id: number) => {
  return await ProjectRole.getById(id)
}
