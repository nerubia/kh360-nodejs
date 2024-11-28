import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ProjectMemberSkillRepository from "../repositories/project-member-skill-repository"
import * as ProjectSkillRepository from "../repositories/project-skill-repository"
import CustomError from "../utils/custom-error"
import { type ProjectMember } from "../types/project-member-type"
import { type SkillType } from "../types/skill-type"
import { constructNameFilter } from "../utils/format-filter"

export const getProjectMembers = async (
  evaluation_administration_id: number,
  evaluation_result_id: number,
  evaluation_template_id: number
) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluation_administration_id
  )

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(evaluation_result_id)

  if (evaluationResult === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(evaluation_template_id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const existingEvaluation = await EvaluationRepository.getByFilters({
    evaluation_administration_id: evaluationAdministration.id,
    evaluation_result_id: evaluationResult.id,
    evaluation_template_id: evaluationTemplate.id,
  })

  const projectMembers = await ProjectMemberRepository.getAllByFilters({
    user_id: evaluationResult.user_id,
    OR: [
      {
        start_date: {
          gte: evaluationAdministration.eval_period_start_date ?? new Date(),
          lte: evaluationAdministration.eval_period_end_date ?? new Date(),
        },
      },
      {
        end_date: {
          gte: evaluationAdministration.eval_period_start_date ?? new Date(),
          lte: evaluationAdministration.eval_period_end_date ?? new Date(),
        },
      },
      {
        start_date: { lte: evaluationAdministration.eval_period_start_date ?? new Date() },
        end_date: { gte: evaluationAdministration.eval_period_end_date ?? new Date() },
      },
      {
        start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
        end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
      },
    ],
  })

  const finalProjects = await Promise.all(
    projectMembers.map(async (projectMember) => {
      const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
      const role = await ProjectRoleRepository.getById(projectMember.project_role_id ?? 0)
      return {
        ...projectMember,
        project,
        role: role?.short_name,
      }
    })
  )

  return existingEvaluation?.project_id === null ? [] : finalProjects
}

export const getAllByFilters = async (
  start_date: string,
  end_date: string,
  name: string,
  project_name: string,
  role: string,
  user_id: number,
  overlap: boolean
) => {
  let userIds: number[] = []
  let projectIds: number[] = []
  const filter = {
    user_id: !isNaN(user_id) ? user_id : undefined,
  }
  const startDate = start_date !== undefined ? new Date(start_date) : undefined
  const endDate = end_date !== undefined ? new Date(end_date) : undefined
  const projectRole = role === "all" ? undefined : role

  if (name !== undefined) {
    const where = constructNameFilter(name)
    const users = await UserRepository.getAllByFilters(where)

    userIds = users.map((user) => user.id)
    if (userIds.length > 0) {
      Object.assign(filter, {
        user_id: {
          in: userIds,
        },
      })
    } else {
      Object.assign(filter, {
        user_id: null,
      })
    }
  }

  if (project_name !== undefined) {
    const projects = await ProjectRepository.getAllByName(project_name)
    projectIds = projects.map((project) => project.id)
    if (projectIds.length > 0) {
      Object.assign(filter, {
        project_id: {
          in: projectIds,
        },
      })
    } else {
      Object.assign(filter, {
        project_id: null,
      })
    }
  }

  if (projectRole !== undefined) {
    Object.assign(filter, {
      project_role_id: parseInt(role),
    })
  }

  if (overlap) {
    if (startDate !== undefined || endDate !== undefined) {
      Object.assign(filter, {
        OR: [
          {
            start_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            end_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            start_date: {
              lte: startDate,
            },
            end_date: {
              gte: startDate,
            },
          },
          {
            start_date: {
              lte: endDate,
            },
            end_date: {
              gte: endDate,
            },
          },
        ],
      })
    }
  } else {
    if (startDate !== undefined || endDate !== undefined) {
      Object.assign(filter, {
        AND: [
          {
            start_date: { gte: startDate },
          },
          {
            end_date: { lte: endDate },
          },
        ],
      })
    }
  }

  const projectMembers = await ProjectMemberRepository.getAllByFilters(filter)

  const finalProjects = await Promise.all(
    projectMembers.map(async (projectMember) => {
      const user = await UserRepository.getById(projectMember.user_id ?? 0)
      const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
      const role = await ProjectRoleRepository.getById(projectMember.project_role_id ?? 0)
      return {
        ...projectMember,
        user,
        project,
        role: role?.name,
      }
    })
  )

  return finalProjects
}

export const create = async (data: ProjectMember, skills: SkillType[]) => {
  const project = await ProjectRepository.getById(data.project_id ?? 0)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const user = await UserRepository.getById(data.user_id ?? 0)

  if (user === null) {
    throw new CustomError("User not found", 400)
  }

  const projectRole = await ProjectRoleRepository.getById(data.project_role_id ?? 0)

  if (projectRole === null) {
    throw new CustomError("Project role not found", 400)
  }

  const projectMember = await ProjectMemberRepository.create(data)

  const projectSkills = await ProjectSkillRepository.getAllByFilters({
    project_id: project.id,
  })

  const projectSkillIds = projectSkills.map((skill) => skill.skill_id)

  await Promise.all(
    skills.map(async (skill, index) => {
      if (skill.id == null || !projectSkillIds.includes(skill.id)) {
        throw new CustomError(`Some skills do not exist in ${project.name}'s project skills.`, 400)
      }
      const newProjectMemberSkill = {
        sequence_no: index + 1,
        project_member_id: projectMember.id,
        skill_id: skill.id,
        start_date: skill.start_date,
        end_date: skill.end_date,
        created_at: new Date(),
      }
      await ProjectMemberSkillRepository.createMany([newProjectMemberSkill])
    })
  )

  return projectMember
}

export const getById = async (id: number) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  const user = await UserRepository.getById(projectMember.user_id ?? 0)
  const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
  const skills = projectMember.project_member_skills.map((skill) => {
    return {
      ...skill,
      skills: skill.skills,
    }
  })

  return {
    id: projectMember.id,
    user_id: projectMember.user_id,
    project_id: projectMember.project_id,
    project_role_id: projectMember.project_role_id,
    project_member_skills: skills,
    start_date: projectMember.start_date,
    end_date: projectMember.end_date,
    allocation_rate: projectMember.allocation_rate,
    description: project?.description,
    user,
    project,
  }
}

