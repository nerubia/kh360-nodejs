import * as ProjectRepository from "../repositories/project-repository"

export const getById = async (id: number) => {
  return await ProjectRepository.getById(id)
}
