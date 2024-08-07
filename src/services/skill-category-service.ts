import * as SkillCategoryRepository from "../repositories/skill-category-repository"
import { type SkillCategory } from "../types/skill-category-type"
import CustomError from "../utils/custom-error"
import * as SkilRepository from "../repositories/skill-repository"
import { removeWhitespace } from "../utils/format-string"

export const getAllSkillCategories = async (includes?: string[]) => {
  const include = {}
  if (includes !== undefined) {
    for (const i of includes) {
      Object.assign(include, {
        [i]: true,
      })
    }
  }
  return await SkillCategoryRepository.getAllByFilters(
    {
      status: true,
    },
    include
  )
}

export const getByFilters = async (name: string, status: string) => {
  const statusFilter = status === "all" || status === undefined ? undefined : status === "Active"

  const where = {
    status: statusFilter,
  }

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  const skill_categories = await SkillCategoryRepository.getAllByFilters(where)

  return skill_categories
}

export const create = async (data: SkillCategory) => {
  const skillCategoryName = await SkillCategoryRepository.getByName(removeWhitespace(data.name))
  if (skillCategoryName != null) {
    throw new CustomError("Skill Category name should be unique", 400)
  }
  const findSkillcategory = await SkillCategoryRepository.findSkillCategoryDesc()
  const nextSequenceNo =
    findSkillcategory?.sequence_no !== null && findSkillcategory?.sequence_no !== undefined
      ? findSkillcategory.sequence_no + 1
      : 1
  return await SkillCategoryRepository.create(data, nextSequenceNo)
}

export const updateById = async (id: number, data: SkillCategory) => {
  const skillCategory = await SkillCategoryRepository.getById(id)
  if (skillCategory === null) {
    throw new CustomError("Skill Category not found", 400)
  }

  const skillCategoryName = await SkillCategoryRepository.getByName(removeWhitespace(data.name))

  if (skillCategoryName != null && skillCategory.id !== skillCategoryName.id) {
    throw new CustomError("Skill Category name should be unique", 400)
  }
  return await SkillCategoryRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  const skillCategory = await SkillCategoryRepository.getById(id)
  const skillCategoryInUsed = await SkilRepository.getByFilters({
    skill_category_id: id,
  })
  if (skillCategoryInUsed != null) {
    throw new CustomError("Skill category is currenly used. You are not allowed to delete.", 400)
  }
  if (skillCategory === null) {
    throw new CustomError("Skill Category not found", 400)
  }
  await SkillCategoryRepository.deleteById(skillCategory.id)

  const remainingSkillCategories = await SkillCategoryRepository.getAllByFilters({})
  for (const category of remainingSkillCategories) {
    if (category.sequence_no !== null && category.sequence_no !== undefined) {
      const newData = {
        sequence_no: remainingSkillCategories.indexOf(category) + 1,
      }
      await SkillCategoryRepository.updateById(category.id, newData)
    }
  }
}

export const getById = async (id: number) => {
  const skillCategory = await SkillCategoryRepository.getById(id)
  if (skillCategory === null) {
    throw new CustomError("Skill Category not found", 400)
  }
  return await SkillCategoryRepository.show(id)
}

export const nextSequenceNo = async (data: SkillCategory) => {
  return data?.sequence_no !== null && data?.sequence_no !== undefined ? data.sequence_no + 1 : 1
}

export const updateSequenceNo = async (skillCategories: SkillCategory[]) => {
  for (const category of skillCategories) {
    const skillCategory = await SkillCategoryRepository.getById(category.id ?? 0)
    if (skillCategory === null) {
      throw new CustomError("Skill Category not found.", 400)
    }

    if (category.sequence_no === null || category.sequence_no === undefined) {
      throw new CustomError("Invalid sequence number.", 400)
    }
    await SkillCategoryRepository.updateSequenceNo(skillCategory.id, category.sequence_no)
  }
}
