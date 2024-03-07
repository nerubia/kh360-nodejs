import { type Request, type Response } from "express"
import * as SkillCategoryService from "../../services/skill-category-service"
import { createSkillCategorySchema } from "../../utils/validation/skill-category-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List skill categories based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status } = req.query

    const skill_categories = await SkillCategoryService.getByFilters(
      name as string,
      status as string,
    )

    res.json(skill_categories)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List all skill categories
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const skill_categories = await SkillCategoryService.getAllSkillCategories()
    res.json(skill_categories)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
/**
 * Show details of a single skill category
 * @param req.params.id - The ID of the skill category to retrive
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const skillCategory = await SkillCategoryService.getById(parseInt(id))
    res.json(skillCategory)
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
 * Store new skill category
 * @param req.body.name - The name of the skill category
 * @param req.body.description - The description of the skill category
 * @param req.body.status - The status of the skill category
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body
    await createSkillCategorySchema.validate({ name, description, status })
    const newSkillCategory = await SkillCategoryService.create({
      name,
      description,
      status,
    })
    res.json(newSkillCategory)
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
 * Update skill category
 * @param req.body.name - The name of the skill category
 * @param req.body.description - The description of the skill category
 * @param req.body.status - The status of the skill category
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, status } = req.body
    await createSkillCategorySchema.validate({ name, description, status })
    const updateSkillCategory = await SkillCategoryService.updatedById(parseInt(id), {
      name,
      description,
      status,
    })
    res.json(updateSkillCategory)
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
 * Delete skill category
 * @param req.params.id - The ID of the skill category to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SkillCategoryService.deletedById(parseInt(id))

    res.json({ id, message: "Skill category successfully deleted" })
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
