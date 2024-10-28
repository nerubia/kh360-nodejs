import { type Prisma } from "@prisma/client"
import { subMonths } from "date-fns"
import * as PaymentRepository from "../../repositories/khbooks/payment-repository"
import {
  PaymentDateFilter,
  PaymentStatusFilter,
  type Payment,
  SendPaymentAction,
  PaymentStatus,
} from "../../types/payment-type"
import CustomError from "../../utils/custom-error"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as InvoiceActivityRepository from "../../repositories/khbooks/invoice-activity-repository"
import * as ClientRepository from "../../repositories/client-repository"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import * as PaymentEmailRepository from "../../repositories/khbooks/payment-email-repository"
import * as PaymentAttachmentRepository from "../../repositories/khbooks/payment-attachment-repository"
import * as PaymentAttachmentService from "../khbooks/payment-attachment-service"
import * as PaymentDetailService from "../khbooks/payment-detail-service"
import { type S3File } from "../../types/s3-file-type"
import { InvoiceStatus } from "../../types/invoice-type"

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

  if (sendPaymentAction === SendPaymentAction.RECEIVED) {
    const invoiceIds = data.payment_details
      ?.map((detail) => detail.invoice_id)
      .filter((id) => id !== null)
    const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

    for (const invoice of invoices) {
      await InvoiceRepository.updateById(invoice.id, {
        invoice_status: InvoiceStatus.PAID,
        payment_status: InvoiceStatus.PAID,
      })

      await InvoiceActivityRepository.create({
        invoice_id: invoice.id,
        action: SendPaymentAction.RECEIVED,
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

  const receivedPayments = await PaymentRepository.getByFilters({
    payment_status: PaymentStatus.RECEIVED,
  })
  const receivedPaymentIds = receivedPayments.map((payment) => payment.id)
  const fiteredPaymentDetails = payment.payment_details.filter((payment) =>
    receivedPaymentIds.includes(payment.id)
  )

  const paymentDetails = await Promise.all(
    payment.payment_details.map(async (paymentDetail) => {
      const invoice = await InvoiceRepository.getById(paymentDetail.invoice_id ?? 0)
      if (invoice === null) {
        return null
      }
      const totalPayments = fiteredPaymentDetails.reduce((acc, payment) => {
        const paymentAmount =
          payment.payment_amount !== null ? payment.payment_amount.toNumber() : 0
        return acc + paymentAmount
      }, 0)

      const invoiceAmount = invoice.invoice_amount !== null ? invoice.invoice_amount.toNumber() : 0

      return {
        ...paymentDetail,
        invoice_no: invoice.invoice_no,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        invoice_amount: invoiceAmount,
        paid_amount: totalPayments,
        open_balance: invoiceAmount - totalPayments,
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

  const invoiceAttachments: Prisma.invoice_attachmentsCreateInput[] = files.map((file) => ({
    payment_id: payment.id,
    filename: file.key,
    mime_type: file.mimetype,
    created_at: currentDate,
    updated_at: currentDate,
  }))

  await PaymentAttachmentRepository.createMany(invoiceAttachments)
}

export const update = async (id: number, data: Payment, sendPaymentAction: SendPaymentAction) => {
  const payment = await PaymentRepository.getById(id)
  if (payment === null) {
    throw new CustomError("Payment not found", 400)
  }

  const paymentEmails = payment.payment_emails

  const currentDate = new Date()

  if (data.to !== undefined && data.to.length > 0) {
    const to = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "to")
    if (to !== undefined) {
      await PaymentEmailRepository.updateById(to.id, {
        email_address: data.to,
      })
    } else {
      await PaymentEmailRepository.create({
        payment_id: payment.id,
        email_type: "to",
        email_address: data.to,
      })
    }
  }

  if (data.cc !== undefined && data.cc.length > 0) {
    const cc = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "cc")
    if (cc !== undefined) {
      await PaymentEmailRepository.updateById(cc.id, {
        email_address: data.cc,
      })
    } else {
      await PaymentEmailRepository.create({
        payment_id: payment.id,
        email_type: "cc",
        email_address: data.cc,
      })
    }
  }

  if (data.bcc !== undefined && data.bcc.length > 0) {
    const bcc = paymentEmails.find((paymentEmail) => paymentEmail.email_type === "bcc")
    if (bcc !== undefined) {
      await PaymentEmailRepository.updateById(bcc.id, {
        email_address: data.bcc,
      })
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

  let currentPaymentStatus = payment.payment_status

  if (
    currentPaymentStatus === PaymentStatus.DRAFT &&
    sendPaymentAction === SendPaymentAction.RECEIVED
  ) {
    currentPaymentStatus = PaymentStatus.RECEIVED

    const invoiceIds = data.payment_details
      ?.map((detail) => detail.invoice_id)
      .filter((id) => id !== null)
    const invoices = await InvoiceRepository.getByIds(invoiceIds ?? [])

    for (const invoice of invoices) {
      await InvoiceRepository.updateById(invoice.id, {
        invoice_status: InvoiceStatus.PAID,
        payment_status: InvoiceStatus.PAID,
      })

      await InvoiceActivityRepository.create({
        invoice_id: invoice.id,
        action: SendPaymentAction.RECEIVED,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }

  return await PaymentRepository.updateById(id, {
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
}
