import { ValidationError } from "yup"
import { type Request, type Response } from "express"
import * as SkillMapAdministrationService from "../../services/skill-map-administration-service"
import CustomError from "../../utils/custom-error"
import {
  createSkillMapAdministrationSchema,
  uploadSkillMapAdministrationSchema,
} from "../../utils/validation/skill-map-administration-schema"
import { SkillMapAdministrationStatus } from "../../types/skill-map-administration-type"
import logger from "../../utils/logger"

/**
 *List skill map administrations
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status, page } = req.query
    const skillMap = await SkillMapAdministrationService.getAllByFilters(
      name as string,
      status as string,
      page as string
    )
    res.json(skillMap)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific skill map administration by ID.
 * @param req.params.id - The unique ID of the skill map administration
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const skillMap = await SkillMapAdministrationService.getById(parseInt(id))
    res.json(skillMap)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new skill map administration.
 * @param req.body.name - Name.
 * @param req.body.skill_map_period_start_date - Skill map period start date.
 * @param req.body.skill_map_period_end_date - Skill map period end date.
 * @param req.body.skill_map_schedule_start_date - Skill map schedule start date.
 * @param req.body.skill_map_schedule_end_date - Skill map schedule end date.
 * @param req.body.remarks - Remarks.
 * @param req.body.email_subject - Email subject.
 * @param req.body.email_content - Email content.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    } = req.body

    await createSkillMapAdministrationSchema.validate({
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    })

    const newSkillMap = await SkillMapAdministrationService.create({
      name,
      skill_map_period_start_date: new Date(skill_map_period_start_date),
      skill_map_period_end_date: new Date(skill_map_period_end_date),
      skill_map_schedule_start_date: new Date(skill_map_schedule_start_date),
      skill_map_schedule_end_date: new Date(skill_map_schedule_end_date),
      remarks,
      email_subject,
      email_content,
      status: SkillMapAdministrationStatus.Draft,
    })

    res.json(newSkillMap)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Upload a new skill map administration.
 * @param req.body.name - Name.
 * @param req.body.skill_map_period_start_date - Skill map period start date.
 * @param req.body.skill_map_period_end_date - Skill map period end date.
 * @param req.body.skill_map_schedule_start_date - Skill map schedule start date.
 * @param req.body.skill_map_schedule_end_date - Skill map schedule end date.
 * @param req.body.remarks - Remarks.
 * @param req.body.file - File.
 */
export const upload = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const {
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      file,
    } = req.body

    await uploadSkillMapAdministrationSchema.validate({
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      file,
    })

    const newSkillMap = await SkillMapAdministrationService.upload(
      user,
      {
        name,
        skill_map_period_start_date: new Date(skill_map_period_start_date),
        skill_map_period_end_date: new Date(skill_map_period_end_date),
        skill_map_schedule_start_date: new Date(skill_map_schedule_start_date),
        skill_map_schedule_end_date: new Date(skill_map_schedule_end_date),
        remarks,
        status: SkillMapAdministrationStatus.Closed,
      },
      file
    )

    res.json(newSkillMap)
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
 * Update an existing skill map administration by ID
 * @param req.body.name - Name.
 * @param req.body.skill_map_period_start_date - Skill map period start date.
 * @param req.body.skill_map_period_end_date - Skill map period end date.
 * @param req.body.skill_map_schedule_start_date - Skill map schedule start date.
 * @param req.body.skill_map_schedule_end_date - Skill map schedule end date.
 * @param req.body.remarks - Remarks.
 * @param req.body.email_subject - Email subject.
 * @param req.body.email_content - Email content.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      email_subject,
      email_content,
      status,
    } = req.body
    await createSkillMapAdministrationSchema.validate({
      name,
      skill_map_period_start_date,
      skill_map_period_end_date,
      skill_map_schedule_start_date,
      skill_map_schedule_end_date,
      remarks,
      email_subject,
      email_content,
      status,
    })
    const updateSkillMap = await SkillMapAdministrationService.updateById(parseInt(id), {
      name: name as string,
      skill_map_period_start_date: new Date(skill_map_period_start_date),
      skill_map_period_end_date: new Date(skill_map_period_end_date),
      skill_map_schedule_start_date: new Date(skill_map_schedule_start_date),
      skill_map_schedule_end_date: new Date(skill_map_schedule_end_date),
      remarks: remarks as string,
      email_subject: email_subject as string,
      email_content: email_content as string,
      status,
    })
    res.json(updateSkillMap)
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
 * Delete a specific skill map administration by ID.
 * @param req.params.id - The unique ID of the skill map administration.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const skillMap = await SkillMapAdministrationService.getById(parseInt(id))
    if (skillMap === null) {
      return res.status(400).json({ message: "Invalid id" })
    }
    await SkillMapAdministrationService.deleteById(parseInt(id))
    res.json({ id, message: "Skill Map deleted Successfully" })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Close a specific skill map administration by ID.
 * @param req.params.id - The unique ID of the skill map administration.
 */
export const close = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillMapAdministrationService.close(parseInt(id))
    res.json({ id, status: SkillMapAdministrationStatus.Closed })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Cancel a specific skill map administration by ID.
 * @param req.params.id - The unique ID of the skill map administration.
 */
export const cancel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillMapAdministrationService.cancel(parseInt(id))
    res.json({ id, status: SkillMapAdministrationStatus.Cancelled })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific skill map administration by ID.
 * @param req.params.id - The unique ID of the skill map administration.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillMapAdministrationService.reopen(parseInt(id))
    res.json({ id, status: SkillMapAdministrationStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
