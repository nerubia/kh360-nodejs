import { type Request, type Response } from "express"
import { ValidationError } from "yup"
import * as SkillMapResultService from "../../services/skill-map-result-service"
import CustomError from "../../utils/custom-error"
import { SkillMapResultStatus } from "../../types/skill-map-result-type"

/**
 * List skill map results based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const latest = async (req: Request, res: Response) => {
  try {
    const { name, status, page } = req.query

    const skillMapResults = await SkillMapResultService.getLatestSkillMapRating(
      name as string,
      status as string,
      page as string
    )

    res.json(skillMapResults)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List all skill map results based on provided filters.
 * @param req.query.skill_map_administration_id - Filter by skill map administration id.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const { skill_map_administration_id } = req.query

    const skillMapResults = await SkillMapResultService.getAllBySkillMapAdminId(
      parseInt(skill_map_administration_id as string)
    )

    res.json(skillMapResults)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Create new Skill Map result
 * @param req.body.skill_map_administration_id - Skill Map administration id.
 * @param req.body.employee_ids - Employee IDs.
 * @returns
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { skill_map_administration_id, employee_ids } = req.body

    const newSkillMapResults = await SkillMapResultService.create(
      parseInt(skill_map_administration_id as string),
      employee_ids as number[],
      user
    )

    res.json(newSkillMapResults)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete skill map result
 * @param req.params.id -The ID of the skill map result to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const deletedIds = await SkillMapResultService.deleteById(parseInt(id))

    res.json({ deletedIds, message: "Skill map result successfully deleted" })
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
 * Send reminder for respondent by ID.
 * @param req.params.id - The unique ID of the skill map administration.
 * @param req.body.user_id - Respondent id
 */
export const sendReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { user_id } = req.body

    const emailLog = await SkillMapResultService.sendReminderByRespondent(
      parseInt(id),
      parseInt(user_id as string)
    )
    res.json({ respondentId: user_id, emailLog })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific skill map result by ID.
 * @param req.params.id - The unique ID of the skill map result.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillMapResultService.reopen(parseInt(id))
    res.json({ id, status: SkillMapResultStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const filterSkillMapResult = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { name, skill_map_administration_id, skill, status, page } = req.query
    const skillMapResult = await SkillMapResultService.getByCustomFilters(
      user,
      skill_map_administration_id as string,
      skill as string,
      status as string,
      name as unknown as string,
      page as string
    )
    res.json(skillMapResult)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
