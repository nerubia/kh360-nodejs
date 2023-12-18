import * as ProjectRepository from "../repositories/project-repository"

export const getById = async (id: number) => {
  return await ProjectRepository.getById(id)
}

export const getAllByFilters = async (name: string) => {
  const where = {
    name: {
      contains: name,
    },
  }
  return await ProjectRepository.getAllByFilters(where)
}
