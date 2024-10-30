import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.addressesUncheckedCreateInput) => {
  return await prisma.addresses.create({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.addressesUncheckedUpdateInput) => {
  return await prisma.addresses.update({
    where: {
      id,
    },
    data,
  })
}
