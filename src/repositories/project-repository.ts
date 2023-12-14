import { type Request, type Response } from "express"
import * as ProjectMemberService from "../../services/project-member-service"
import CustomError from "../../utils/custom-error"

/**
 * List project members based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_administration_id, evaluation_result_id, evaluation_template_id } = req.query
    const results = await ProjectMemberService.getProjectMembers(
      parseInt(evaluation_administration_id as string),
      parseInt(evaluation_result_id as string),
      parseInt(evaluation_template_id as string)
    )
    res.json(results)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Search project members based on provided filters.
 * @param req.query.start_date - Filter start_date.
 * @param req.query.end_date - Filter end_date.
 * @param req.query.name - Filter by name.
 * @param req.query.project_name - Filter by project_name.
 * @param req.query.role - Filter by role.
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, name, project_name, role } = req.query
    const results = await ProjectMemberService.getAllByFilters(
      start_date as string,
      end_date as string,
      name as string,
      project_name as string,
      role as string
    )
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
