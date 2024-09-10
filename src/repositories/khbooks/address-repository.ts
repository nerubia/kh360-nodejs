import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.addressesUncheckedCreateInput) => {
  return await prisma.addresses.create({
    data,
  })
}
