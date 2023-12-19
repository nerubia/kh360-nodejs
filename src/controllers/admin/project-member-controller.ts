import { type Request, type Response } from "express"
import * as ProjectMemberService from "../../services/project-member-service"
import CustomError from "../../utils/custom-error"
import { ValidationError } from "yup"
import { createProjectMemberSchema } from "../../utils/validation/project-member-schema"

/**
 * Search project members based on provided filters.
 * @param req.query.start_date - Filter start_date.
 * @param req.query.end_date - Filter end_date.
 * @param req.query.name - Filter by name.
 * @param req.query.project_name - Filter by project_name.
 * @param req.query.role - Filter by role.
 * @param req.query.user_id - Filter by user id.
 * @param req.query.overlap - Overlap.
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, name, project_name, role, user_id, overlap } = req.query

    const results = await ProjectMemberService.getAllByFilters(
      start_date as string,
      end_date as string,
      name as string,
      project_name as string,
      role as string,
      parseInt(user_id as string),
      Boolean(parseInt(overlap as string))
    )
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

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
 * Store a new project member.
 * @param req.body.project_id - Project id.
 * @param req.body.user_id - User id.
 * @param req.body.project_role_id - Project role id.
 * @param req.body.start_date - Start date.
 * @param req.body.end_date - End date.
 * @param req.body.allocation_rate - Allocation rate.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { project_id, user_id, project_role_id, start_date, end_date, allocation_rate } = req.body

    await createProjectMemberSchema.validate({
      project_id,
      user_id,
      project_role_id,
      start_date,
      end_date,
      allocation_rate,
    })

    const newProjectMember = await ProjectMemberService.create({
      project_id: parseInt(project_id),
      user_id: parseInt(user_id),
      project_role_id: parseInt(project_role_id),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      allocation_rate: parseFloat(allocation_rate),
    })

    res.json(newProjectMember)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific project member by ID.
 * @param req.params.id - The unique ID of the project member.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const projectMember = await ProjectMemberService.getById(parseInt(id))
    res.json(projectMember)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing project member by ID.
 * @param req.params.id - The unique ID of the project member.
 * @param req.body.project_id - Project id.
 * @param req.body.user_id - User id.
 * @param req.body.project_role_id - Project role id.
 * @param req.body.start_date - Start date.
 * @param req.body.end_date - End date.
 * @param req.body.allocation_rate - Allocation rate.
 * @param req.body.remarks - Remarks.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { project_id, user_id, project_role_id, start_date, end_date, allocation_rate } = req.body

    await createProjectMemberSchema.validate({
      project_id,
      user_id,
      project_role_id,
      start_date,
      end_date,
      allocation_rate,
    })

    const updatedProjectMember = await ProjectMemberService.update(parseInt(id), {
      project_id: parseInt(project_id),
      user_id: parseInt(user_id),
      project_role_id: parseInt(project_role_id),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      allocation_rate: parseFloat(allocation_rate),
    })

    res.json(updatedProjectMember)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific project member by ID.
 * @param req.params.id - The unique ID of the project member.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await ProjectMemberService.deleteById(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
