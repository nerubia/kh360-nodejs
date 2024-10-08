import { type Prisma } from "@prisma/client"
import * as ClientRepository from "../repositories/client-repository"
import * as ContractRepository from "../repositories/contract-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import * as ProjectSkillRepository from "../repositories/project-skill-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ProjectMemberSkillRepository from "../repositories/project-member-skill-repository"
import CustomError from "../utils/custom-error"
import { type Project, ProjectStatus } from "../types/project-type"

export const getById = async (id: number) => {
  const project = await ProjectRepository.getById(id)
  if (project === null) {
    throw new CustomError("Project not found", 400)
  }
  const project_skills = await ProjectSkillRepository.getAllByProjectId(project?.id ?? 0)
  const project_members = await ProjectMemberRepository.getAllByFilters({
    project_id: project?.id ?? 0,
  })
  const allProjectSkills = project_skills.map((skill) => {
    return {
      ...skill.skills,
      sequence_no: skill.sequence_no,
    }
  })

  const finalProjectMembers = await Promise.all(
    project_members.map(async (projectMember) => {
      const user = await UserRepository.getById(projectMember.user_id ?? 0)
      const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
      const role = await ProjectRoleRepository.getById(projectMember.project_role_id ?? 0)
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
        role: role?.name,
      }
    })
  )

  const client = await ClientRepository.getById(project?.client_id ?? 0)

  if (client !== null) {
    Object.assign(project, {
      client,
    })
  }

  return {
    ...project,
    project_skills: allProjectSkills,
    project_members: finalProjectMembers,
  }
}

export const getAllByFilters = async (name: string, client_id: number) => {
  const where: Prisma.projectsWhereInput = {
    name: {
      contains: name,
    },
  }

  if (!isNaN(client_id)) {
    Object.assign(where, {
      client_id,
    })
  }

  return await ProjectRepository.getAllByFilters(where)
}

export const getAllStatus = async () => {
  return await ProjectRepository.getAllStatus()
}

export const paginateByFilters = async (
  name?: string,
  client?: string,
  skills?: string,
  status?: string,
  page?: string
) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page as string)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.projectsWhereInput = {
    deleted_at: null,
  }

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (client !== undefined) {
    const clients = await ClientRepository.getAllByName(client)
    const clientids = clients.map((c) => c.id)
    Object.assign(where, {
      client_id: {
        in: clientids,
      },
    })
  }

  if (skills !== undefined) {
    const projectSkills = await ProjectSkillRepository.getAllBySkillName(skills)
    const projectIds = projectSkills.map((projectSkill) => projectSkill.project_id)
    Object.assign(where, {
      id: {
        in: projectIds,
      },
    })
  }

  if (status !== undefined && status !== "all") {
    Object.assign(where, {
      status,
    })
  }

  const totalItems = await ProjectRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const projects = await ProjectRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const finalProjects = await Promise.all(
    projects.map(async (project) => {
      const client = await ClientRepository.getById(project.client_id ?? 0)
      return {
        ...project,
        client,
      }
    })
  )

  const pageInfo = {
    currentPage,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: finalProjects,
    pageInfo,
  }
}

export const create = async (data: Project, skill_ids: string[]) => {
  const project = await ProjectRepository.getByName(data.name?.trim() as string)

  if (project !== null) {
    throw new CustomError("Project name should be unique", 400)
  }

  const newProject = await ProjectRepository.create(data)

  const newProjectSkills = skill_ids.map((skillId, index) => {
    return {
      sequence_no: index + 1,
      project_id: newProject.id,
      skill_id: parseInt(skillId),
    }
  })

  await ProjectSkillRepository.createMany(newProjectSkills)

  return newProject
}

