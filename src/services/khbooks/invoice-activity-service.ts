import { type InvoiceActivity } from "../../types/invoice-activity-type"
import * as InvoiceActivityRepository from "../../repositories/khbooks/invoice-activity-repository"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (invoice_id: number, page: string) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.invoice_activitiesWhereInput = {}

  if (!isNaN(invoice_id)) {
    Object.assign(where, {
      invoice_id,
    })
  }

  const invoiceActivities = await InvoiceActivityRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await InvoiceActivityRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: invoiceActivities,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
export const create = async (data: InvoiceActivity) => {
  const currentDate = new Date()
  return await InvoiceActivityRepository.create({
    ...data,
    created_at: currentDate,
    updated_at: currentDate,
  })
}
