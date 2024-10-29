import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as PaymentAccountService from "../../services/khbooks/payment-account-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List payment accounts based on provided filters.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { page } = req.query
    const results = await PaymentAccountService.getAllByFilters(page as string)
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific payment account by ID.
 * @param req.params.id - Payment account id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const paymentAccount = await PaymentAccountService.getById(parseInt(id))
    res.json(paymentAccount)
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
 * Delete payment account
 * @param req.params.id - The ID of the payment account to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await PaymentAccountService.deleteById(parseInt(id))
    res.json({ id, message: "Payment account successfully deleted" })
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