export const updateById = async (id: number, data: Project, skill_ids: number[]) => {
  const { name } = data

  if (name == null) {
    throw new CustomError("Project name is required", 400)
  }

  const project = await ProjectRepository.getById(id)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const existingProject = await ProjectRepository.getByName(name.trim())

  if (existingProject !== null) {
    if (project.id !== existingProject.id) {
      throw new CustomError("Project name should be unique", 400)
    }
  }

  const removeExtraSpace = {
    ...data,
    name: name.trim(),
  }

  const updatedProject = await ProjectRepository.updateById(project.id, removeExtraSpace)

  const allProjectSkills = await ProjectSkillRepository.getAllByProjectId(project.id)
  const selectedSkills = await ProjectSkillRepository.getAllByFilters({
    project_id: project.id,
    skill_id: {
      in: skill_ids,
    },
  })
  const selectedSkillIds = selectedSkills.map((skill) => skill.id)
  await Promise.all(
    allProjectSkills.map(async (skill) => {
      if (!selectedSkillIds.includes(skill.id)) {
        const projectMembers = await ProjectMemberRepository.getAllByFilters({
          project_id: project.id,
        })
        const projectMemberIds = projectMembers.map((member) => member.id)
        const projectMemberSkills = await ProjectMemberSkillRepository.getAllByFilters({
          skill_id: skill.skills.id,
          project_member_id: {
            in: projectMemberIds,
          },
        })
        if (projectMemberSkills.length > 0) {
          const existingProjectMemberSkills = projectMemberSkills
            .map((member) => member.skills.name)
            .join(", ")
          throw new CustomError(
            `You are not allowed to delete the following skills: ${existingProjectMemberSkills}`,
            400
          )
        }
        await ProjectSkillRepository.deleteById(skill.id)
      }
    })
  )

  await Promise.all(
    skill_ids.map(async (skillId, index) => {
      const existingProjectSkill = await ProjectSkillRepository.getByFilters({
        skill_id: skillId,
        project_id: project.id,
      })
      if (existingProjectSkill !== null) {
        const updatedProjectSkills = {
          sequence_no: index + 1,
        }
        await ProjectSkillRepository.updateById(existingProjectSkill.id, updatedProjectSkills)
      } else {
        const newProjectSkill = {
          sequence_no: index + 1,
          project_id: project.id,
          skill_id: skillId,
        }
        await ProjectSkillRepository.createMany([newProjectSkill])
      }
    })
  )

  return updatedProject
}

export const deleteById = async (id: number) => {
  const project = await ProjectRepository.getById(id)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const activeProjectMemberCounts = await ProjectMemberRepository.countByFilters({
    project_id: project.id,
    OR: [
      {
        start_date: {
          gte: project.start_date ?? new Date(),
          lte: project.end_date ?? new Date(),
        },
      },
      {
        end_date: {
          gte: project.start_date ?? new Date(),
          lte: project.end_date ?? new Date(),
        },
      },
      {
        start_date: { lte: project.start_date ?? new Date() },
        end_date: { gte: project.end_date ?? new Date() },
      },
      {
        start_date: { gte: project.start_date ?? new Date() },
        end_date: { lte: project.end_date ?? new Date() },
      },
    ],
  })

  if (project.status === ProjectStatus.Ongoing || activeProjectMemberCounts > 0) {
    throw new CustomError(
      "Operation not allowed with ongoing status or active project member records.",
      400
    )
  }

  const projectMemberCounts = await ProjectMemberRepository.countByFilters({
    project_id: project.id,
  })

  const contactCounts = await ContractRepository.countAllByFilters({
    project_id: project.id,
  })

  if (project.status === ProjectStatus.Closed || projectMemberCounts > 0 || contactCounts > 0) {
    await ProjectRepository.softDeleteById(project.id)
  } else {
    await ProjectRepository.deleteById(project.id)
  }
}

export const close = async (id: number) => {
  const project = await ProjectRepository.getById(id)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  if (project.status === ProjectStatus.Closed) {
    throw new CustomError("Project was already closed", 400)
  }

  await ProjectRepository.updateStatusById(project.id, ProjectStatus.Closed)
}
