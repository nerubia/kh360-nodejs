import * as SkillRepository from "../repositories/skill-repository"
import * as ProjectSkillRepository from "../repositories/project-skill-repository"
import * as ProjectMemberSkillRepository from "../repositories/project-member-skill-repository"

import { type SkillType } from "../types/skill-type"
import CustomError from "../utils/custom-error"

export const getAllByFilters = async (
  name: string,
  skill_category_id: string,
  status: string,
  page: string,
  items: string
) => {
  const parsedItems = parseInt(items)
  const itemsPerPage = isNaN(parsedItems) ? 40 : 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const statusFilter = status === "all" || status === undefined ? undefined : status === "Active"

  const where = { status: statusFilter }

  if (skill_category_id !== undefined && skill_category_id !== "all") {
    Object.assign(where, {
      skill_category_id: parseInt(skill_category_id),
    })
  }

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  const totalItems = await SkillRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const skills = await SkillRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: skills,
    pageInfo,
  }
}

export const getById = async (id: number) => {
  const skill = await SkillRepository.getById(id)
  if (skill === null) {
    throw new CustomError("Skill not found", 400)
  }
  return await SkillRepository.getById(id)
}

export const create = async (data: SkillType) => {
  const skill = await SkillRepository.getByName(data.name)
  if (skill != null) {
    throw new CustomError("Skill name should be unique", 400)
  }
  const findSkill = await SkillRepository.findSkillDesc()
  const nextSequenceNo =
    findSkill?.sequence_no !== null && findSkill?.sequence_no !== undefined
      ? findSkill.sequence_no + 1
      : 1
  return await SkillRepository.create(data, nextSequenceNo)
}

export const updateById = async (id: number, data: SkillType) => {
  const skill = await SkillRepository.getById(id)

  if (skill === null) {
    throw new CustomError("Skill not found", 400)
  }

  const skillName = await SkillRepository.getByName(data.name)

  if (skillName != null && skillName.id !== skill.id) {
    throw new CustomError("Skill name should be unique", 400)
  }
  return await SkillRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  const skill = await SkillRepository.getById(id)
  if (skill === null) {
    throw new CustomError("Skill not found", 400)
  }
  const existingProjectSkillCount = await ProjectSkillRepository.countByFilters({
    skill_id: skill.id,
  })
  const existingProjectMemberSkillsCount = await ProjectMemberSkillRepository.countByFilters({
    skill_id: skill.id,
  })
  if (existingProjectSkillCount > 0 || existingProjectMemberSkillsCount > 0) {
    throw new CustomError("Skill is currently being used. You are not allowed to delete.", 400)
  }
  await SkillRepository.deleteById(id, skill.id)
  const remainingSkills = await SkillRepository.getAllSkills({})

  for (const skill of remainingSkills) {
    if (skill.sequence_no !== null && skill.sequence_no !== undefined) {
      const newSkill = {
        sequence_no: remainingSkills.indexOf(skill) + 1,
      }
      await SkillRepository.updateById(skill.id, newSkill)
    }
  }
}
