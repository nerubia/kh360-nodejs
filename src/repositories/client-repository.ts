import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.clients.findUnique({
    select: {
      id: true,
      name: true,
      company_id: true,
      currencies: {
        select: {
          id: true,
        },
      },
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
      email: true,
      display_name: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      country_id: true,
      postal_code: true,
      status: true,
    },
    where,
    orderBy: {
      display_name: "asc",
    },
  })
}
