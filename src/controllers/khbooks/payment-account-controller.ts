import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as PaymentAccountService from "../../services/khbooks/payment-account-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"
import { createPaymentAccountSchema } from "../../utils/validation/payment-account-schema"
import { type PaymentAccount } from "../../types/payment-account-type"

/**
 * List payment accounts based on provided filters.
 * @param req.query.payment_account_name - Filter by payment account name.
 * @param req.query.payment_network_id - Filter by payment network id.
 * @param req.query.account_name - Filter by account name.
 * @param req.query.account_no - Filter by account no.
 * @param req.query.bank_name - Filter by bank name.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { payment_account_name, payment_network_id, account_name, account_no, bank_name, page } =
      req.query
    const results = await PaymentAccountService.getAllByFilters({
      payment_account_name: payment_account_name as string,
      payment_network_id: Number(payment_network_id),
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
 * Store a new payment account.
 * @param req.body.name - Name.
 * @param req.body.currency_id - Currency ID.
 * @param req.body.payment_network - Payment network.
 * @param req.body.account_name - Account name.
 * @param req.body.account_type - Account type.
 * @param req.body.account_no - Account number.
 * @param req.body.bank_name - Bank name.
 * @param req.body.bank_branch - Bank branch.
 * @param req.body.bank_code - Bank code.
 * @param req.body.swift_code - SWIFT code.
 * @param req.body.address1 - Address line 1.
 * @param req.body.address2 - Address line 2.
 * @param req.body.city - City.
 * @param req.body.state - State.
 * @param req.body.country_id - Country ID.
 * @param req.body.postal_code - Postal code.
 */

export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      payment_network_id,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    } = req.body

    await createPaymentAccountSchema.validate({
      name,
      payment_network_id,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    })

    const paymentAccount: PaymentAccount = {
      name,
      payment_network_id:
        payment_network_id !== null ? parseInt(payment_network_id as string) : null,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id: country_id !== null ? parseInt(country_id as string) : null,
      postal_code,
    }

    const newPaymentAccount = await PaymentAccountService.create(paymentAccount)

    res.json(newPaymentAccount)
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
 * Update an existing payment account.
 * @param req.body.name - Name.
 * @param req.body.currency_id - Currency ID.
 * @param req.body.payment_network - Payment network.
 * @param req.body.account_name - Account name.
 * @param req.body.account_type - Account type.
 * @param req.body.account_no - Account number.
 * @param req.body.bank_name - Bank name.
 * @param req.body.bank_branch - Bank branch.
 * @param req.body.bank_code - Bank code.
 * @param req.body.swift_code - SWIFT code.
 * @param req.body.address1 - Address line 1.
 * @param req.body.address2 - Address line 2.
 * @param req.body.city - City.
 * @param req.body.state - State.
 * @param req.body.country_id - Country ID.
 * @param req.body.postal_code - Postal code.
 */

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      payment_network_id,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    } = req.body

    await createPaymentAccountSchema.validate({
      name,
      payment_network_id,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
    })

    const paymentAccount: PaymentAccount = {
      name,
      payment_network_id:
        payment_network_id !== null ? parseInt(payment_network_id as string) : null,
      account_name,
      account_type,
      account_no,
      bank_name,
      bank_branch,
      bank_code,
      swift_code,
      address1,
      address2,
      city,
      state,
      country_id: country_id !== null ? parseInt(country_id as string) : null,
      postal_code,
    }

    const updatedPaymentAccount = await PaymentAccountService.updateById(
      parseInt(id),
      paymentAccount
    )

    res.json(updatedPaymentAccount)
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
