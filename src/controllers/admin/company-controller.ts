import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import { ValidationError } from "yup"
import * as CompanyService from "../../services/company-service"
import CustomError from "../../utils/custom-error"

/**
 * Get a specific company by ID.
 * @param req.params.id - Company id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const company = await CompanyService.getById(parseInt(id))
    res.json(company)
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
