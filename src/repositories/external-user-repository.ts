import { type ExternalUser } from "../types/external-user-type"
import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getByFilters = async (where: Prisma.external_usersWhereInput) => {
  return await prisma.external_users.findFirst({
    where,
  })
}

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
    select: {
      id: true,
      email: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      access_token: true,
      deleted_at: true,
    },
    where: {
      id,
    },
  })
}

export const getByEmail = async (email: string) => {
  return await prisma.external_users.findUnique({
    where: {
      email,
    },
  })
}

export const getByAccessToken = async (access_token: string) => {
  return await prisma.external_users.findFirst({
    where: {
      access_token,
    },
  })
}

export const getByCode = async (code: string) => {
  return await prisma.external_users.findFirst({
    where: {
      code,
    },
  })
}

export const getByAccessTokenAndCode = async (access_token: string, code: string) => {
  return await prisma.external_users.findFirst({
    where: {
      access_token,
      code,
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

export const updateCodeById = async (id: number, code: string) => {
  return await prisma.external_users.update({
    where: {
      id,
    },
    data: {
      code,
      updated_at: new Date(),
    },
  })
}

export const updateFailedAttemptsById = async (id: number, attempt: number) => {
  return await prisma.external_users.update({
    where: {
      id,
    },
    data: {
      failed_attempts: attempt,
      locked_at: attempt >= 3 ? new Date() : null,
      updated_at: new Date(),
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.external_users.deleteMany({
    where: {
      id,
    },
  })
}

export const softDeleteById = async (id: number) => {
  const currentDate = new Date()
  return await prisma.external_users.update({
    where: {
      id,
    },
    data: {
      updated_at: currentDate,
      deleted_at: currentDate,
    },
  })
}
