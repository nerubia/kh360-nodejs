import { type ExternalUser } from "../types/external-user-type"
import prisma from "../utils/prisma"

export const getAll = async () => {
  return await prisma.external_users.findMany({})
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
