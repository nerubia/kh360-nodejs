import { type Prisma } from "@prisma/client"
import * as ClienRepository from "../repositories/client-repository"
import * as ContractRepository from "../repositories/contract-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectSkillRepository from "../repositories/project-skill-repository"
import CustomError from "../utils/custom-error"
import { ProjectStatus } from "../types/project-type"

export const getById = async (id: number) => {
  return await ProjectRepository.getById(id)
}

export const getAllByFilters = async (name: string) => {
  const where = {
    name: {
      contains: name,
    },
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
  const itemsPerPage = 20
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
    const clients = await ClienRepository.getAllByName(client)
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
      const client = await ClienRepository.getById(project.client_id ?? 0)
      return {
        ...project,
        client,
      }
    })
  )

  const pageInfo = {
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

  const contactCounts = await ContractRepository.countByFilters({
    project_id: project.id,
  })

  if (project.status === ProjectStatus.Closed || projectMemberCounts > 0 || contactCounts > 0) {
    await ProjectRepository.softDeleteById(project.id)
  } else {
    await ProjectRepository.deleteById(project.id)
  }
}
