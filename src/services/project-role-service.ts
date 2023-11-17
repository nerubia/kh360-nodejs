import * as ProjectRoleRepository from "../repositories/project-role-repository"

export const getById = async (id: number) => {
  return await ProjectRoleRepository.getById(id)
}
