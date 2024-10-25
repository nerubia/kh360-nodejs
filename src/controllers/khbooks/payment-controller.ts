import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as PaymentService from "../../services/khbooks/payment-service"

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
