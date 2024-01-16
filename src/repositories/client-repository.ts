import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.clients.findUnique({
    select: {
      name: true,
    },
    where: {
      id,
    },
  })
}

export const getAllByName = async (name: string) => {
  return await prisma.clients.findMany({
    where: {
      name: {
        contains: name,
      },
    },
  })
}

export const getAllByFilters = async (where: Prisma.clientsWhereInput) => {
  return await prisma.clients.findMany({
    select: {
      id: true,
      name: true,
      display_name: true,
      status: true,
    },
    where,
  })
}
