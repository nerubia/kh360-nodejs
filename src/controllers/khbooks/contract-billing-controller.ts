import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as ContractBillingService from "../../services/khbooks/contract-billing-service"

/**
 * List contract billings based on provided filters.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.start_date - Filter by start_date.
 * @param req.query.end_date - Filter by end_date.
 * @param req.query.contract_no - Filter by contract_no.
 * @param req.query.project_id - Filter by project_id.
 * @param req.query.description - Filter by description.
 * @param req.query.status - Filter by status.
 * @param req.query.active_contract - Filter by active contract.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      start_date,
      end_date,
      contract_no,
      project_id,
      description,
      status,
      active_contract,
      page,
    } = req.query
    const results = await ContractBillingService.getAllByFilters(
      parseInt(client_id as string),
      start_date as string,
      end_date as string,
      contract_no as string,
      parseInt(project_id as string),
      description as string,
      status as string,
      Boolean(active_contract),
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
