import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import CustomError from "../../utils/custom-error"
import * as InvoiceActivityService from "../../services/khbooks/invoice-activity-service"
import * as InvoiceService from "../../services/khbooks/invoice-service"
import { InvoiceStatus } from "../../types/invoice-type"
import { InvoiceActivityAction } from "../../types/invoice-activity-type"

/**
 * List invoice activities based on provided filters.
 * @param req.query.invoice_id - Invoice id.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { invoice_id, page } = req.query
    const results = await InvoiceActivityService.getAllByFilters(
      parseInt(invoice_id as string),
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/*
 * NOTE: This is for capturing invoice clicks from an email
 */
export const captureAndShow = async (req: Request, res: Response) => {
  try {
    // NOTE: When a user clicks a link from an email, this API will be called twice.
    // It's unclear whether this behavior is caused by Gmail, SendGrid, or Cloudflare.
    // For now, we will accept requests where the sec-fetch-site is cross-site.
    if (req.headers["sec-fetch-site"] !== "cross-site") {
      throw new CustomError("Invalid request origin", 400)
    }

    const { token } = req.params
    const invoice = await InvoiceService.getInvoiceByToken(token)
    if (invoice !== null) {
      await InvoiceActivityService.create({
        action: InvoiceActivityAction.VIEWED,
        description: "",
        invoice_id: invoice.id,
      })

      if (invoice.invoice_status === InvoiceStatus.BILLED) {
        await InvoiceService.updateInvoiceStatusById(invoice.id, InvoiceStatus.VIEWED)
      }
    }

    res.redirect(`${process.env.KHBOOKS_URL}/invoices/${token}/download`)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
