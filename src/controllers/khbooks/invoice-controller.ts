import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as InvoiceService from "../../services/khbooks/invoice-service"
import * as AddressService from "../../services/khbooks/address-service"
import * as CountryService from "../../services/khbooks/country-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"
import { createInvoiceSchema } from "../../utils/validation/invoice-schema"
import { createAddressSchema } from "../../utils/validation/address-schema"

/**
 * List invoices based on provided filters.
 * @param req.query.invoice_date - Filter by invoice date.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.status - Filter by status.
 * @param req.query.due_date - Filter by due_date.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { invoice_date, client_id, status, due_date, page } = req.query
    const results = await InvoiceService.getAllByFilters(
      invoice_date as string,
      parseInt(client_id as string),
      status as string,
      due_date as string,
      page as string
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
 * @param req.body.tax_type_id - Tax type id.
 * @param req.body.payment_term_id - Payment term id.
 * @param req.body.address1 - Address 1.
 * @param req.body.address2 - Address 2.
 * @param req.body.city - City.
 * @param req.body.state - State.
 * @param req.body.country_id - Country id.
 * @param req.body.postal_code - Postal code.
 * @param req.body.invoice_details - Invoice details.
 * @param req.body.send_invoice - Send invoice.
 */

// TODO: ???
//
// account_name
// account_type
// account_no
// bank_name
// bank_branch
// swift_code

export const store = async (req: Request, res: Response) => {
  try {
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
      tax_type_id,
      payment_term_id,
      invoice_details,
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
      send_invoice,
    } = req.body

    await createAddressSchema.validate({
      address1,
      address2,
      city,
      state,
      country_id,
      postal_code,
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
      tax_type_id,
      payment_term_id,
      invoice_details,
    })

    const country = await CountryService.getById(country_id)

    const address = await AddressService.create({
      address1,
      address2,
      city,
      state,
      country: country?.name ?? null,
      postal_code,
    })

    const newInvoice = await InvoiceService.create({
      client_id: parseInt(client_id as string),
      to,
      cc,
      bcc,
      currency_id: parseInt(currency_id as string),
      invoice_date,
      due_date,
      invoice_amount: parseFloat(invoice_amount as string),
      sub_total: parseFloat(sub_total as string),
      tax_type_id: parseInt(tax_type_id as string),
      payment_term_id: parseInt(payment_term_id as string),
      billing_address_id: address.id,
      invoice_details,
    })

    const shouldSendInvoice = Boolean(send_invoice)
    if (shouldSendInvoice) {
      await InvoiceService.sendInvoice(newInvoice.id)
    }

    res.json(newInvoice)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send invoice
 */
export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await InvoiceService.sendInvoice(parseInt(id))
    res.json({ message: "Invoice sent" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
