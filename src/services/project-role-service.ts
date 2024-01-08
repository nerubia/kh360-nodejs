import * as ProjectRoleRepository from "../repositories/project-role-repository"

export const getById = async (id: number) => {
  return await ProjectRoleRepository.getById(id)
}

export const getAllForProject = async () => {
  return await ProjectRoleRepository.getAllByFilters({
    for_project: true,
  })
}

export const getAll = async () => {
  return await ProjectRoleRepository.getAllByFilters({})
}
