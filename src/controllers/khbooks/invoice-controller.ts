import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as InvoiceService from "../../services/khbooks/invoice-service"
import * as AddressService from "../../services/khbooks/address-service"
import * as CountryService from "../../services/khbooks/country-service"
import * as EmailTemplateService from "../../services/email-template-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"
import { createInvoiceSchema } from "../../utils/validation/invoice-schema"
import { createAddressSchema } from "../../utils/validation/address-schema"
import { type S3File } from "../../types/s3-file-type"
import { getFileUrl } from "../../utils/s3"
import { type InvoiceAttachment } from "../../types/invoice-attachment-type"
import { SendInvoiceType } from "../../types/send-invoice-type"
import { SendInvoiceAction } from "../../types/invoice-type"
import { type InvoiceDetail } from "../../types/invoice-detail-type"

/**
 * List invoices based on provided filters.
 * @param req.query.invoice_date - Filter by invoice date.
 * @param req.query.invoice_no - Filter by invoice no.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.status - Filter by status.
 * @param req.query.statuses - Filter by statuses.
 * @param req.query.due_date - Filter by due_date.
 * @param req.query.page - Page number for pagination.
 * @param req.query.has_open_balance - Filter invoices with an open balance.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const {
      invoice_date,
      invoice_no,
      client_id,
      status,
      statuses,
      due_date,
      page,
      sort_by,
      sort_order,
      has_open_balance,
    } = req.query
    const results = await InvoiceService.getAllByFilters(
      invoice_date as string,
      invoice_no as string,
      parseInt(client_id as string),
      status as string,
      statuses as string,
      due_date as string,
      page as string,
      sort_by as "invoice_no" | "due_date",
      sort_order as "asc" | "desc",
      Boolean(has_open_balance)
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new invoice.
 * @param req.body.client_id - Client id.
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.currency_id - Currency id.
 * @param req.body.invoice_date - Invoice date.
 * @param req.body.due_date - Due date.
 * @param req.body.invoice_amount - Invoice amount.
 * @param req.body.sub_total - Sub total.
 * @param req.body.discount_amount - Discount amount.
 * @param req.body.discount_toggle - Discount toggle.
 * @param req.body.tax_amount - Tax amount.
 * @param req.body.tax_type_id - Tax type id.
 * @param req.body.tax_toggle - Tax toggle.
 * @param req.body.payment_account_id - Payment account id.
 * @param req.body.payment_term_id - Payment term id.
 * @param req.body.address1 - Address 1.
 * @param req.body.address2 - Address 2.
 * @param req.body.city - City.
 * @param req.body.state - State.
 * @param req.body.country_id - Country id.
 * @param req.body.postal_code - Postal code.
 * @param req.body.invoice_details - Invoice details.
 * @param req.body.send_invoice_action - Send invoice action.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 * @param req.body.should_attach_invoice - Should attach invoice
 */

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const {
      client_id,
      to,
      cc,
      bcc,
      currency_id,
      invoice_date,
      due_date,
      invoice_amount,
      sub_total,
      discount_amount,
      discount_toggle,
      tax_amount,
      tax_type_id,
      tax_toggle,
      payment_account_id,
      payment_term_id,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
      invoice_details,
      send_invoice_action,
      subject,
      content,
      should_attach_invoice,
    } = req.body

    const files = req.files as S3File[]

    const validatedAddress = await createAddressSchema.validate({
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    })

    const parsedInvoiceDetails: InvoiceDetail[] = JSON.parse(invoice_details)
    const invoiceDetails = parsedInvoiceDetails.map((invoiceDetail) => {
      const quantity =
        invoiceDetail.quantity?.toString().length === 0 ? null : invoiceDetail.quantity
      const rate = invoiceDetail.quantity?.toString().length === 0 ? null : invoiceDetail.rate

      return {
        ...invoiceDetail,
        quantity,
        rate,
      }
    })

    await createInvoiceSchema.validate({
      client_id,
      to,
      cc,
      bcc,
      currency_id,
      invoice_date,
      due_date,
      invoice_amount,
      sub_total,
      discount_amount,
      discount_toggle,
      tax_amount,
      tax_type_id,
      tax_toggle,
      payment_account_id,
      payment_term_id,
      invoice_details: invoiceDetails,
      subject,
      content,
      should_attach_invoice,
    })

    const country = await CountryService.getById(parseInt(country_id ?? "0"))

    let address = null

    if (
      (validatedAddress.address1 !== undefined && validatedAddress.address1.length > 0) ||
      (validatedAddress.address2 !== undefined && validatedAddress.address2.length > 0) ||
      (validatedAddress.city !== undefined && validatedAddress.city.length > 0) ||
      (validatedAddress.state !== undefined && validatedAddress.state.length > 0) ||
      (validatedAddress.country_id !== null && validatedAddress.country_id !== 0) ||
      (validatedAddress.postal_code !== undefined && validatedAddress.postal_code.length > 0)
    ) {
      address = await AddressService.create({
        address1,
        address2,
        city,
        state,
        country: country?.name ?? null,
        postal_code,
      })
    }

    const newInvoice = await InvoiceService.create(
      {
        client_id: parseInt(client_id as string),
        to,
        cc,
        bcc,
        currency_id: parseInt(currency_id as string),
        invoice_date,
        due_date,
        invoice_amount: parseFloat(invoice_amount as string),
        sub_total: parseFloat(sub_total as string),
        discount_amount: parseFloat(discount_amount as string),
        discount_toggle: Boolean(Number(discount_toggle)),
        tax_amount: parseFloat(tax_amount as string),
        tax_type_id: parseInt(tax_type_id as string),
        tax_toggle: Boolean(Number(tax_toggle)),
        payment_account_id: parseInt(payment_account_id as string),
        payment_term_id: parseInt(payment_term_id as string),
        billing_address_id: address?.id,
        invoice_details: invoiceDetails,
        attach_invoice: Boolean(Number(should_attach_invoice)),
      },
      send_invoice_action as SendInvoiceAction
    )

    await InvoiceService.uploadAttachments(newInvoice.id, files)

    if (send_invoice_action === SendInvoiceAction.SEND) {
      await InvoiceService.sendInvoice({
        user,
        id: newInvoice.id,
        subject,
        content,
        shouldAttachInvoice: Boolean(Number(should_attach_invoice)),
      })
    }

    res.json(newInvoice)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific invoice by ID.
 * @param req.params.id - Invoice id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const invoice = await InvoiceService.show(parseInt(id))

    let invoiceAttachments: InvoiceAttachment[] = []

    if (invoice?.invoice_attachments !== undefined) {
      invoiceAttachments = await Promise.all(
        invoice.invoice_attachments.map(async (invoiceAttachment) => {
          return {
            ...invoiceAttachment,
            url: await getFileUrl(
              invoiceAttachment.filename ?? "",
              invoiceAttachment.mime_type ?? ""
            ),
          }
        })
      )
    }

    res.json({
      ...invoice,
      invoice_attachments: invoiceAttachments,
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing invoice.
 * @param req.params.id - The ID of the invoice to be updated
 * @param req.body.client_id - Client id.
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.currency_id - Currency id.
 * @param req.body.invoice_date - Invoice date.
 * @param req.body.due_date - Due date.
 * @param req.body.invoice_amount - Invoice amount.
 * @param req.body.sub_total - Sub total.
 * @param req.body.discount_amount - Discount amount.
 * @param req.body.discount_toggle - Discount toggle.
 * @param req.body.tax_amount - Tax amount.
 * @param req.body.tax_type_id - Tax type id.
 * @param req.body.tax_toggle - Tax toggle.
 * @param req.body.payment_account_id - Payment account id.
 * @param req.body.payment_term_id - Payment term id.
 * @param req.body.address1 - Address 1.
 * @param req.body.address2 - Address 2.
 * @param req.body.city - City.
 * @param req.body.state - State.
 * @param req.body.country_id - Country id.
 * @param req.body.postal_code - Postal code.
 * @param req.body.invoice_details - Invoice details.
 * @param req.body.invoice_attachment_ids - Invoice attachment ids.
 * @param req.body.send_invoice_action - Send invoice action.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 * @param req.body.should_attach_invoice - Should attach invoice
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params

    const {
      client_id,
      to,
      cc,
      bcc,
      currency_id,
      invoice_date,
      due_date,
      invoice_amount,
      sub_total,
      discount_amount,
      discount_toggle,
      tax_amount,
      tax_type_id,
      tax_toggle,
      payment_account_id,
      payment_term_id,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
      invoice_details,
      invoice_attachment_ids,
      send_invoice_action,
      subject,
      content,
      should_attach_invoice,
    } = req.body

    const files = req.files as S3File[]

    const validatedAddress = await createAddressSchema.validate({
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    })

    const parsedInvoiceDetails: InvoiceDetail[] = JSON.parse(invoice_details)
    const invoiceDetails = parsedInvoiceDetails.map((invoiceDetail) => {
      const quantity =
        invoiceDetail.quantity?.toString().length === 0 ? null : invoiceDetail.quantity
      const rate = invoiceDetail.quantity?.toString().length === 0 ? null : invoiceDetail.rate

      return {
        ...invoiceDetail,
        quantity,
        rate,
      }
    })

    await createInvoiceSchema.validate({
      client_id,
      to,
      cc,
      bcc,
      currency_id,
      invoice_date,
      due_date,
      invoice_amount,
      sub_total,
      discount_amount,
      discount_toggle,
      tax_amount,
      tax_type_id,
      tax_toggle,
      payment_account_id,
      payment_term_id,
      invoice_details: invoiceDetails,
      invoice_attachment_ids: JSON.parse(invoice_attachment_ids),
      subject,
      content,
      should_attach_invoice,
    })

    const updatedInvoice = await InvoiceService.update(
      Number(id),
      {
        to,
        cc,
        bcc,
        invoice_date,
        due_date,
        invoice_amount: Number(invoice_amount),
        sub_total: Number(sub_total),
        discount_amount: Number(discount_amount),
        discount_toggle: Boolean(Number(discount_toggle)),
        tax_amount: Number(tax_amount),
        tax_type_id: Number(tax_type_id),
        tax_toggle: Boolean(Number(tax_toggle)),
        payment_account_id: Number(payment_account_id),
        payment_term_id: Number(payment_term_id),
        invoice_details: invoiceDetails,
        invoice_attachment_ids: JSON.parse(invoice_attachment_ids),
        attach_invoice: Boolean(Number(should_attach_invoice)),
      },
      send_invoice_action as SendInvoiceAction
    )

    const country = await CountryService.getById(parseInt(country_id ?? "0"))

    if (updatedInvoice.billing_address_id !== null) {
      await AddressService.update(updatedInvoice.billing_address_id, {
        address1,
        address2,
        city,
        state,
        country: country?.name ?? null,
        postal_code,
      })
    } else {
      if (
        (validatedAddress.address1 !== undefined && validatedAddress.address1.length > 0) ||
        (validatedAddress.address2 !== undefined && validatedAddress.address2.length > 0) ||
        (validatedAddress.city !== undefined && validatedAddress.city.length > 0) ||
        (validatedAddress.state !== undefined && validatedAddress.state.length > 0) ||
        (validatedAddress.country_id !== null && validatedAddress.country_id !== 0) ||
        (validatedAddress.postal_code !== undefined && validatedAddress.postal_code.length > 0)
      ) {
        const address = await AddressService.create({
          address1,
          address2,
          city,
          state,
          country: country?.name ?? null,
          postal_code,
        })

        await InvoiceService.updateBillingAddressById(updatedInvoice.id, address.id)
      }
    }

    await InvoiceService.uploadAttachments(updatedInvoice.id, files)

    if (send_invoice_action === SendInvoiceAction.SEND) {
      await InvoiceService.sendInvoice({
        user,
        id: updatedInvoice.id,
        subject,
        content,
        shouldAttachInvoice: Boolean(Number(should_attach_invoice)),
      })
    }

    res.json(updatedInvoice)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete invoice
 * @param req.params.id - The ID of the invoice to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await InvoiceService.deleteById(parseInt(id))
    res.json({ id, message: "Invoice successfully deleted" })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Upload attachments
 */
export const uploadAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await InvoiceService.uploadAttachments(parseInt(id), req.files as S3File[])
    res.json({ message: "Invoice attachments have been successfully saved" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send
 */
export const send = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const emailTemplate = await EmailTemplateService.getDefaultByTemplateType(
      "Create Invoice Email Template"
    )
    await InvoiceService.sendInvoice({
      user,
      id: parseInt(id),
      subject: emailTemplate.subject ?? "",
      content: emailTemplate.content ?? "",
      shouldAttachInvoice: false,
    })
    res.json({ message: "Invoice sent" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send reminder
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 * @param req.body.should_attach_invoice - Should attach invoice
 */
export const sendReminder = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { to, cc, bcc, subject, content, should_attach_invoice } = req.body

    await InvoiceService.sendInvoice({
      user,
      id: parseInt(id),
      type: SendInvoiceType.Reminder,
      to,
      cc,
      bcc,
      subject,
      content,
      shouldAttachInvoice: Boolean(Number(should_attach_invoice)),
    })

    res.json({ message: "Invoice reminder sent" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update status
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await InvoiceService.updateInvoiceStatusById(Number(id), status)
    res.json({ message: "Invoice status updated" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Duplicate
 */
export const duplicate = async (req: Request, res: Response) => {
  try {
    res.json({ message: "Invoice duplicated" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Download
 */
export const download = async (req: Request, res: Response) => {
  try {
    res.json({ message: "Invoice downloaded" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Cancel
 */
export const cancel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await InvoiceService.cancelInvoice(parseInt(id))
    res.json({ message: "Invoice has been cancelled" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get link
 */
export const getLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const invoiceLink = await InvoiceService.getLink(Number(id))
    res.json(invoiceLink)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific invoice by token.
 * @param req.params.token - Token
 */
export const getInvoiceByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const invoice = await InvoiceService.getInvoiceByToken(token)

    let invoiceAttachments: InvoiceAttachment[] = []

    if (invoice?.invoice_attachments !== undefined) {
      invoiceAttachments = await Promise.all(
        invoice.invoice_attachments.map(async (invoiceAttachment) => {
          return {
            ...invoiceAttachment,
            url: await getFileUrl(
              invoiceAttachment.filename ?? "",
              invoiceAttachment.mime_type ?? ""
            ),
          }
        })
      )
    }

    res.json({
      ...invoice,
      invoice_attachments: invoiceAttachments,
    })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get next invoice_no
 */
export const getNextInvoiceNo = async (req: Request, res: Response) => {
  try {
    const invoiceNo = await InvoiceService.getNextInvoiceNo()
    res.json(invoiceNo)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send test email
 * @param req.params.id - The ID of the invoice to be used
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 * @param req.body.should_attach_invoice - Should attach invoice
 * @param req.body.test_to - To.
 * @param req.body.test_cc - Cc.
 * @param req.body.test_bcc - Bcc.
 */
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params
    const { test_to, test_cc, test_bcc, subject, content, should_attach_invoice } = req.body

    await InvoiceService.sendInvoice({
      user,
      id: parseInt(id),
      to: test_to,
      cc: test_cc,
      bcc: test_bcc,
      subject,
      content,
      shouldAttachInvoice: Boolean(Number(should_attach_invoice)),
      shouldSendTestEmail: true,
    })

    res.json({ message: "Test email sent" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send batch invoice
 * @param req.body.client_id - Client ID.
 * @param req.body.invoice_ids - Invoice IDs.
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 * @param req.body.should_attach_invoice - Should attach invoice
 * @param req.body.should_send_test_email - Should send test email
 */
export const sendBatchInvoice = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const {
      client_id,
      invoice_ids,
      to,
      cc,
      bcc,
      subject,
      content,
      should_attach_invoice,
      should_send_test_email,
    } = req.body

    await InvoiceService.sendBatchInvoice({
      user,
      clientId: Number(client_id),
      invoiceIds: invoice_ids,
      to,
      cc,
      bcc,
      subject,
      content,
      shouldAttachInvoice: Boolean(Number(should_attach_invoice)),
      shouldSendTestEmail: Boolean(Number(should_send_test_email)),
    })

    res.json({ message: "Batch invoice sent" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
