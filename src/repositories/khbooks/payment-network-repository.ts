import prisma from "../../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.payment_networks.findFirst({
    where: {
      id,
    },
  })
}
