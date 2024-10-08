import { type Prisma } from "@prisma/client"
import prisma from "../../utils/prisma"

export const create = async (data: Prisma.invoice_linksUncheckedCreateInput) => {
  return await prisma.invoice_links.create({
    data,
  })
}

export const getLatestByInvoiceId = async (invoiceId: number) => {
  const invoiceLinks = await prisma.invoice_links.findMany({
    where: {
      invoice_id: invoiceId,
      expires_at: {
        gte: new Date(),
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 1,
  })

  if (invoiceLinks.length === 0) {
    return null
  }

  return invoiceLinks[0]
}

export const getLatestByToken = async (token: string) => {
  const invoiceLinks = await prisma.invoice_links.findMany({
    where: {
      token,
      expires_at: {
        gte: new Date(),
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 1,
  })

  if (invoiceLinks.length === 0) {
    return null
  }

  return invoiceLinks[0]
}

export const getByToken = async (token: string) => {
  return await prisma.invoice_links.findFirst({
    where: {
      token,
    },
  })
}