export const update = async (id: number, data: ProjectMember, skills: SkillType[]) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  const project = await ProjectRepository.getById(data.project_id ?? 0)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const user = await UserRepository.getById(data.user_id ?? 0)

  if (user === null) {
    throw new CustomError("User not found", 400)
  }

  const projectRole = await ProjectRoleRepository.getById(data.project_role_id ?? 0)

  if (projectRole === null) {
    throw new CustomError("Project role not found", 400)
  }

  const allProjectMemberSkills = await ProjectMemberSkillRepository.getAllByFilters({
    project_member_id: projectMember.id,
  })

  const selectedSkills = await ProjectMemberSkillRepository.getAllByFilters({
    project_member_id: projectMember.id,
    skill_id: {
      in: skills.filter((skill) => skill.id !== undefined).map((skill) => Number(skill.id)),
    },
  })
  const selectedSkillIds = selectedSkills.map((skill) => skill.id)
  const projectSkills = await ProjectSkillRepository.getAllByFilters({
    project_id: project.id,
  })
  const projectSkillIds = projectSkills.map((skill) => skill.skill_id)

  await Promise.all(
    allProjectMemberSkills.map(async (skill) => {
      if (!selectedSkillIds.includes(skill.id)) {
        await ProjectMemberSkillRepository.deleteById(skill.id)
      }
    })
  )

  await Promise.all(
    skills.map(async (skill, index) => {
      if (skill.id == null || !projectSkillIds.includes(skill.id)) {
        throw new CustomError(`Some skills do not exist in ${project.name}'s project skills.`, 400)
      }
      const existingProjectMemberSkill = await ProjectMemberSkillRepository.getByFilters({
        skill_id: skill.id,
        project_member_id: projectMember.id,
      })
      if (existingProjectMemberSkill !== null) {
        const updatedProjectMemberSkills = {
          sequence_no: index + 1,
          start_date: skill.start_date,
          end_date: skill.end_date,
        }
        await ProjectMemberSkillRepository.updateById(
          existingProjectMemberSkill.id,
          updatedProjectMemberSkills
        )
      } else {
        const newProjectMemberSkill = {
          sequence_no: index + 1,
          project_member_id: projectMember.id,
          skill_id: skill.id,
          start_date: skill.start_date,
          end_date: skill.end_date,
          created_at: new Date(),
        }
        await ProjectMemberSkillRepository.createMany([newProjectMemberSkill])
      }
    })
  )

  return await ProjectMemberRepository.update(id, data)
}

export const deleteById = async (id: number) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  await ProjectMemberRepository.deleteById(id)
}
