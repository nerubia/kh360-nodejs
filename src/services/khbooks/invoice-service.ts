import { type Prisma } from "@prisma/client"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import {
  InvoiceDateFilter,
  InvoiceStatus,
  InvoiceStatusFilter,
  PaymentStatus,
} from "../../types/invoice-type"
import { subMonths } from "date-fns"

export const getAllByFilters = async (
  invoice_date: string,
  client_id: number,
  status: string,
  due_date: string,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.invoicesWhereInput = {}

  if (invoice_date !== undefined) {
    if (invoice_date === InvoiceDateFilter.THIS_MONTH) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 1),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 3),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 6),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        invoice_date: {
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

  if (status !== undefined) {
    if (status === InvoiceStatusFilter.DRAFT) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.DRAFT],
        },
      })
    }
    if (status === InvoiceStatusFilter.UNPAID) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
        },
        payment_status: {
          in: [PaymentStatus.OPEN, PaymentStatus.OVERDUE],
        },
      })
    }
    if (status === InvoiceStatusFilter.UNPAID_NOT_DUE) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
        },
        payment_status: {
          in: [PaymentStatus.OPEN],
        },
      })
    }
    if (status === InvoiceStatusFilter.UNPAID_OVERDUE) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
        },
        payment_status: {
          in: [PaymentStatus.OVERDUE],
        },
      })
    }
    if (status === InvoiceStatusFilter.PAID) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.PAID],
        },
        payment_status: {
          in: [PaymentStatus.PAID],
        },
      })
    }
    if (status === InvoiceStatusFilter.CANCELLED) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.CANCELLED],
        },
      })
    }
  }

  if (due_date !== undefined) {
    if (due_date === InvoiceDateFilter.THIS_MONTH) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 1),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 3),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 6),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 12),
        },
      })
    }
  }

  const invoices = await InvoiceRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await InvoiceRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: invoices,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
