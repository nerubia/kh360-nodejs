import { InvoiceActivityAction } from "../../types/invoice-activity-type"
import { type PaymentStatus, type InvoiceStatus } from "../../types/invoice-type"
import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.invoicesWhereInput
) => {
  return await prisma.invoices.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        invoice_no: "desc",
      },
      {
        created_at: "desc",
      },
      {
        invoice_date: "desc",
      },
    ],
    include: {
      clients: {
        select: {
          name: true,
        },
      },
      currencies: {
        select: {
          id: true,
          name: true,
          code: true,
          prefix: true,
        },
      },
      invoice_activities: {
        where: {
          action: InvoiceActivityAction.VIEWED,
        },
        select: {
          action: true,
          created_at: true,
        },
        orderBy: {
          id: "desc",
        },
        take: 1,
      },
    },
  })
}

export const countAllByFilters = async (where: Prisma.invoicesWhereInput) => {
  const count = await prisma.invoices.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.invoicesUncheckedCreateInput) => {
  return await prisma.invoices.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.invoices.findFirst({
    where: {
      id,
    },
    include: {
      addresses: {
        select: {
          address1: true,
          address2: true,
          city: true,
          state: true,
          country: true,
          postal_code: true,
        },
      },
      clients: {
        select: {
          id: true,
          name: true,
          display_name: true,
          contact_no: true,
          status: true,
        },
      },
      companies: {
        select: {
          name: true,
          city: true,
          state: true,
          country: true,
          zip: true,
          street: true,
        },
      },
      currencies: {
        select: {
          id: true,
          name: true,
          code: true,
          prefix: true,
        },
      },
      invoice_details: {
        select: {
          id: true,
          contract_id: true,
          contract_billing_id: true,
          period_start: true,
          period_end: true,
          details: true,
          quantity: true,
          rate: true,
          tax: true,
          total: true,
          uom_id: true,
          sub_total: true,
          offerings: {
            select: {
              id: true,
              name: true,
            },
          },
          contracts: {
            select: {
              contract_no: true,
              description: true,
            },
          },
          projects: {
            select: {
              name: true,
            },
          },
          uoms: {
            select: {
              name: true,
            },
          },
        },
      },
      invoice_emails: {
        select: {
          id: true,
          email_type: true,
          email_address: true,
        },
      },
      invoice_attachments: {
        select: {
          id: true,
          sequence_no: true,
          filename: true,
          mime_type: true,
          description: true,
        },
      },
      tax_types: {
        select: {
          id: true,
          name: true,
          rate: true,
        },
      },
      payment_accounts: {
        select: {
          account_name: true,
          account_type: true,
          account_no: true,
          bank_name: true,
          bank_branch: true,
          swift_code: true,
        },
      },
      payment_terms: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const getLatest = async () => {
  const invoices = await prisma.invoices.findMany({
    orderBy: {
      id: "desc",
    },
    take: 1,
  })

  if (invoices.length === 0) {
    return null
  }

  return invoices[0]
}

export const updateById = async (id: number, data: Prisma.invoicesUncheckedUpdateInput) => {
  return await prisma.invoices.update({
    where: {
      id,
    },
    data,
  })
}

export const updateInvoiceStatusById = async (id: number, status: InvoiceStatus) => {
  return await prisma.invoices.update({
    where: {
      id,
    },
    data: {
      invoice_status: status,
      updated_at: new Date(),
    },
  })
}

export const updateInvoicePaymentStatusByIds = async (ids: number[], status: PaymentStatus) => {
  return await prisma.invoices.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      payment_status: status,
      updated_at: new Date(),
    },
  })
}

export const generateInvoiceNumberById = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    const invoices = await tx.invoices.findMany({
      where: {
        AND: [
          {
            invoice_no: {
              not: undefined,
            },
          },
          {
            invoice_no: {
              not: null,
            },
          },
          {
            invoice_no: {
              not: "",
            },
          },
        ],
      },
      orderBy: {
        invoice_no: "desc",
      },
      take: 1,
    })

    let invoiceNo = Number(process.env.INVOICE_NO_OFFSET ?? 0)

    if (invoices.length === 1) {
      invoiceNo = Number(invoices[0].invoice_no) + 1
    }

    const formattedInvoiceNo = invoiceNo.toString().padStart(6, "0")

    await tx.invoices.update({
      where: {
        id,
      },
      data: {
        invoice_no: formattedInvoiceNo,
      },
    })

    return formattedInvoiceNo
  })
}

export const deleteById = async (id: number) => {
  await prisma.invoices.delete({
    where: {
      id,
    },
  })
}
