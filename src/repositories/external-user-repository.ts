import { type ExternalUser } from "../types/external-user-type"
import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getAll = async () => {
  return await prisma.external_users.findMany({})
}

export const getAllByFilters = async (
  skip: number,
  take: number,
  where: Prisma.external_usersWhereInput
) => {
  return await prisma.external_users.findMany({
    skip,
    take,
    where,
  })
}

export const countByFilters = async (where: Prisma.external_usersWhereInput) => {
  return await prisma.external_users.count({
    where,
  })
}

export const create = async (data: ExternalUser) => {
  return await prisma.external_users.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.external_users.findUnique({
    where: {
      id,
    },
  })
}

export const updateById = async (id: number, data: ExternalUser) => {
  return await prisma.external_users.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.external_users.deleteMany({
    where: {
      id,
    },
  })
}
