import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import CustomError from "../../utils/custom-error"
import * as InvoiceActivityService from "../../services/khbooks/invoice-activity-service"

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
    const { token } = req.params
    res.redirect(`${process.env.KHBOOKS_URL}/invoices/${token}/download`)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
