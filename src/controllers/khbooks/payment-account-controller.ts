import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as PaymentAccountService from "../../services/khbooks/payment-account-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List payment accounts based on provided filters.
 * @param req.query.payment_account_name - Filter by payment account name.
 * @param req.query.payment_network - Filter by payment network.
 * @param req.query.account_name - Filter by account name.
 * @param req.query.account_no - Filter by account no.
 * @param req.query.bank_name - Filter by bank name.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { payment_account_name, payment_network, account_name, account_no, bank_name, page } =
      req.query
    const results = await PaymentAccountService.getAllByFilters({
      payment_account_name: payment_account_name as string,
      payment_network: payment_network as string,
      account_name: account_name as string,
      account_no: account_no as string,
      bank_name: bank_name as string,
      page: page as string,
    })
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
