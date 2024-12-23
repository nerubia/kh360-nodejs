import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as PaymentService from "../../services/khbooks/payment-service"
import * as EmailTemplateService from "../../services/email-template-service"
import { createPaymentSchema } from "../../utils/validation/payment-schema"
import { type S3File } from "../../types/s3-file-type"
import { SendPaymentAction } from "../../types/payment-type"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"
import { type PaymentAttachment } from "../../types/payment-attachment-type"
import { getFileUrl } from "../../utils/s3"

/**
 * List payments based on provided filters.
 * @param req.query.payment_date - Filter by payment date.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.invoice_no - Filter by invoice no.
 * @param req.query.payment_no - Filter by payment no.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { payment_date, client_id, invoice_no, payment_no, status, page } = req.query
    const results = await PaymentService.getAllByFilters(
      payment_date as string,
      parseInt(client_id as string),
      invoice_no as string,
      payment_no as string,
      status as string,
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new payment.
 * @param req.body.client_id - Client id.
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.currency_id - Currency id.
 * @param req.body.payment_date - Payment date.
 * @param req.body.or_no - OR number.
 * @param req.body.payment_reference_no - Payment reference number.
 * @param req.body.payment_amount - Payment amount.
 * @param req.body.payment_amount_php - Payment amount in PHP.
 * @param req.body.payment_status - Payment status.
 * @param req.body.payment_details - Payment details.
 * @param req.body.remarks - Remarks.
 * @param req.body.send_payment_action - Send payment action.
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
      payment_date,
      payment_reference_no,
      or_no,
      payment_amount,
      payment_amount_php,
      payment_status,
      remarks,
      payment_details,
      send_payment_action,
    } = req.body

    const files = req.files as S3File[]

    await createPaymentSchema.validate({
      client_id,
      to,
      cc,
      bcc,
      currency_id,
      payment_date,
      payment_reference_no,
      or_no,
      payment_amount,
      payment_amount_php,
      payment_status,
      payment_details: JSON.parse(payment_details),
      remarks,
    })

    const newPayment = await PaymentService.create(
      {
        client_id: parseInt(client_id as string),
        to,
        cc,
        bcc,
        currency_id: parseInt(currency_id as string),
        payment_date: payment_date as string,
        payment_details: JSON.parse(payment_details),
        payment_reference_no: payment_reference_no as string,
        or_no: or_no as string,
        payment_amount: parseFloat(payment_amount as string),
        payment_amount_php: parseFloat(payment_amount_php as string),
        payment_status: payment_status as string,
      },
      send_payment_action as SendPaymentAction
    )

    await PaymentService.uploadAttachments(newPayment.id, files)

    if (send_payment_action === SendPaymentAction.SEND) {
      const emailTemplate = await EmailTemplateService.getDefaultByTemplateType(
        "Create Payment Email Template"
      )
      await PaymentService.sendPayment({
        user,
        id: newPayment.id,
        subject: emailTemplate.subject ?? "",
        content: emailTemplate.content ?? "",
      })
    }

    res.json(newPayment)
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
 * Get a specific payment by ID.
 * @param req.params.id - Invoice id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const payment = await PaymentService.show(parseInt(id))

    let paymentAttachments: PaymentAttachment[] = []

    if (payment.payment_attachments !== undefined) {
      paymentAttachments = await Promise.all(
        payment.payment_attachments.map(async (paymentAttachment) => {
          return {
            ...paymentAttachment,
            url: await getFileUrl(
              paymentAttachment.filename ?? "",
              paymentAttachment.mime_type ?? ""
            ),
          }
        })
      )
    }

    res.json({
      ...payment,
      payment_attachments: paymentAttachments,
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing invoice.
 * @param req.body.client_id - Client id.
 * @param req.body.to - To.
 * @param req.body.cc - Cc.
 * @param req.body.bcc - Bcc.
 * @param req.body.currency_id - Currency id.
 * @param req.body.payment_date - Payment date.
 * @param req.body.or_no - OR number.
 * @param req.body.payment_reference_no - Payment reference number.
 * @param req.body.payment_amount - Payment amount.
 * @param req.body.payment_amount_php - Payment amount in PHP.
 * @param req.body.payment_status - Payment status.
 * @param req.body.payment_details - Payment details.
 * @param req.body.remarks - Remarks.
 * @param req.body.send_payment_action - Send payment action.
 * @param req.body.payment_attachment_ids - Payment attachment ids.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params

    const {
      to,
      cc,
      bcc,
      client_id,
      currency_id,
      payment_date,
      payment_reference_no,
      or_no,
      payment_amount,
      payment_amount_php,
      payment_status,
      remarks,
      payment_details,
      send_payment_action,
      payment_attachment_ids,
    } = req.body

    const files = req.files as S3File[]

    await createPaymentSchema.validate({
      to,
      cc,
      bcc,
      client_id,
      currency_id,
      payment_date,
      payment_reference_no,
      or_no,
      payment_amount,
      payment_amount_php,
      payment_status,
      payment_details: JSON.parse(payment_details),
      remarks,
      payment_attachment_ids: JSON.parse(payment_attachment_ids),
    })

    const updatedPayment = await PaymentService.update(
      Number(id),
      {
        to,
        cc,
        bcc,
        currency_id: parseInt(currency_id as string),
        payment_date: payment_date as string,
        payment_details: JSON.parse(payment_details),
        payment_reference_no: payment_reference_no as string,
        or_no: or_no as string,
        payment_amount: parseFloat(payment_amount as string),
        payment_amount_php: parseFloat(payment_amount_php as string),
        payment_status: payment_status as string,
        payment_attachment_ids: JSON.parse(payment_attachment_ids),
      },
      send_payment_action as SendPaymentAction
    )

    await PaymentService.uploadAttachments(updatedPayment.id, files)

    if (send_payment_action === SendPaymentAction.SEND) {
      const emailTemplate = await EmailTemplateService.getDefaultByTemplateType(
        "Create Payment Email Template"
      )
      await PaymentService.sendPayment({
        user,
        id: updatedPayment.id,
        subject: emailTemplate.subject ?? "",
        content: emailTemplate.content ?? "",
      })
    }

    res.json(updatedPayment)
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
 * Delete payment
 * @param req.params.id - The ID of the payment to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await PaymentService.deleteById(parseInt(id))
    res.json({ id, message: "Payment successfully deleted" })
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
 * Cancel
 */
export const cancel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await PaymentService.cancel(parseInt(id))
    res.json({ message: "Payment has been cancelled" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
