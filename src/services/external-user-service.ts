import * as ExternalUserRepository from "../repositories/external-user-repository"
import { type Prisma } from "@prisma/client"
import { type ExternalUser } from "../types/external-user-type"

export const getAll = async () => {
  return await ExternalUserRepository.getAll()
}

export const getAllByFilters = async (
  skip: number,
  take: number,
  where: Prisma.external_usersWhereInput
) => {
  return await ExternalUserRepository.getAllByFilters(skip, take, where)
}

export const countByFilters = async (where: Prisma.external_usersWhereInput) => {
  return await ExternalUserRepository.countByFilters(where)
}

export const create = async (data: ExternalUser) => {
  return await ExternalUserRepository.create(data)
}

export const getById = async (id: number) => {
  return await ExternalUserRepository.getById(id)
}

export const updateById = async (id: number, data: ExternalUser) => {
  return await ExternalUserRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  await ExternalUserRepository.deleteById(id)
}
