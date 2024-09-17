import { type Prisma } from "@prisma/client"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as InvoiceAttachmentRepository from "../../repositories/khbooks/invoice-attachment-repository"
import * as InvoiceEmailRepository from "../../repositories/khbooks/invoice-email-repository"
import * as InvoiceDetailRepository from "../../repositories/khbooks/invoice-detail-repository"
import * as ClientRepository from "../../repositories/client-repository"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import * as TaxTypeRepository from "../../repositories/khbooks/tax-type-repository"
import * as PaymentTermRepository from "../../repositories/khbooks/payment-term-repository"
import {
  type Invoice,
  InvoiceDateFilter,
  InvoiceStatus,
  InvoiceStatusFilter,
  PaymentStatus,
} from "../../types/invoice-type"
import { subMonths } from "date-fns"
import CustomError from "../../utils/custom-error"
import { generateInvoice } from "../../utils/generate-invoice"
import { sendMailWithAttachment } from "../../utils/sendgrid"
import { type Contract } from "../../types/contract-type"
import { type S3File } from "../../types/s3-file-type"

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

export const create = async (data: Invoice, shouldSendInvoice: boolean) => {
  const client = await ClientRepository.getById(data.client_id)
  if (client === null) {
    throw new CustomError("Client not found", 400)
  }

  const currency = await CurrencyRepository.getById(data.currency_id)
  if (currency === null) {
    throw new CustomError("Currency not found", 400)
  }

  const taxType = await TaxTypeRepository.getById(data.tax_type_id)
  if (taxType === null) {
    throw new CustomError("Tax type not found", 400)
  }

  const paymentTerm = await PaymentTermRepository.getById(data.payment_term_id)
  if (paymentTerm === null) {
    throw new CustomError("Payment term not found", 400)
  }

  const currentDate = new Date()

  const newInvoice = await InvoiceRepository.create({
    client_id: client.id,
    company_id: client.company_id,
    currency_id: currency.id,
    invoice_date: new Date(data.invoice_date),
    due_date: new Date(data.due_date),
    invoice_amount: data.invoice_amount,
    sub_total: data.sub_total,
    tax_type_id: taxType.id,
    payment_account_id: client.payment_account_id,
    payment_term_id: paymentTerm.id,
    billing_address_id: data.billing_address_id,
    invoice_status: shouldSendInvoice ? InvoiceStatus.BILLED : InvoiceStatus.DRAFT,
    payment_status: PaymentStatus.OPEN,
    created_at: currentDate,
    updated_at: currentDate,
  })

  if (data.to !== undefined && data.to.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "to",
      email_address: data.to,
    })
  }

  if (data.cc !== undefined && data.cc.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "cc",
      email_address: data.cc,
    })
  }

  if (data.bcc !== undefined && data.bcc.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "bcc",
      email_address: data.bcc,
    })
  }

  const invoiceDetails: Prisma.invoice_detailsCreateManyInput[] = data.invoice_details.map(
    (invoiceDetail) => {
      const periodStart =
        invoiceDetail.period_start !== null ? new Date(invoiceDetail.period_start) : null
      const periodEnd =
        invoiceDetail.period_end !== null ? new Date(invoiceDetail.period_end) : null

      return {
        ...invoiceDetail,
        invoice_id: newInvoice.id,
        period_start: periodStart,
        period_end: periodEnd,
        created_at: currentDate,
        updated_at: currentDate,
      }
    }
  )

  await InvoiceDetailRepository.createMany(invoiceDetails)

  return newInvoice
}

export const show = async (id: number) => {
  return await InvoiceRepository.getById(id)
}

export const uploadAttachments = async (id: number, files: S3File[]) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  const currentDate = new Date()

  const invoiceAttachments: Prisma.invoice_attachmentsCreateInput[] = files.map((file) => ({
    invoice_id: invoice.id,
    filename: file.key,
    created_at: currentDate,
    updated_at: currentDate,
  }))

  await InvoiceAttachmentRepository.createMany(invoiceAttachments)
}

export const sendInvoice = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  const pdfBuffer = await generateInvoice({
    invoice_no: invoice.invoice_no ?? "",
    invoice_date: invoice.invoice_date?.toISOString() ?? "",
    due_date: invoice.due_date?.toISOString() ?? "",
    invoice_amount: invoice.invoice_amount?.toNumber(),
    sub_total: invoice.sub_total?.toNumber(),
    clients: invoice.clients,
    companies: invoice.companies,
    currencies: invoice.currencies,
    tax_types: invoice.tax_types,
    payment_accounts: invoice.payment_accounts,
    billing_addresses: invoice.addresses,
    invoice_details: invoice.invoice_details.map((invoiceDetail) => {
      return {
        id: invoiceDetail.id,
        contract_id: null,
        contract_billing_id: null,
        offering_id: null,
        project_id: null,
        employee_id: null,
        period_start: invoiceDetail.period_start?.toISOString() ?? null,
        period_end: invoiceDetail.period_end?.toISOString() ?? null,
        details: invoiceDetail.details,
        quantity: invoiceDetail.quantity?.toNumber() ?? null,
        uom_id: null,
        rate: invoiceDetail.rate?.toString() ?? null,
        sub_total: null,
        tax: null,
        total: invoiceDetail.total?.toNumber() ?? null,
        contracts: (invoiceDetail.contracts as Contract) ?? undefined,
        projects: invoiceDetail.projects ?? undefined,
      }
    }),
  })

  const to = invoice.invoice_emails.find((invoiceEmail) => invoiceEmail.email_type === "to")
    ?.email_address
  const cc = invoice.invoice_emails.find((invoiceEmail) => invoiceEmail.email_type === "cc")
    ?.email_address
  const bcc = invoice.invoice_emails.find((invoiceEmail) => invoiceEmail.email_type === "bcc")
    ?.email_address

  const ccEmails = cc?.split(",") ?? []
  const bccEmails = bcc?.split(",") ?? []

  if (to === undefined || to === null) {
    throw new CustomError("Invoice email not found", 400)
  }

  await sendMailWithAttachment(to, ccEmails, bccEmails, "Invoice", "Your invoice", pdfBuffer)
}
