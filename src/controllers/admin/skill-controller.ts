import { type Request, type Response } from "express"
import * as SkillService from "../../services/skill-service"
import { createSkillSchema } from "../../utils/validation/skill-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List skills based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.skill_category_id - Filter by skill_category_id.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 * @param req.query.items - Items per page.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, skill_category_id, status, page, items } = req.query

    const skills = await SkillService.getAllByFilters(
      name as string,
      skill_category_id as string,
      status as string,
      page as string,
      items as string
    )

    res.json(skills)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
/**
 * @param req.params.id
 * @param res - show a single skill
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const skill = await SkillService.getById(parseInt(id))
    return res.json(skill)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store new Skill
 * @param req.body.name
 * @param req.body.description
 * @param req.body.skill_category_id
 * @param req.body.status
 * @param res - return the new created skill
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { name, skill_category_id, description, status } = req.body

    await createSkillSchema.validate({
      name: name as string,
      description: description as string,
      status: status as boolean,
      skill_category_id: parseInt(skill_category_id),
    })

    const newSkill = await SkillService.create({
      name: name as string,
      description: description as string,
      status: status as boolean,
      skill_category_id: parseInt(skill_category_id),
    })
    return res.json(newSkill)
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
 * @param req.body.name
 * @param req.body.description
 * @param req.body.status
 * @param req.body.skill_category_id
 * @param res - return the new updated skill
 * @returns
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, status, skill_category_id } = req.body

    await createSkillSchema.validate({
      name: name as string,
      description: description as string,
      status: status as boolean,
      skill_category_id: parseInt(skill_category_id),
    })

    const updateSkill = await SkillService.updateById(parseInt(id), {
      name: name as string,
      description: description as string,
      status: status as boolean,
      skill_category_id: parseInt(skill_category_id),
    })

    res.json(updateSkill)
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
 * Delete skill
 * @param req.params.id -The ID of the skill to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillService.deleteById(parseInt(id))
    res.json({ id, message: "Skill successfully deleted" })
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
