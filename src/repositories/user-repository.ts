import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.users.findUnique({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      slug: true,
      picture: true,
    },
    where: {
      id,
    },
  })
}

export const getByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: {
      email,
    },
    include: {
      user_details: {
        select: {
          user_type: true,
        },
      },
      user_settings: {
        select: {
          id: true,
          name: true,
          setting: true,
        },
      },
    },
  })
}

export const getAllByFilters = async (where: Prisma.usersWhereInput) => {
  return await prisma.users.findMany({
    where,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      is_active: true,
    },
  })
}

export const countByFilters = async (where: Prisma.usersWhereInput) => {
  return await prisma.users.count({
    where,
  })
}

export const getAllByFiltersWithPaging = async (
  where: Prisma.usersWhereInput,
  currentPage: number,
  itemsPerPage: number
) => {
  return await prisma.users.findMany({
    where,
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      is_active: true,
      user_details: {
        select: {
          id: true,
          user_id: true,
          start_date: true,
          user_type: true,
          user_position: true,
        },
      },
    },
    orderBy: [
      {
        last_name: "asc",
      },
      {
        first_name: "asc",
      },
    ],
  })
}
