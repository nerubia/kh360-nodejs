import { type Prisma } from "@prisma/client"
import { endOfMonth, startOfMonth, subMonths } from "date-fns"
import * as PaymentRepository from "../../repositories/khbooks/payment-repository"
import {
  PaymentDateFilter,
  PaymentStatusFilter,
  type Payment,
  SendPaymentAction,
  PaymentStatus,
} from "../../types/payment-type"
import CustomError from "../../utils/custom-error"
import * as CompanyRepository from "../../repositories/company-repository"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as InvoiceActivityRepository from "../../repositories/khbooks/invoice-activity-repository"
import * as ClientRepository from "../../repositories/client-repository"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import * as PaymentEmailRepository from "../../repositories/khbooks/payment-email-repository"
import * as PaymentAttachmentRepository from "../../repositories/khbooks/payment-attachment-repository"
import * as PaymentDetailRepository from "../../repositories/khbooks/payment-detail-repository"
import * as PaymentAttachmentService from "../khbooks/payment-attachment-service"
import * as PaymentDetailService from "../khbooks/payment-detail-service"
import * as EmailTemplateRepository from "../../repositories/email-template-repository"
import * as EmailLogRepository from "../../repositories/email-log-repository"
import * as SystemSettingsRepository from "../../repositories/system-settings-repository"
import { type S3File } from "../../types/s3-file-type"
import { InvoicePaymentStatus, InvoiceStatus } from "../../types/invoice-type"
import { InvoiceActivityAction } from "../../types/invoice-activity-type"
import { generatePaymentEmailContent } from "../../utils/generate-payment-email-content"
import { sendMail } from "../../utils/sendgrid"
import { generatePayment } from "../../utils/generate-payment"
import { type EmailLog, EmailLogType } from "../../types/email-log-type"
import { type UserToken } from "../../types/user-token-type"
import { getFile } from "../../utils/s3"

