import { type Prisma } from "@prisma/client"
import { subMonths } from "date-fns"
import * as PaymentRepository from "../../repositories/khbooks/payment-repository"
import { PaymentDateFilter, PaymentStatusFilter } from "../../types/payment-type"

export const getAllByFilters = async (
  payment_date: string,
  client_id: number,
  invoice_no: string,
  payment_reference_no: string,
  status: string,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.paymentsWhereInput = {}

  if (payment_date !== undefined) {
    if (payment_date === PaymentDateFilter.THIS_MONTH) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 1),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 3),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 6),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 12),
        },
      })
    }
  }

  if (!isNaN(client_id)) {
    Object.assign(where, {
      client_id,
    })
  }

  // TODO: filter by invoice no
  if (invoice_no !== undefined) {
    // Object.assign(where, {
    //   payment_status: status,
    // })
  }

  if (payment_reference_no !== undefined) {
    Object.assign(where, {
      payment_reference_no: {
        contains: payment_reference_no,
      },
    })
  }

  if (status !== undefined) {
    if (status === PaymentStatusFilter.DRAFT) {
      Object.assign(where, {
        payment_status: PaymentStatusFilter.DRAFT,
      })
    }
    if (status === PaymentStatusFilter.RECEIVED) {
      Object.assign(where, {
        payment_status: PaymentStatusFilter.RECEIVED,
      })
    }
    if (status === PaymentStatusFilter.CANCELLED) {
      Object.assign(where, {
        payment_status: PaymentStatusFilter.CANCELLED,
      })
    }
  }

  const payments = await PaymentRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await PaymentRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: payments,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
