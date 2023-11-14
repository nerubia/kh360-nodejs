import * as UserRepository from "../repositories/user-repository"

export const getById = async (id: number) => {
  return await UserRepository.getById(id)
}
