import { type Request, type Response } from "express"
import * as ProjectMemberService from "../../services/project-member-service"
import CustomError from "../../utils/custom-error"
import { ValidationError } from "yup"
import { createProjectMemberSchema } from "../../utils/validation/project-member-schema"
import * as ProjectService from "../../services/project-service"
import { type SkillType } from "../../types/skill-type"
import logger from "../../utils/logger"

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
    logger.error(error)
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
    logger.error(error)
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
 * @param req.body.skill_ids - Skill IDs.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { project_id, user_id, project_role_id, start_date, end_date, allocation_rate, skills } =
      req.body

    await createProjectMemberSchema.validate({
      project_id,
      user_id,
      project_role_id,
      start_date,
      end_date,
      allocation_rate,
    })

    const projectDetails = await ProjectService.getById(parseInt(project_id))

    // Check if the start_date and end_date of project-member are within the range
    if (
      projectDetails.start_date == null ||
      projectDetails.end_date == null ||
      new Date(start_date) < new Date(projectDetails.start_date) ||
      new Date(end_date) > new Date(projectDetails.end_date)
    ) {
      throw new CustomError(
        "Please choose assignment dates within the selected project timeframe.",
        400
      )
    }

    // TODO: check for overlapping dates within the same skill
    const parsedSkills = (skills as SkillType[]).map((skill) => ({
      ...skill,
      start_date: new Date(skill.start_date ?? start_date),
      end_date: new Date(skill.end_date ?? end_date),
    }))

    const newProjectMember = await ProjectMemberService.create(
      {
        project_id: parseInt(project_id),
        user_id: parseInt(user_id),
        project_role_id: parseInt(project_role_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        allocation_rate: parseFloat(allocation_rate),
      },
      parsedSkills
    )

    res.json(newProjectMember)
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
    logger.error(error)
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
 * @param req.body.skill_ids  - Skill IDs.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { project_id, user_id, project_role_id, start_date, end_date, allocation_rate, skills } =
      req.body

    await createProjectMemberSchema.validate({
      project_id,
      user_id,
      project_role_id,
      start_date,
      end_date,
      allocation_rate,
    })
    const projectDetails = await ProjectService.getById(parseInt(project_id))

    if (
      projectDetails.start_date == null ||
      projectDetails.end_date == null ||
      new Date(start_date) < new Date(projectDetails.start_date) ||
      new Date(end_date) > new Date(projectDetails.end_date)
    ) {
      throw new CustomError(
        "Please choose assignment dates within the selected project timeframe.",
        400
      )
    }

    // TODO: check for overlapping dates within the same skill
    const parsedSkills = (skills as SkillType[]).map((skill) => ({
      ...skill,
      start_date: new Date(skill.start_date ?? start_date),
      end_date: new Date(skill.end_date ?? end_date),
    }))

    const updatedProjectMember = await ProjectMemberService.update(
      parseInt(id),
      {
        project_id: parseInt(project_id),
        user_id: parseInt(user_id),
        project_role_id: parseInt(project_role_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        allocation_rate: parseFloat(allocation_rate),
      },
      parsedSkills
    )

    res.json(updatedProjectMember)
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
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
