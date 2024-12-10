import { type Prisma } from "@prisma/client"
import { addDays, endOfMonth, startOfDay, startOfMonth, subMonths } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import * as ClientRepository from "../../repositories/client-repository"
import * as CompanyRepository from "../../repositories/company-repository"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import * as InvoiceActivityRepository from "../../repositories/khbooks/invoice-activity-repository"
import * as InvoiceAttachmentRepository from "../../repositories/khbooks/invoice-attachment-repository"
import * as InvoiceEmailRepository from "../../repositories/khbooks/invoice-email-repository"
import * as InvoiceLinkRepository from "../../repositories/khbooks/invoice-link-repository"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as PaymentTermRepository from "../../repositories/khbooks/payment-term-repository"
import * as PaymentRepository from "../../repositories/khbooks/payment-repository"
import * as TaxTypeRepository from "../../repositories/khbooks/tax-type-repository"
import * as EmailTemplateRepository from "../../repositories/email-template-repository"
import * as EmailLogRepository from "../../repositories/email-log-repository"
import * as SystemSettingsRepository from "../../repositories/system-settings-repository"
import { type Contract } from "../../types/contract-type"
import {
  type Invoice,
  InvoiceDateFilter,
  InvoicePaymentStatus,
  InvoiceStatus,
  InvoiceStatusFilter,
  SendInvoiceAction,
} from "../../types/invoice-type"
import { type S3File } from "../../types/s3-file-type"
import { SendInvoiceType } from "../../types/send-invoice-type"
import CustomError from "../../utils/custom-error"
import { generateInvoice } from "../../utils/generate-invoice"
import { generateInvoiceEmailContent } from "../../utils/generate-invoice-email-content"
import { getFile, uploadFile } from "../../utils/s3"
import { sendMail } from "../../utils/sendgrid"
import * as InvoiceAttachmentService from "../khbooks/invoice-attachment-service"
import * as InvoiceDetailService from "../khbooks/invoice-detail-service"
import { InvoiceActivityAction } from "../../types/invoice-activity-type"
import prisma from "../../utils/prisma"
import { type EmailLog, EmailLogType } from "../../types/email-log-type"
import { type UserToken } from "../../types/user-token-type"