export const getAllByFilters = async (
  payment_date: string,
  client_id: number,
  invoice_no: string,
  payment_no: string,
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
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_3_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 3),
          lte: new Date(),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_6_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 6),
          lte: new Date(),
        },
      })
    }
    if (payment_date === PaymentDateFilter.LAST_12_MONTHS) {
      Object.assign(where, {
        payment_date: {
          gte: subMonths(new Date(), 12),
          lte: new Date(),
        },
      })
    }
  }

  if (!isNaN(client_id)) {
    Object.assign(where, {
      client_id,
    })
  }

  if (invoice_no !== undefined) {
    Object.assign(where, {
      payment_details: {
        some: {
          invoices: {
            invoice_no: {
              contains: invoice_no,
            },
          },
        },
      },
    })
  }

  if (payment_no !== undefined) {
    Object.assign(where, {
      payment_no: {
        contains: payment_no,
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

export const create = async (data: Payment, sendPaymentAction: SendPaymentAction) => {
  const client = await ClientRepository.getById(data.client_id ?? 0)
  if (client === null) {
    throw new CustomError("Client not found", 400)
  }

  const currency = await CurrencyRepository.getById(data.currency_id ?? 0)
  if (currency === null) {
    throw new CustomError("Currency not found", 400)
  }

  const currentDate = new Date()

  const newPayment = await PaymentRepository.create({
    client_id: client.id,
    company_id: client.company_id,
    currency_id: currency.id,
    payment_date: new Date(data.payment_date ?? ""),
    payment_reference_no: data.payment_reference_no ?? "",
    or_no: data.or_no ?? "",

    payment_amount: data.payment_amount ?? 0.0,
    payment_amount_php: data.payment_amount_php ?? 0.0,

    payment_status:
      sendPaymentAction === SendPaymentAction.RECEIVED ||
      sendPaymentAction === SendPaymentAction.SEND
        ? PaymentStatus.RECEIVED
        : PaymentStatus.DRAFT,

    created_at: currentDate,
    updated_at: currentDate,
  })

  await PaymentRepository.generatePaymentNumberById(newPayment.id)

  if (data.to !== undefined && data.to.length > 0) {
    await PaymentEmailRepository.create({
      payment_id: newPayment.id,
      email_type: "to",
      email_address: data.to,
    })
  }

  if (data.cc !== undefined && data.cc.length > 0) {
    await PaymentEmailRepository.create({
      payment_id: newPayment.id,
      email_type: "cc",
      email_address: data.cc,
    })
  }

  if (data.bcc !== undefined && data.bcc.length > 0) {
    await PaymentEmailRepository.create({
      payment_id: newPayment.id,
      email_type: "bcc",
      email_address: data.bcc,
    })
  }

  await PaymentDetailService.updateByPaymentId(newPayment.id, data.payment_details ?? [])

  if (
    sendPaymentAction === SendPaymentAction.RECEIVED ||
    sendPaymentAction === SendPaymentAction.SEND
  ) {
    const invoiceIds = data.payment_details
      ?.map((detail) => detail.invoice_id)
      .filter((id) => id !== null)

    const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

    for (const invoice of invoices) {
      if (invoice.invoice_status === InvoiceStatus.PAID) {
        throw new CustomError(
          `Unable to process Invoice ${invoice.invoice_no}. It's already fully paid.`,
          400
        )
      }

      const totalPaidAmount = invoice.payment_details.reduce((prev: number, paymentDetail) => {
        return prev + Number(paymentDetail.payment_amount)
      }, 0)

      const updatedInvoiceData = {}

      if (invoice.invoice_amount?.toNumber() === totalPaidAmount) {
        Object.assign(updatedInvoiceData, {
          invoice_status: InvoiceStatus.PAID,
          payment_status: InvoiceStatus.PAID,
        })
      }

      await InvoiceRepository.updateById(invoice.id, {
        ...updatedInvoiceData,
        payment_amount: totalPaidAmount,
      })

      await InvoiceActivityRepository.create({
        invoice_id: invoice.id,
        action: InvoiceActivityAction.PAID,
        reference_id: newPayment.id,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  return newPayment
}

export const show = async (id: number) => {
  const payment = await PaymentRepository.getById(id)

  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  const paymentDetails = await Promise.all(
    payment.payment_details.map(async (paymentDetail) => {
      const invoice = await InvoiceRepository.getById(paymentDetail.invoice_id ?? 0)
      if (invoice === null) return null

      const invoiceAmount = invoice.invoice_amount?.toNumber() ?? 0

      const previousPaymentDetails = await PaymentDetailRepository.getAllByFilters({
        payment_id: {
          not: paymentDetail.payment_id,
        },
        invoice_id: paymentDetail.invoice_id,
        created_at: {
          lt: new Date(paymentDetail.created_at ?? ""),
        },
        payments: {
          payment_status: PaymentStatus.RECEIVED,
        },
      })

      const totalPaidAmount = previousPaymentDetails.reduce((prev: number, paymentDetail) => {
        return prev + Number(paymentDetail.payment_amount)
      }, 0)

      return {
        ...paymentDetail,
        invoice_no: invoice.invoice_no,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        invoice_amount: invoiceAmount,
        paid_amount: totalPaidAmount,
        open_balance: invoiceAmount - totalPaidAmount,
      }
    })
  )

  return {
    ...payment,
    payment_details: paymentDetails,
  }
}

export const uploadAttachments = async (id: number, files: S3File[]) => {
  const payment = await PaymentRepository.getById(id)

  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  const currentDate = new Date()

  const paymentAttachments: Prisma.payment_attachmentsCreateInput[] = files.map((file) => ({
    payment_id: payment.id,
    filename: file.key,
    mime_type: file.mimetype,
    created_at: currentDate,
    updated_at: currentDate,
  }))

  await PaymentAttachmentRepository.createMany(paymentAttachments)
}

export const update = async (id: number, data: Payment, sendPaymentAction: SendPaymentAction) => {
  const payment = await PaymentRepository.getById(id)
  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  if (payment.payment_status === PaymentStatus.RECEIVED) {
    throw new CustomError("Received payment cannot be updated", 400)
  }

  if (payment.payment_status === PaymentStatus.CANCELLED) {
    throw new CustomError("Cancelled payment cannot be updated", 400)
  }

  const paymentEmails = payment.payment_emails

  const currentDate = new Date()

  if (data.to !== undefined) {
    const to = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "to")
    if (to !== undefined) {
      if (data.to.length > 0) {
        await PaymentEmailRepository.updateById(to.id, {
          email_address: data.to,
        })
      }
    } else {
      await PaymentEmailRepository.create({
        payment_id: payment.id,
        email_type: "to",
        email_address: data.to,
      })
    }
  }

  if (data.cc !== undefined) {
    const cc = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "cc")
    if (cc !== undefined) {
      if (data.cc.length > 0) {
        await PaymentEmailRepository.updateById(cc.id, {
          email_address: data.cc,
        })
      }
      if (data.cc.length === 0) {
        await PaymentEmailRepository.deleteById(cc.id)
      }
    } else {
      await PaymentEmailRepository.create({
        payment_id: payment.id,
        email_type: "cc",
        email_address: data.cc,
      })
    }
  }

  if (data.bcc !== undefined) {
    const bcc = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "bcc")
    if (bcc !== undefined) {
      if (data.bcc.length > 0) {
        await PaymentEmailRepository.updateById(bcc.id, {
          email_address: data.bcc,
        })
      }
      if (data.bcc.length === 0) {
        await PaymentEmailRepository.deleteById(bcc.id)
      }
    } else {
      await PaymentEmailRepository.create({
        payment_id: payment.id,
        email_type: "bcc",
        email_address: data.bcc,
      })
    }
  }

  await PaymentDetailService.updateByPaymentId(payment.id, data.payment_details ?? [])

  if (data.payment_attachment_ids !== undefined) {
    const existingIds = payment.payment_attachments.map((attachment) => attachment.id)
    const newIds = data.payment_attachment_ids
    const toDelete = existingIds.filter((itemId) => !newIds.includes(itemId))

    await PaymentAttachmentService.deleteMany(toDelete)
  }

  const invoiceIds = data.payment_details
    ?.map((detail) => detail.invoice_id)
    .filter((id) => id !== null)

  let newPaymentStatus = payment.payment_status

  if (
    newPaymentStatus === PaymentStatus.DRAFT &&
    (sendPaymentAction === SendPaymentAction.RECEIVED ||
      sendPaymentAction === SendPaymentAction.SEND)
  ) {
    newPaymentStatus = PaymentStatus.RECEIVED

    const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

    for (const invoice of invoices) {
      if (invoice.invoice_status === InvoiceStatus.PAID) {
        throw new CustomError(
          `Unable to update payment. Invoice ${invoice.invoice_no} has already been fully paid.`,
          400
        )
      }
    }
  }

  const updatedPayment = await PaymentRepository.updateById(payment.id, {
    payment_date: new Date(data.payment_date ?? ""),
    payment_reference_no: data.payment_reference_no ?? "",
    or_no: data.or_no ?? "",

    payment_amount: data.payment_amount ?? 0.0,
    payment_amount_php: data.payment_amount_php ?? 0.0,

    payment_status: newPaymentStatus,

    updated_at: currentDate,
  })

  if (
    payment.payment_status === PaymentStatus.DRAFT &&
    (sendPaymentAction === SendPaymentAction.RECEIVED ||
      sendPaymentAction === SendPaymentAction.SEND)
  ) {
    const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

    for (const invoice of invoices) {
      const invoiceAmount = invoice.invoice_amount?.toNumber() ?? 0
      const totalPaidAmount = invoice.payment_details.reduce((prev: number, paymentDetail) => {
        return prev + Number(paymentDetail.payment_amount)
      }, 0)

      const updatedInvoiceData = {}

      if (totalPaidAmount >= invoiceAmount) {
        Object.assign(updatedInvoiceData, {
          invoice_status: InvoiceStatus.PAID,
          payment_status: InvoicePaymentStatus.PAID,
        })
      }

      await InvoiceRepository.updateById(invoice.id, {
        ...updatedInvoiceData,
        payment_amount: totalPaidAmount,
      })

      await InvoiceActivityRepository.create({
        invoice_id: invoice.id,
        action: InvoiceActivityAction.PAID,
        reference_id: payment.id,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  return updatedPayment
}

export const sendPayment = async ({
  user,
  id,
  subject,
  content,
}: {
  user?: UserToken
  id: number
  subject: string
  content: string
}) => {
  const payment = await PaymentRepository.getById(id)

  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Create Payment Email Template"
  )

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  let company = payment.companies

  if (company === null) {
    company = await CompanyRepository.getById(1)
  }

  const to = payment.payment_emails.find(
    (paymentEmail) => paymentEmail.email_type === "to"
  )?.email_address
  const cc = payment.payment_emails.find(
    (paymentEmail) => paymentEmail.email_type === "cc"
  )?.email_address
  const bcc = payment.payment_emails.find(
    (paymentEmail) => paymentEmail.email_type === "bcc"
  )?.email_address

  const toEmails = to?.split(",").map((email) => email.trim()) ?? []
  const ccEmails = cc?.split(",").map((email) => email.trim()) ?? []
  const bccEmails = bcc?.split(",").map((email) => email.trim()) ?? []

  if (toEmails.length === 0) {
    throw new CustomError("Invoice email not found", 400)
  }

  const pdfBuffer = await generatePayment({
    payment_no: payment.payment_no,
    payment_date: payment.payment_date?.toISOString() ?? "",
    payment_amount: payment.payment_amount?.toString() ?? "",
    or_no: payment.or_no,
    payment_details: await Promise.all(
      payment.payment_details.map(async (paymentDetail) => {
        const paymentDetails = await PaymentDetailRepository.getByInvoiceId(
          paymentDetail.invoice_id ?? 0
        )

        const invoiceAmount = paymentDetail.invoices?.invoice_amount?.toNumber() ?? 0

        const totalPayments = paymentDetails.reduce((acc, payment) => {
          const paymentAmount =
            paymentDetail.id !== payment.id && payment.payment_amount !== null
              ? payment.payment_amount.toNumber()
              : 0
          return acc + paymentAmount
        }, 0)

        const openBalance = invoiceAmount - totalPayments

        return {
          id: paymentDetail.id,
          payment_id: null,
          invoice_id: null,
          payment_amount: paymentDetail.payment_amount?.toString() ?? "",
          showQuantityField: false,
          open_balance: openBalance,
          invoices: {
            invoice_no: paymentDetail.invoices?.invoice_no ?? "",
            invoice_date: paymentDetail.invoices?.invoice_date?.toISOString() ?? "",
            due_date: paymentDetail.invoices?.due_date?.toISOString() ?? "",
            invoice_amount: invoiceAmount,
            discount_amount: paymentDetail.invoices?.discount_amount?.toNumber() ?? 0,
            discount_toggle: paymentDetail.invoices?.discount_toggle ?? false,
            tax_type_id: 0,
            tax_toggle: false,
            payment_account_id: 0,
            payment_term_id: 0,
            invoice_details: [],
          },
        }
      })
    ),
    clients: {
      name: payment.clients?.name ?? "",
      address1: payment.clients?.address1 ?? "",
      address2: payment.clients?.address2 ?? "",
      city: payment.clients?.city ?? "",
      state: payment.clients?.state ?? "",
      postal_code: payment.clients?.postal_code ?? null,
      countries: payment.clients?.countries,
    },
    companies: company,
    currencies: payment.currencies,
  })

  const emailContent = await generatePaymentEmailContent(
    {
      payment_no: payment.payment_no,
      payment_date: payment.payment_date?.toISOString() ?? "",
      payment_amount: payment.payment_amount?.toString() ?? "",
      or_no: payment.or_no,
      clients: payment.clients,
      companies: company,
    },
    content
  )

  const replacements: Record<string, string> = {
    company: company?.name ?? "",
  }

  const modifiedSubject: string = subject.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })

  const currentDate = new Date()

  const attachments = await Promise.all(
    payment.payment_attachments.map(async (paymentAttachment) => {
      const filename = paymentAttachment.filename ?? ""
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

  attachments.unshift({
    content: pdfBuffer.toString("base64"),
    filename: `${company?.shorthand} - Payment ${payment.payment_no}.pdf`,
    disposition: "attachment",
  })

  const emailLogData: EmailLog = {
    content: emailContent,
    created_at: currentDate,
    email_address: toEmails.join(","),
    email_status: EmailLogType.Pending,
    email_type: emailTemplate.template_type,
    mail_id: "",
    notes: `{"payment_id": ${payment.id}}`,
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

export const deleteById = async (id: number) => {
  const payment = await PaymentRepository.getById(id)
  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }
  if (payment.payment_status !== PaymentStatus.DRAFT) {
    throw new CustomError("Only draft payments can be deleted", 400)
  }
  await PaymentRepository.deleteById(id)
}

export const cancel = async (id: number) => {
  const payment = await PaymentRepository.getById(id)

  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  if (payment.payment_status !== PaymentStatus.RECEIVED) {
    throw new CustomError("Only received payments can be cancelled", 400)
  }

  const currentDate = new Date()

  const updatedPayment = await PaymentRepository.updateById(payment.id, {
    payment_status: PaymentStatus.CANCELLED,
    updated_at: currentDate,
  })

  const invoiceIds = payment.payment_details
    .map((paymentDetail) => paymentDetail.invoice_id)
    .filter((id) => id !== null)

  const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

  for (const invoice of invoices) {
    const invoiceAmount = invoice.invoice_amount?.toNumber() ?? 0
    const totalPaidAmount = invoice.payment_details.reduce((prev: number, paymentDetail) => {
      return prev + Number(paymentDetail.payment_amount)
    }, 0)

    const isPaymentOpen =
      new Date(invoice.due_date ?? "").setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)

    const updatedInvoiceData = {
      invoice_status: InvoiceStatus.BILLED,
      payment_status: isPaymentOpen ? InvoicePaymentStatus.OPEN : InvoicePaymentStatus.OVERDUE,
    }

    if (totalPaidAmount >= invoiceAmount) {
      Object.assign(updatedInvoiceData, {
        invoice_status: InvoiceStatus.PAID,
        payment_status: InvoicePaymentStatus.PAID,
      })
    }

    await InvoiceRepository.updateById(invoice.id, {
      ...updatedInvoiceData,
      payment_amount: totalPaidAmount,
      updated_at: currentDate,
    })
  }

  return updatedPayment
}