export const getAllByFilters = async (
  invoice_date: string,
  invoice_no: string,
  client_id: number,
  status: string,
  due_date: string,
  page: string,
  sort_by?: "invoice_no" | "due_date",
  sort_order?: "asc" | "desc",
  has_open_balance?: boolean
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.invoicesWhereInput = {}

  if (invoice_date !== undefined) {
    if (invoice_date === InvoiceDateFilter.THIS_MONTH) {
      Object.assign(where, {
        invoice_date: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 3),
          lte: new Date(),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 6),
          lte: new Date(),
        },
      })
    }
    if (invoice_date === InvoiceDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        invoice_date: {
          gte: subMonths(new Date(), 12),
          lte: new Date(),
        },
      })
    }
  }

  if (invoice_no !== undefined) {
    Object.assign(where, {
      invoice_no: {
        contains: invoice_no,
      },
    })
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
          in: [InvoicePaymentStatus.OPEN, InvoicePaymentStatus.OVERDUE],
        },
      })
    }
    if (status === InvoiceStatusFilter.UNPAID_NOT_DUE) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
        },
        payment_status: {
          in: [InvoicePaymentStatus.OPEN],
        },
      })
    }
    if (status === InvoiceStatusFilter.UNPAID_OVERDUE) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
        },
        payment_status: {
          in: [InvoicePaymentStatus.OVERDUE],
        },
      })
    }
    if (status === InvoiceStatusFilter.PAID) {
      Object.assign(where, {
        invoice_status: {
          in: [InvoiceStatus.PAID],
        },
        payment_status: {
          in: [InvoicePaymentStatus.PAID],
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
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 3),
          lte: new Date(),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 6),
          lte: new Date(),
        },
      })
    }
    if (due_date === InvoiceDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        due_date: {
          gte: subMonths(new Date(), 12),
          lte: new Date(),
        },
      })
    }
  }

  if (has_open_balance === true) {
    Object.assign(where, {
      invoice_amount: {
        gt: prisma.invoices.fields.payment_amount,
      },
    })
  }

  const invoices = await InvoiceRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    sort_order,
    sort_by
  )

  const finalInvoices = await Promise.all(
    invoices.map((invoice) => {
      const invoiceAmount = invoice.invoice_amount?.toNumber() ?? 0
      const paymentAmount = invoice.payment_amount?.toNumber() ?? 0
      const open_balance = invoiceAmount - paymentAmount

      return {
        ...invoice,
        paid_amount: paymentAmount,
        open_balance,
      }
    })
  )

  const totalItems = await InvoiceRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: finalInvoices,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const create = async (data: Invoice, sendInvoiceAction: SendInvoiceAction) => {
  const client = await ClientRepository.getById(data.client_id ?? 0)
  if (client === null) {
    throw new CustomError("Client not found", 400)
  }

  const currency = await CurrencyRepository.getById(data.currency_id ?? 0)
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

  const isPaymentOpen =
    new Date(data.due_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)

  const currentDate = new Date()

  const newInvoice = await InvoiceRepository.create({
    client_id: client.id,
    company_id: client.company_id,
    currency_id: currency.id,
    invoice_date: new Date(data.invoice_date),
    due_date: new Date(data.due_date),
    invoice_amount: data.invoice_amount,
    sub_total: data.sub_total,
    discount_amount: data.discount_amount,
    discount_toggle: data.discount_toggle,
    tax_amount: data.tax_amount,
    tax_type_id: taxType.id,
    tax_toggle: data.tax_toggle,
    payment_account_id: data.payment_account_id,
    payment_term_id: paymentTerm.id,
    billing_address_id: data.billing_address_id,
    invoice_status:
      sendInvoiceAction === SendInvoiceAction.BILLED ? InvoiceStatus.BILLED : InvoiceStatus.DRAFT,
    payment_status: isPaymentOpen ? InvoicePaymentStatus.OPEN : InvoicePaymentStatus.OVERDUE,
    created_at: currentDate,
    updated_at: currentDate,
  })

  await InvoiceRepository.generateInvoiceNumberById(newInvoice.id)

  if (data.to !== undefined && data.to.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "to",
      email_address: data.to,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  if (data.cc !== undefined && data.cc.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "cc",
      email_address: data.cc,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  if (data.bcc !== undefined && data.bcc.length > 0) {
    await InvoiceEmailRepository.create({
      invoice_id: newInvoice.id,
      email_type: "bcc",
      email_address: data.bcc,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  await InvoiceDetailService.updateByInvoiceId(newInvoice.id, data.invoice_details)

  if (sendInvoiceAction === SendInvoiceAction.BILLED) {
    await InvoiceActivityRepository.create({
      invoice_id: newInvoice.id,
      action: InvoiceActivityAction.BILLED,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  return newInvoice
}

export const show = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)
  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  let company = invoice.companies

  if (company === null) {
    company = await CompanyRepository.getById(1)
  }

  const invoiceAmount = invoice.invoice_amount !== null ? invoice.invoice_amount.toNumber() : 0
  const paymentAmount = invoice.payment_amount !== null ? invoice.payment_amount.toNumber() : 0
  const openBalance = Math.round((invoiceAmount - paymentAmount) * 100) / 100

  return {
    ...invoice,
    paid_amount: paymentAmount,
    open_balance: openBalance,
    companies: company,
  }
}

export const update = async (id: number, data: Invoice, sendInvoiceAction: SendInvoiceAction) => {
  const invoice = await InvoiceRepository.getById(id)
  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  const taxType = await TaxTypeRepository.getById(data.tax_type_id)
  if (taxType === null) {
    throw new CustomError("Tax type not found", 400)
  }

  const paymentTerm = await PaymentTermRepository.getById(data.payment_term_id)
  if (paymentTerm === null) {
    throw new CustomError("Payment term not found", 400)
  }

  if (invoice.invoice_status === InvoiceStatus.PAID) {
    throw new CustomError("Paid invoice cannot be updated", 400)
  }

  const invoiceEmails = invoice.invoice_emails

  const currentDate = new Date()

  if (data.to !== undefined) {
    const to = invoiceEmails.find((invoiceEmail) => invoiceEmail.email_type === "to")
    if (to !== undefined) {
      if (data.to.length > 0) {
        await InvoiceEmailRepository.updateById(to.id, {
          email_address: data.to,
          updated_at: currentDate,
        })
      }
    } else {
      await InvoiceEmailRepository.create({
        invoice_id: invoice.id,
        email_type: "to",
        email_address: data.to,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  if (data.cc !== undefined) {
    const cc = invoiceEmails.find((invoiceEmail) => invoiceEmail.email_type === "cc")
    if (cc !== undefined) {
      if (data.cc.length > 0) {
        await InvoiceEmailRepository.updateById(cc.id, {
          email_address: data.cc,
          updated_at: currentDate,
        })
      }
      if (data.cc.length === 0) {
        await InvoiceEmailRepository.deleteById(cc.id)
      }
    } else {
      await InvoiceEmailRepository.create({
        invoice_id: invoice.id,
        email_type: "cc",
        email_address: data.cc,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  if (data.bcc !== undefined) {
    const bcc = invoiceEmails.find((invoiceEmail) => invoiceEmail.email_type === "bcc")
    if (bcc !== undefined) {
      if (data.bcc.length > 0) {
        await InvoiceEmailRepository.updateById(bcc.id, {
          email_address: data.bcc,
          updated_at: currentDate,
        })
      }
      if (data.bcc.length === 0) {
        await InvoiceEmailRepository.deleteById(bcc.id)
      }
    } else {
      await InvoiceEmailRepository.create({
        invoice_id: invoice.id,
        email_type: "bcc",
        email_address: data.bcc,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  await InvoiceDetailService.updateByInvoiceId(invoice.id, data.invoice_details)

  if (data.invoice_attachment_ids !== undefined) {
    const existingIds = invoice.invoice_attachments.map((attachment) => attachment.id)
    const newIds = data.invoice_attachment_ids
    const toDelete = existingIds.filter((itemId) => !newIds.includes(itemId))

    await InvoiceAttachmentService.deleteMany(toDelete)
  }

  if (sendInvoiceAction === SendInvoiceAction.NONE) {
    await InvoiceActivityRepository.create({
      invoice_id: id,
      action: InvoiceActivityAction.EDITED,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  let newInvoiceStatus = invoice.invoice_status
  let newPaymentStatus = InvoicePaymentStatus.OPEN

  if (new Date(data.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
    newPaymentStatus = InvoicePaymentStatus.OVERDUE
  }

  if (newInvoiceStatus === InvoiceStatus.DRAFT && sendInvoiceAction === SendInvoiceAction.BILLED) {
    newInvoiceStatus = InvoiceStatus.BILLED

    await InvoiceActivityRepository.create({
      invoice_id: invoice.id,
      action: InvoiceActivityAction.BILLED,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  const newInvoiceAmount = data.invoice_amount ?? 0
  const currentPaymentAmount = invoice.payment_amount?.toNumber() ?? 0

  if (newInvoiceAmount < currentPaymentAmount) {
    newInvoiceStatus = InvoiceStatus.PAID
    newPaymentStatus = InvoicePaymentStatus.PAID
  }

  return await InvoiceRepository.updateById(invoice.id, {
    invoice_date: new Date(data.invoice_date),
    due_date: new Date(data.due_date),
    invoice_amount: data.invoice_amount,
    sub_total: data.sub_total,
    discount_amount: data.discount_amount,
    discount_toggle: data.discount_toggle,
    tax_amount: data.tax_amount,
    tax_type_id: taxType.id,
    tax_toggle: data.tax_toggle,
    payment_account_id: data.payment_account_id,
    payment_term_id: paymentTerm.id,
    invoice_status: newInvoiceStatus,
    payment_status: newPaymentStatus,
    updated_at: currentDate,
  })
}

export const updateBillingAddressById = async (id: number, billing_address_id: number) => {
  return await InvoiceRepository.updateById(id, {
    billing_address_id,
  })
}

export const deleteById = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)
  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }
  await InvoiceRepository.deleteById(id)
}

export const updateInvoiceStatusById = async (id: number, status: InvoiceStatus) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  return await InvoiceRepository.updateInvoiceStatusById(id, status)
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
    mime_type: file.mimetype,
    created_at: currentDate,
    updated_at: currentDate,
  }))

  await InvoiceAttachmentRepository.createMany(invoiceAttachments)
}

export const sendInvoice = async ({
  user,
  id,
  type = SendInvoiceType.Invoice,
  to,
  cc,
  bcc,
  subject,
  content,
  shouldAttachInvoice,
  shouldSendTestEmail,
}: {
  user?: UserToken
  id: number
  type?: SendInvoiceType
  to?: string
  cc?: string
  bcc?: string
  subject: string
  content: string
  shouldAttachInvoice: boolean
  shouldSendTestEmail?: boolean
}) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  let invoiceNo = invoice.invoice_no ?? ""

  if (invoiceNo.length === 0) {
    invoiceNo = await InvoiceRepository.generateInvoiceNumberById(invoice.id)
  }

  if (invoice.invoice_status === InvoiceStatus.DRAFT && shouldSendTestEmail !== true) {
    await InvoiceRepository.updateInvoiceStatusById(invoice.id, InvoiceStatus.BILLED)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    type === SendInvoiceType.Invoice
      ? "Create Invoice Email Template"
      : "Invoice Reminder Email Template"
  )

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  let company = invoice.companies

  if (company === null) {
    company = await CompanyRepository.getById(1)
  }

  const invoiceAmount = invoice.invoice_amount !== null ? invoice.invoice_amount.toNumber() : 0
  const paymentAmount = invoice.payment_amount !== null ? invoice.payment_amount.toNumber() : 0
  const open_balance = invoiceAmount - paymentAmount

  const pdfBuffer = await generateInvoice({
    invoice_no: invoiceNo,
    invoice_date: invoice.invoice_date?.toISOString() ?? "",
    due_date: invoice.due_date?.toISOString() ?? "",
    invoice_amount: invoice.invoice_amount?.toNumber(),
    sub_total: invoice.sub_total?.toNumber(),
    discount_amount: invoice.discount_amount?.toString() ?? "",
    discount_toggle: invoice.discount_toggle,
    tax_amount: invoice.tax_amount?.toNumber(),
    invoice_status:
      invoice.invoice_status === InvoiceStatus.DRAFT
        ? InvoiceStatus.BILLED
        : (invoice.invoice_status ?? ""),

    clients: invoice.clients,
    companies: company,
    currencies: invoice.currencies,
    payment_accounts: {
      name: null,
      currency_id: null,
      payment_network_id: null,
      account_name: invoice.payment_accounts?.account_name ?? null,
      account_type: invoice.payment_accounts?.account_type ?? null,
      account_no: invoice.payment_accounts?.account_no ?? null,
      bank_name: invoice.payment_accounts?.bank_name ?? null,
      bank_branch: invoice.payment_accounts?.bank_branch ?? null,
      bank_code: invoice.payment_accounts?.bank_code ?? null,
      swift_code: invoice.payment_accounts?.swift_code ?? null,
      address1: invoice.payment_accounts?.address1 ?? null,
      address2: invoice.payment_accounts?.address2 ?? null,
      city: invoice.payment_accounts?.city ?? null,
      state: invoice.payment_accounts?.state ?? null,
      description: null,
      country_id: null,
      postal_code: invoice.payment_accounts?.postal_code ?? null,
      is_active: null,

      countries: invoice.payment_accounts?.countries ?? null,
      payment_networks:
        invoice.payment_accounts?.payment_networks !== undefined &&
        invoice.payment_accounts.payment_networks !== null
          ? {
              id: invoice.payment_accounts.payment_networks.id,
              name: invoice.payment_accounts.payment_networks.name,
            }
          : null,
    },

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
    open_balance,

    tax_types: invoice.tax_types,
    addresses: invoice.addresses,
  })

  const invoiceTo = invoice.invoice_emails.find(
    (invoiceEmail) => invoiceEmail.email_type === "to"
  )?.email_address
  const invoiceCc = invoice.invoice_emails.find(
    (invoiceEmail) => invoiceEmail.email_type === "cc"
  )?.email_address
  const invoiceBcc = invoice.invoice_emails.find(
    (invoiceEmail) => invoiceEmail.email_type === "bcc"
  )?.email_address

  const toEmails =
    to?.split(",").map((email) => email.trim()) ??
    invoiceTo?.split(",").map((email) => email.trim()) ??
    []

  const ccEmails =
    cc?.split(",").map((email) => email.trim()) ??
    invoiceCc?.split(",").map((email) => email.trim()) ??
    []

  const bccEmails =
    bcc?.split(",").map((email) => email.trim()) ??
    invoiceBcc?.split(",").map((email) => email.trim()) ??
    []

  if (toEmails.length === 0) {
    throw new CustomError("Invoice email not found", 400)
  }

  const token = await generateToken()

  const previousPayments = await PaymentRepository.getByFilters({
    payment_details: {
      some: {
        invoice_id: invoice.id,
      },
    },
  })

  const emailContent = await generateInvoiceEmailContent(
    {
      invoice_no: invoiceNo,
      invoice_date: invoice.invoice_date?.toISOString() ?? "",
      due_date: invoice.due_date?.toISOString() ?? "",
      invoice_amount: invoice.invoice_amount?.toNumber(),
      sub_total: invoice.sub_total?.toNumber(),
      discount_amount: invoice.discount_amount?.toString() ?? "",
      discount_toggle: invoice.discount_toggle,
      tax_amount: invoice.tax_amount?.toNumber(),
      invoice_status: invoice.invoice_status ?? "",

      clients: invoice.clients,
      companies: company,
      currencies: invoice.currencies,
      payment_accounts: {
        name: null,
        currency_id: null,
        payment_network_id: null,
        account_name: null,
        account_type: null,
        account_no: null,
        bank_name: null,
        bank_branch: null,
        bank_code: null,
        swift_code: null,
        address1: null,
        address2: null,
        city: null,
        state: null,
        description: null,
        country_id: null,
        postal_code: null,
        is_active: null,

        countries: null,
        payment_networks: null,
      },
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
      open_balance,
      previous_payments: previousPayments.map((payment) => ({
        payment_date: payment.payment_date,
        payment_no: payment.payment_no ?? "",
        payment_amount: payment.payment_amount?.toString() ?? "",
      })),
      token,

      tax_types: invoice.tax_types,
      addresses: invoice.addresses,
    },
    content
  )

  const location = "invoices"
  const filename = token + ".pdf"

  await uploadFile({
    buffer: pdfBuffer,
    filename,
    location,
  })

  await InvoiceRepository.updateById(id, {
    pdf_link: location + "/" + filename,
  })

  const currentDate = new Date()

  await InvoiceLinkRepository.create({
    invoice_id: invoice.id,
    token,
    expires_at: addDays(currentDate, Number(process.env.INVOICE_LINK_TOKEN_EXPIRATION ?? 0)),
    created_at: currentDate,
    updated_at: currentDate,
  })

  const attachments = await Promise.all(
    invoice.invoice_attachments.map(async (invoiceAttachment) => {
      const filename = invoiceAttachment.filename ?? ""
      const file = await getFile(filename)
      if (file === null) {
        return null
      }
      const cleanedFilename = filename.replace(/^\d+-/, "")
      return {
        content: file,
        filename: cleanedFilename,
        disposition: "attachment",
      }
    })
  )

  if (shouldAttachInvoice) {
    attachments.unshift({
      content: pdfBuffer.toString("base64"),
      filename: "invoice.pdf",
      disposition: "attachment",
    })
  }

  if (type === SendInvoiceType.Invoice && shouldSendTestEmail !== true) {
    const totalSentActions = await InvoiceActivityRepository.countAllByFilters({
      invoice_id: invoice.id,
      action: InvoiceActivityAction.SENT_MAIL,
    })

    await InvoiceActivityRepository.create({
      invoice_id: invoice.id,
      action:
        totalSentActions === 0 ? InvoiceActivityAction.SENT_MAIL : InvoiceActivityAction.RESENT,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  if (type === SendInvoiceType.Reminder && shouldSendTestEmail !== true) {
    await InvoiceActivityRepository.create({
      invoice_id: invoice.id,
      action: InvoiceActivityAction.REMINDER_SENT,
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  const replacements: Record<string, string> = {
    invoice_no: invoice.invoice_no ?? "",
    company: company?.name ?? "",
  }

  const modifiedSubject: string = subject.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })

  if (type === SendInvoiceType.Reminder) {
    subject = `Reminder for Invoice ${invoice.invoice_no} from ${company?.name}`
  }

  const emailLogData: EmailLog = {
    content: emailContent,
    created_at: currentDate,
    email_address: toEmails.join(","),
    email_status: EmailLogType.Pending,
    email_type: emailTemplate.template_type,
    mail_id: "",
    notes: `{"invoice_id": ${invoice.id}}`,
    sent_at: currentDate,
    subject: modifiedSubject,
    updated_at: currentDate,
    user_id: user?.id,
  }

  const systemSettings = await SystemSettingsRepository.getByName("khbooks_email_sender")

  const sgRes = await sendMail({
    to: toEmails,
    cc: ccEmails,
    bcc: bccEmails,
    from: systemSettings?.value,
    subject: modifiedSubject,
    content: emailContent,
    attachments: attachments.filter((attachment) => attachment !== null),
    custom_args: {
      invoice_id: invoice.id.toString(),
      test_email: shouldSendTestEmail === true ? "1" : "0",
    },
  })

  if (sgRes !== undefined && sgRes !== null) {
    const mailId = sgRes[0].headers["x-message-id"]
    emailLogData.mail_id = mailId
    emailLogData.email_status = EmailLogType.Sent
  } else {
    emailLogData.email_status = EmailLogType.Error
  }

  await EmailLogRepository.create(emailLogData)
}

export const cancelInvoice = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  if (
    invoice.invoice_status !== InvoiceStatus.BILLED &&
    invoice.invoice_status !== InvoiceStatus.VIEWED
  ) {
    throw new CustomError("Only invoices that have been billed or viewed can be cancelled", 400)
  }

  const currentDate = new Date()

  await InvoiceActivityRepository.create({
    invoice_id: invoice.id,
    action: InvoiceActivityAction.CANCELLED,
    created_at: currentDate,
    updated_at: currentDate,
  })

  await InvoiceRepository.updateInvoiceStatusById(invoice.id, InvoiceStatus.CANCELLED)
}

export const getLink = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  let invoiceLink = await InvoiceLinkRepository.getLatestByInvoiceId(invoice.id)

  if (invoiceLink === null) {
    const currentDate = new Date()

    invoiceLink = await InvoiceLinkRepository.create({
      invoice_id: invoice.id,
      token: await generateToken(),
      expires_at: addDays(currentDate, Number(process.env.INVOICE_LINK_TOKEN_EXPIRATION ?? 0)),
      created_at: currentDate,
      updated_at: currentDate,
    })
  }

  return invoiceLink
}

export const getInvoiceById = async (id: number) => {
  const invoice = await InvoiceRepository.getById(id)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  if (invoice?.companies === null) {
    invoice.companies = await CompanyRepository.getById(1)
  }

  return invoice
}

export const getInvoiceByToken = async (token: string) => {
  const invoiceLink = await InvoiceLinkRepository.getLatestByToken(token)

  if (invoiceLink === null) {
    throw new CustomError("Invoice link is either invalid or has expired.", 400)
  }

  const invoice = await InvoiceRepository.getById(invoiceLink.invoice_id ?? 0)

  if (invoice === null) {
    throw new CustomError("Invoice link is either invalid or has expired.", 400)
  }

  if (invoice?.companies === null) {
    invoice.companies = await CompanyRepository.getById(1)
  }

  return invoice
}

export const getNextInvoiceNo = async () => {
  return await InvoiceRepository.getNextInvoiceNo()
}

export const generateToken = async () => {
  let uuid
  do {
    uuid = uuidv4()
  } while ((await InvoiceLinkRepository.getByToken(uuid)) != null)
  return uuid
}

export const updateOverdueInvoices = async () => {
  const overdueInvoices = await InvoiceRepository.paginateByFilters(0, 50, {
    due_date: {
      lt: startOfDay(new Date()),
    },
    payment_status: InvoicePaymentStatus.OPEN,
  })

  await InvoiceRepository.updateInvoicePaymentStatusByIds(
    overdueInvoices.map((invoice) => invoice.id),
    InvoicePaymentStatus.OVERDUE
  )
}
